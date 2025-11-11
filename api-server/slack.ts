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
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ Failed to send Slack message:', error);
        reject(error);
      });

      req.write(payload);
      req.end();
    });
  }

  async notifyTaskCreated(task: any): Promise<any> {
    return this.sendMessage({
      channel: this.channels.coordination,
      text: `New task created: ${task.title}`
    });
  }

  async notifyTaskCompleted(task: any): Promise<any> {
    return this.sendMessage({
      channel: this.channels.coordination,
      text: `Task completed: ${task.title}`
    });
  }

  async notifyDeployment(deployment: any): Promise<any> {
    return this.sendMessage({
      channel: this.channels.replit,
      text: `Deployment: ${deployment.status}`
    });
  }

  async notifyCommit(commit: any): Promise<any> {
    return this.sendMessage({
      channel: this.channels.commits,
      text: `New commit: ${commit.message}`
    });
  }

  async sendToChannel(channel: string, text: string, blocks?: any): Promise<any> {
    return this.sendMessage({
      channel: this.channels[channel],
      text
    });
  }

  async notifyTaskStatusUpdate(taskId: string, title: string, oldStatus: string, newStatus: string, note?: string): Promise<any> {
    return this.sendMessage({
      channel: this.channels.coordination,
      text: `Task ${taskId} status: ${oldStatus} -> ${newStatus}`
    });
  }
}
