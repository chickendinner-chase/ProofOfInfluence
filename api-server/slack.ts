import https from 'https';

export interface SlackMessage {
  channel: string;
  text: string;
}

export class SlackClient {
  private botToken: string;
  private channels: any;

  constructor(botToken: string, channels: any) {
    this.botToken = botToken;
    this.channels = channels;
  }

  async sendMessage(message: SlackMessage): Promise<any> {
    const payload = JSON.stringify({
      channel: message.channel,
      text: message.text
    });

    const options = {
      hostname: 'slack.com',
      path: '/api/chat.postMessage',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${this.botToken}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.ok) {
              console.log('✅ Slack message sent successfully:', message.text);
              resolve(response);
            } else {
              console.error('❌ Slack API error:', response.error);
              reject(new Error(`Slack API error: ${response.error}`));
            }
          } catch (error) {
            console.error('❌ Failed to parse Slack response:', error);
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ Slack request failed:', error);
        reject(error);
      });

      req.write(payload);
      req.end();
    });
  }

  async sendToChannel(channelName: string, text: string, blocks?: any): Promise<void> {
    const channelId = this.channels[channelName];
    if (!channelId) {
      throw new Error(`Channel ${channelName} not configured`);
    }

    await this.sendMessage({
      channel: channelId,
      text
    });
  }

  async notifyTaskCreated(task: {
    taskId: string;
    title: string;
    assignee: string;
    priority?: string;
    description?: string;
  }): Promise<void> {
    const channelName = task.assignee === 'cursor' ? 'cursor' : task.assignee === 'codex' ? 'codex' : 'replit';
    const text = `📋 新任务 #${task.taskId}
**${task.title}**
分配给：${task.assignee}
${task.priority ? `优先级：${task.priority}` : ''}
${task.description ? `\n${task.description}` : ''}`;

    await this.sendToChannel(channelName, text);
    await this.sendToChannel('coordination', `✅ 任务 #${task.taskId} 已创建并分配给 ${task.assignee}`);
  }

  async notifyTaskCompleted(task: {
    taskId: string;
    title: string;
    completedBy: string;
    branch?: string;
    commit?: string;
    files?: string[];
    nextAI?: string;
    nextAction?: string;
  }): Promise<void> {
    let text = `✅ 任务完成 #${task.taskId}
**${task.title}**
完成者：${task.completedBy}`;

    if (task.branch) text += `\n分支：${task.branch}`;
    if (task.commit) text += `\n提交：${task.commit}`;
    if (task.files && task.files.length > 0) text += `\n文件：${task.files.join(', ')}`;
    if (task.nextAI) text += `\n\n🔄 下一步：${task.nextAI}`;
    if (task.nextAction) text += `\n操作：${task.nextAction}`;

    await this.sendToChannel('coordination', text);
    
    const completedByChannel = task.completedBy === 'cursor' ? 'cursor' : task.completedBy === 'codex' ? 'codex' : 'replit';
    await this.sendToChannel(completedByChannel, `✅ 你的任务 #${task.taskId} 已标记为完成`);
  }

  async notifyTaskStatusUpdate(
    taskId: string,
    title: string,
    oldStatus: string,
    newStatus: string,
    note?: string
  ): Promise<void> {
    const text = `🔄 任务状态更新 #${taskId}
**${title}**
${oldStatus} → ${newStatus}
${note ? `\n备注：${note}` : ''}`;

    await this.sendToChannel('coordination', text);
  }

  async notifyDeployment(deployment: {
    environment: string;
    branch: string;
    commit: string;
    status: 'started' | 'success' | 'failed';
    url?: string;
    duration?: number;
    error?: string;
  }): Promise<void> {
    const emoji = deployment.status === 'success' ? '✅' : deployment.status === 'failed' ? '❌' : '🚀';
    let text = `${emoji} 部署 ${deployment.status}
环境：${deployment.environment}
分支：${deployment.branch}
提交：${deployment.commit}`;

    if (deployment.url) text += `\nURL：${deployment.url}`;
    if (deployment.duration) text += `\n耗时：${deployment.duration}s`;
    if (deployment.error) text += `\n错误：${deployment.error}`;

    await this.sendToChannel('replit', text);
    await this.sendToChannel('coordination', text);
  }

  async notifyCommit(commit: {
    branch: string;
    message: string;
    author: string;
    sha: string;
    url: string;
    filesChanged: number;
  }): Promise<void> {
    const text = `📝 新提交到 ${commit.branch}
**${commit.message}**
作者：${commit.author}
SHA：${commit.sha.substring(0, 7)}
文件：${commit.filesChanged} 个
${commit.url}`;

    await this.sendToChannel('commits', text);
  }
}
