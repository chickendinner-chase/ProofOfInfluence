import { GitHubClient } from "./github.js";
import { SlackClient } from "./slack.js";
import {
  AIIdentity,
  BroadcastMessageParams,
  CreateTaskParams,
  NotifyDeploymentParams,
  NotifyTaskCompleteParams,
  NotifyTaskCreatedParams,
  NotifyTaskStatusParams,
  NotifyCommitParams,
  SendMessageToAIParams,
  SendSlackMessageParams,
  TaskFilters,
  TaskStatus,
} from "./types.js";

const AI_CHANNEL_MAP: Record<AIIdentity, "cursor" | "codex" | "replit"> = {
  cursor: "cursor",
  codex: "codex",
  replit: "replit",
};

export class CollaborationTools {
  constructor(
    private readonly github: GitHubClient,
    private readonly slack: SlackClient | null,
  ) {}

  async createTask(params: CreateTaskParams) {
    const issue = await this.github.createTask({
      ...params,
      description: params.description ?? "",
    });

    if (this.slack) {
      const notifyPayload: NotifyTaskCreatedParams = {
        taskId: issue.number.toString(),
        title: params.title,
        assignee: params.assignee,
        priority: params.priority,
        description: params.description,
      };

      await this.slack.notifyTaskCreated(notifyPayload);
    }

    return issue;
  }

  async listTasksForAI(ai: AIIdentity, filters: TaskFilters = {}) {
    return this.github.listTasks({
      assignee: ai,
      status: filters.status as TaskStatus | undefined,
      state: filters.state,
    });
  }

  async listTasks(filters: TaskFilters = {}) {
    return this.github.listTasks({
      status: filters.status,
      state: filters.state,
    });
  }

  async getTask(issueNumber: number) {
    return this.github.getTask(issueNumber);
  }

  async updateTaskStatus(
    issueNumber: number,
    status: TaskStatus,
  ) {
    return this.github.updateTaskStatus(issueNumber, status);
  }

  async addTaskComment(issueNumber: number, comment: string) {
    return this.github.addComment(issueNumber, comment);
  }

  async notifyTaskComplete(params: NotifyTaskCompleteParams) {
    if (!this.slack) return null;
    return this.slack.notifyTaskCompleted(params);
  }

  async notifyTaskStatusUpdate(params: NotifyTaskStatusParams) {
    if (!this.slack) return null;
    return this.slack.notifyTaskStatusUpdate(
      params.taskId,
      params.title,
      params.oldStatus,
      params.newStatus,
      params.note,
    );
  }

  async notifyDeployment(params: NotifyDeploymentParams) {
    if (!this.slack) return null;
    return this.slack.notifyDeployment(params);
  }

  async notifyCommit(params: NotifyCommitParams) {
    if (!this.slack) return null;
    return this.slack.notifyCommit({
      ...params,
      filesChanged: params.filesChanged ?? 0,
    });
  }

  async sendSlackMessage(params: SendSlackMessageParams) {
    if (!this.slack) return null;
    return this.slack.sendToChannel(params.channel, params.text, params.blocks);
  }

  async sendMessageToAI(params: SendMessageToAIParams) {
    if (!this.slack) return null;
    const channel = AI_CHANNEL_MAP[params.toAI];
    const prefix = params.urgent ? "🚨 **URGENT** 🚨\n\n" : "";
    return this.slack.sendToChannel(
      channel,
      `${prefix}${params.message}`,
    );
  }

  async broadcastToCoordination(params: BroadcastMessageParams) {
    if (!this.slack) return null;
    return this.slack.sendToChannel("coordination", params.message);
  }

  async getProjectStatus() {
    return this.github.getProjectStatus();
  }
}


