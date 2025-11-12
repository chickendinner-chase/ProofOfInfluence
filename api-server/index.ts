import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GitHubClient } from './github.js';
import { SlackClient } from './slack.js';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'https://chatgpt.com',           // Custom GPT direct access
    'http://localhost:5000',         // Local main app proxy
    'http://localhost:3000',         // Development environment
    /\.replit\.dev$/,                // All Replit dev domains
    /\.replit\.app$/                 // Replit production domains
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));        // Increase body size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Authentication middleware
const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.API_SECRET_KEY;

  if (!expectedToken) {
    return res.status(500).json({ error: 'API_SECRET_KEY not configured' });
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);
  if (token !== expectedToken) {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  next();
};

// Initialize GitHub client
const githubToken = process.env.GITHUB_TOKEN;
if (!githubToken) {
  console.error('GITHUB_TOKEN not set in environment');
  process.exit(1);
}

const github = new GitHubClient(githubToken);

// Initialize Slack client (optional - only if Slack integration is enabled)
let slack: SlackClient | null = null;
const slackToken = process.env.SLACK_BOT_TOKEN;
const slackChannels = {
  coordination: process.env.SLACK_CHANNEL_COORDINATION || 'C01234567',
  cursor: process.env.SLACK_CHANNEL_CURSOR || 'C01234568',
  codex: process.env.SLACK_CHANNEL_CODEX || 'C01234569',
  replit: process.env.SLACK_CHANNEL_REPLIT || 'C01234570',
  commits: process.env.SLACK_CHANNEL_COMMITS || 'C01234571'
};

if (slackToken) {
  slack = new SlackClient(slackToken, slackChannels);
  console.log('✅ Slack integration enabled');
} else {
  console.log('⚠️  Slack integration disabled (SLACK_BOT_TOKEN not set)');
}

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ProofOfInfluence API Server' });
});

// Serve OpenAPI schema (no auth required for Custom GPT discovery)
app.get('/.well-known/openapi.yaml', express.static('openapi.yaml'));
app.get('/openapi.yaml', (req, res) => {
  res.sendFile('openapi.yaml', { root: '.' });
});

// Protected API endpoints
app.use('/api', authenticate);

// ✅ In-memory task status tracking (简单版本)
const taskStatus = new Map<string, {
  status: 'processing' | 'completed' | 'failed';
  taskId?: string;
  issueNumber?: number;
  issueUrl?: string;
  error?: string;
  createdAt: Date;
}>();

/**
 * POST /api/tasks/create
 * Create a new GitHub Issue for AI task (ASYNC)
 * 
 * Returns immediately with 202 Accepted + taskId
 * Processes GitHub + Slack in background
 */
