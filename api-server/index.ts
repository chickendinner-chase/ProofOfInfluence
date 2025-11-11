import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GitHubClient } from './github.js';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors({
  origin: 'https://chatgpt.com',
  credentials: true
}));
app.use(express.json());

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

/**
 * POST /api/tasks/create
 * Create a new GitHub Issue for AI task
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

    const result = await github.createTask({
      title,
      assignee,
      description: description || '',
      priority,
      component
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: error.message });
  }
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`📋 Endpoints:`);
  console.log(`   POST /api/tasks/create`);
  console.log(`   GET  /api/tasks/list`);
  console.log(`   GET  /api/tasks/:id`);
  console.log(`   PATCH /api/tasks/:id/status`);
  console.log(`   POST /api/tasks/:id/comment`);
  console.log(`   GET  /api/project/status`);
});

export default app;

