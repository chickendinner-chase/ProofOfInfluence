import { Octokit } from '@octokit/rest';

const OWNER = 'acee-chase';
const REPO = 'ProofOfInfluence';

export class GitHubClient {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ 
      auth: token,
      request: {
        timeout: 15000  // ✅ 15 秒超时
      }
    });
  }

  /**
   * Create a GitHub Issue with AI assignment
   */
  async createTask(params: {
    title: string;
    assignee: 'cursor' | 'codex' | 'replit';
    description: string;
    priority?: 'low' | 'medium' | 'high';
    component?: string;
  }) {
    try {
      console.log('🔍 Creating GitHub Issue...');
      console.log('   Title:', params.title);
      console.log('   Assignee:', params.assignee);
      
      // ✅ 使用统一的 ai: 前缀和初始状态
      const labels = [`ai:${params.assignee}`, 'status:ready'];
      
      if (params.priority) {
        labels.push(params.priority);
      }

      if (params.component) {
        labels.push(params.component);
      }

      console.log('   Labels:', labels);

      const issue = await this.octokit.issues.create({
        owner: OWNER,
        repo: REPO,
        title: `[${params.assignee.toUpperCase()}] ${params.title}`,
        body: params.description,
        labels
      });

      console.log('✅ Issue created:', issue.data.number, issue.data.html_url);

      return {
        number: issue.data.number,
        url: issue.data.html_url,
        title: issue.data.title,
        assignee: params.assignee
      };
    } catch (error: any) {
      console.error('❌ GitHub API Error:');
      console.error('   Status:', error.status);
      console.error('   Message:', error.message);
      if (error.response?.data) {
        console.error('   Response:', JSON.stringify(error.response.data, null, 2));
      }
      
      throw new Error(`GitHub API failed: ${error.message}`);
    }
  }

  /**
   * List tasks filtered by assignee and/or status
   */
  async listTasks(params: {
    assignee?: 'cursor' | 'codex' | 'replit';
    status?: 'ready' | 'in-progress' | 'needs-review' | 'blocked' | 'done';
    state?: 'open' | 'closed' | 'all';
  } = {}) {
    const labels: string[] = [];
    
    if (params.assignee) {
      labels.push(`ai:${params.assignee}`);
    }
    
    if (params.status) {
      labels.push(`status:${params.status}`);
    }

    const issues = await this.octokit.issues.listForRepo({
      owner: OWNER,
      repo: REPO,
      state: params.state || 'open',
      labels: labels.join(','),
      per_page: 50
    });

    return issues.data.map(issue => ({
      number: issue.number,
      title: issue.title,
      url: issue.html_url,
      state: issue.state,
      labels: issue.labels.map(l => typeof l === 'string' ? l : l.name),
      created_at: issue.created_at,
      updated_at: issue.updated_at
    }));
  }

  /**
   * Get task details
   */
  async getTask(issueNumber: number) {
    const issue = await this.octokit.issues.get({
      owner: OWNER,
      repo: REPO,
      issue_number: issueNumber
    });

    const comments = await this.octokit.issues.listComments({
      owner: OWNER,
      repo: REPO,
      issue_number: issueNumber
    });

    return {
      number: issue.data.number,
      title: issue.data.title,
      body: issue.data.body,
      url: issue.data.html_url,
      state: issue.data.state,
      labels: issue.data.labels.map(l => typeof l === 'string' ? l : l.name),
      comments: comments.data.map(c => ({
        author: c.user?.login,
        body: c.body,
        created_at: c.created_at
      })),
      created_at: issue.data.created_at,
      updated_at: issue.data.updated_at
    };
  }

  /**
   * Update task status by changing labels
   */
  async updateTaskStatus(issueNumber: number, newStatus: string) {
    const issue = await this.octokit.issues.get({
      owner: OWNER,
      repo: REPO,
      issue_number: issueNumber
    });

    // Remove old status labels
    const currentLabels = issue.data.labels
      .map(l => typeof l === 'string' ? l : l.name || '')
      .filter(l => !l.startsWith('status:'));

    // Add new status
    const updatedLabels = [...currentLabels, `status:${newStatus}`];

    await this.octokit.issues.update({
      owner: OWNER,
      repo: REPO,
      issue_number: issueNumber,
      labels: updatedLabels
    });

    return { success: true, status: newStatus };
  }

  /**
   * Add comment to task
   */
  async addComment(issueNumber: number, comment: string) {
    const result = await this.octokit.issues.createComment({
      owner: OWNER,
      repo: REPO,
      issue_number: issueNumber,
      body: comment
    });

    return {
      success: true,
      comment_url: result.data.html_url
    };
  }

  /**
   * 重新分配任务给新的 AI
   * 移除旧的 ai: 标签，添加新的 ai: 标签
   */
  async reassignTask(issueNumber: number, newAssignee: 'cursor' | 'codex' | 'replit', newStatus?: string) {
    const issue = await this.octokit.issues.get({
      owner: OWNER,
      repo: REPO,
      issue_number: issueNumber
    });

    const currentLabels = issue.data.labels
      .map(l => typeof l === 'string' ? l : l.name || '')
      .filter(l => !l.startsWith('ai:') && !l.startsWith('status:'));

    // 添加新的 AI 和状态标签
    const updatedLabels = [
      ...currentLabels,
      `ai:${newAssignee}`,
      `status:${newStatus || 'ready'}`
    ];

    await this.octokit.issues.update({
      owner: OWNER,
      repo: REPO,
      issue_number: issueNumber,
      labels: updatedLabels
    });

    return { success: true, assignee: newAssignee, status: newStatus || 'ready' };
  }

  /**
   * Get project status summary
   */
  async getProjectStatus() {
    const allIssues = await this.octokit.issues.listForRepo({
      owner: OWNER,
      repo: REPO,
      state: 'all',
      per_page: 100
    });

    const summary = {
      total: allIssues.data.length,
      open: 0,
      closed: 0,
      by_ai: {
        cursor: { total: 0, open: 0, in_progress: 0 },
        codex: { total: 0, open: 0, in_progress: 0 },
        replit: { total: 0, open: 0, in_progress: 0 }
      }
    };

    allIssues.data.forEach(issue => {
      if (issue.state === 'open') summary.open++;
      else summary.closed++;

      const labels = issue.labels.map(l => typeof l === 'string' ? l : l.name || '');
      
      ['cursor', 'codex', 'replit'].forEach(ai => {
        if (labels.includes(`ai:${ai}`)) {
          summary.by_ai[ai as keyof typeof summary.by_ai].total++;
          if (issue.state === 'open') {
            summary.by_ai[ai as keyof typeof summary.by_ai].open++;
          }
          if (labels.includes('status:in-progress')) {
            summary.by_ai[ai as keyof typeof summary.by_ai].in_progress++;
          }
        }
      });
    });

    return summary;
  }
}