app.post('/api/tasks/create', async (req, res) => {
  try {
    const { title, assignee, description, priority, component } = req.body;

    if (!title || !assignee) {
      return res.status(400).json({ error: 'title and assignee are required' });
    }

    if (!['cursor', 'codex', 'replit'].includes(assignee)) {
      return res.status(400).json({ error: 'assignee must be cursor, codex, or replit' });
    }

    // ✅ 生成任务 ID
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // ✅ 立即返回 202 Accepted
    taskStatus.set(taskId, {
      status: 'processing',
      taskId,
      createdAt: new Date()
    });

    console.log(`📋 Task ${taskId} accepted, processing in background...`);

    res.status(202).json({
      status: 'accepted',
      message: '任务已接收，正在后台处理',
      taskId,
      statusUrl: `/api/tasks/status/${taskId}`,
      note: 'GitHub Issue 正在创建中，请稍后查询状态或查看 GitHub'
    });

    // ✅ 异步处理（不阻塞响应）
    setImmediate(async () => {
      try {
        console.log(`🔄 Processing task ${taskId}...`);
        
        // 创建 GitHub Issue
        const result = await github.createTask({
          title,
          assignee,
          description: description || '',
          priority,
          component
        });

        console.log(`✅ GitHub Issue #${result.number} created for task ${taskId}`);

        // 更新状态
        taskStatus.set(taskId, {
          status: 'completed',
          taskId,
          issueNumber: result.number,
          issueUrl: result.url,
          createdAt: taskStatus.get(taskId)!.createdAt
        });

        // 发送 Slack 通知（不影响主流程）
        if (slack) {
          try {
            await slack.notifyTaskCreated({
              taskId: result.number.toString(),
              title,
              assignee,
              priority,
              description
            });
            console.log(`💬 Slack notification sent for task ${taskId}`);
          } catch (slackError: any) {
            console.error(`⚠️  Slack notification failed for task ${taskId}:`, slackError.message);
          }
        }

      } catch (error: any) {
        console.error(`❌ Task ${taskId} failed:`, error.message);
        
        // 更新为失败状态
        taskStatus.set(taskId, {
          status: 'failed',
          taskId,
          error: error.message,
          createdAt: taskStatus.get(taskId)!.createdAt
        });
      }
    });

  } catch (error: any) {
    console.error('Error accepting task:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tasks/status/:taskId
 * Query async task status
 */
app.get('/api/tasks/status/:taskId', (req, res) => {
  const { taskId } = req.params;
  const status = taskStatus.get(taskId);

  if (!status) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json(status);
});

/**
 * GET /api/tasks/list
 * List tasks filtered by assignee and/or status
 */
app.get('/api/tasks/list', async (req, res) => {
  try {
    const { assignee, status, state } = req.query;

    const tasks = await github.listTasks({
      assignee: assignee as any,
      status: status as any,
      state: state as any
    });

    res.json({ tasks, count: tasks.length });
  } catch (error: any) {
    console.error('Error listing tasks:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tasks/:id
 * Get task details
 */
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const issueNumber = parseInt(req.params.id);
    
    if (isNaN(issueNumber)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    const task = await github.getTask(issueNumber);
    res.json(task);
  } catch (error: any) {
    console.error('Error getting task:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/tasks/:id/status
 * Update task status
 */
app.patch('/api/tasks/:id/status', async (req, res) => {
  try {
    const issueNumber = parseInt(req.params.id);
    const { status } = req.body;

    if (isNaN(issueNumber)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }

    const result = await github.updateTaskStatus(issueNumber, status);
    res.json(result);
  } catch (error: any) {
    console.error('Error updating task status:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/tasks/:id/comment
 * Add comment to task
 */
app.post('/api/tasks/:id/comment', async (req, res) => {
  try {
    const issueNumber = parseInt(req.params.id);
    const { comment } = req.body;

    if (isNaN(issueNumber)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    if (!comment) {
      return res.status(400).json({ error: 'comment is required' });
    }

    const result = await github.addComment(issueNumber, comment);
    res.json(result);
  } catch (error: any) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/project/status
 * Get overall project status
 */
app.get('/api/project/status', async (req, res) => {
  try {
    const status = await github.getProjectStatus();
    res.json(status);
  } catch (error: any) {
    console.error('Error getting project status:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/slack/task/complete
 * Send task completion notification to Slack
 */
app.post('/api/slack/task/complete', async (req, res) => {
  if (!slack) {
    return res.status(503).json({ error: 'Slack integration not enabled' });
  }

  try {
    const { taskId, title, completedBy, branch, commit, files, nextAI, nextAction } = req.body;

    if (!taskId || !title || !completedBy) {
      return res.status(400).json({ error: 'taskId, title, and completedBy are required' });
    }

    await slack.notifyTaskCompleted({
      taskId,
      title,
      completedBy,
      branch,
      commit,
      files,
      nextAI,
      nextAction
    });

    res.json({ success: true, message: 'Task completion notification sent' });
  } catch (error: any) {
    console.error('Error sending Slack notification:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/slack/task/status
 * Send task status update notification to Slack
 */
app.post('/api/slack/task/status', async (req, res) => {
  if (!slack) {
    return res.status(503).json({ error: 'Slack integration not enabled' });
  }

  try {
    const { taskId, title, oldStatus, newStatus, note } = req.body;

    if (!taskId || !title || !oldStatus || !newStatus) {
      return res.status(400).json({ error: 'taskId, title, oldStatus, and newStatus are required' });
    }

    await slack.notifyTaskStatusUpdate(taskId, title, oldStatus, newStatus, note);

    res.json({ success: true, message: 'Status update notification sent' });
  } catch (error: any) {
    console.error('Error sending Slack notification:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/slack/deployment
 * Send deployment notification to Slack
 */
app.post('/api/slack/deployment', async (req, res) => {
  if (!slack) {
    return res.status(503).json({ error: 'Slack integration not enabled' });
  }

  try {
    const { environment, branch, commit, status, url, duration, error } = req.body;

    if (!environment || !branch || !commit || !status) {
      return res.status(400).json({ error: 'environment, branch, commit, and status are required' });
    }

    if (!['production', 'staging', 'testing'].includes(environment)) {
      return res.status(400).json({ error: 'environment must be production, staging, or testing' });
    }

    if (!['started', 'success', 'failed'].includes(status)) {
      return res.status(400).json({ error: 'status must be started, success, or failed' });
    }

    await slack.notifyDeployment({
      environment,
      branch,
      commit,
      status,
      url,
      duration,
      error
    });

    res.json({ success: true, message: 'Deployment notification sent' });
  } catch (err: any) {
    console.error('Error sending Slack notification:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/slack/commit
 * Send commit notification to Slack
 */
app.post('/api/slack/commit', async (req, res) => {
  if (!slack) {
    return res.status(503).json({ error: 'Slack integration not enabled' });
  }

  try {
    const { branch, message, author, sha, url, filesChanged } = req.body;

    if (!branch || !message || !author || !sha || !url) {
      return res.status(400).json({ error: 'branch, message, author, sha, and url are required' });
    }

    await slack.notifyCommit({
      branch,
      message,
      author,
      sha,
      url,
      filesChanged: filesChanged || 0
    });

    res.json({ success: true, message: 'Commit notification sent' });
  } catch (error: any) {
    console.error('Error sending Slack notification:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/slack/message
 * Send a custom message to a Slack channel
 */
app.post('/api/slack/message', async (req, res) => {
  if (!slack) {
    return res.status(503).json({ error: 'Slack integration not enabled' });
  }

  try {
    const { channel, text, blocks } = req.body;

    if (!channel || !text) {
      return res.status(400).json({ error: 'channel and text are required' });
    }

    if (!['coordination', 'cursor', 'codex', 'replit', 'commits'].includes(channel)) {
      return res.status(400).json({ error: 'invalid channel' });
    }

    await slack.sendToChannel(channel, text, blocks);

    res.json({ success: true, message: 'Message sent to Slack' });
  } catch (error: any) {
    console.error('Error sending Slack message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`📋 GitHub Endpoints:`);
  console.log(`   POST  /api/tasks/create`);
  console.log(`   GET   /api/tasks/list`);
  console.log(`   GET   /api/tasks/:id`);
  console.log(`   PATCH /api/tasks/:id/status`);
  console.log(`   POST  /api/tasks/:id/comment`);
  console.log(`   GET   /api/project/status`);
  
  if (slack) {
    console.log(`💬 Slack Endpoints:`);
    console.log(`   POST  /api/slack/task/complete`);
    console.log(`   POST  /api/slack/task/status`);
    console.log(`   POST  /api/slack/deployment`);
    console.log(`   POST  /api/slack/commit`);
    console.log(`   POST  /api/slack/message`);
  }
});

export default app;
