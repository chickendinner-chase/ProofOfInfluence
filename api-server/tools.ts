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

  /**
   * 领取指定任务
   * 更新状态为 in-progress，添加开始工作的评论
   */
  async claimTask(ai: AIIdentity, taskId: number) {
    // 获取任务详情
    const task = await this.github.getTask(taskId);
    
    // 更新状态为 in-progress
    await this.github.updateTaskStatus(taskId, "in-progress");
    
    // 添加开始工作的评论
    await this.github.addComment(
      taskId,
      `🤖 ${ai} started`
    );
    
    // Slack 通知状态变更
    if (this.slack) {
      await this.slack.notifyTaskStatusUpdate(
        taskId.toString(),
        task.title,
        "ready",
        "in-progress",
        `${ai} 已领取任务`
      );
    }
    
    return {
      taskId,
      title: task.title,
      status: "in-progress",
    };
  }

  /**
   * 自动查询并开始第一个待处理任务
   */
  async startMyWork(ai: AIIdentity) {
    // 查询状态为 ready 的任务
    const readyTasks = await this.github.listTasks({
      assignee: ai,
      status: "ready",
      state: "open",
    });

    if (readyTasks.length === 0) {
      // Slack 通知：没有待办任务
      if (this.slack) {
        await this.slack.sendToChannel(
          ai,
          `ℹ️ No ready tasks`
        );
      }
      return {
        started: false,
        message: `No ready tasks found for ${ai}`,
        tasks: [],
      };
    }

    // 领取第一个任务
    const task = readyTasks[0];
    await this.claimTask(ai, task.number);

    // Slack 通知：开始工作
    if (this.slack) {
      await this.slack.sendToChannel(
        "coordination",
        `🚀 ${ai} started #${task.number}`
      );
    }

    return {
      started: true,
      message: `Started task #${task.number}: ${task.title}`,
      task: {
        taskId: task.number,
        title: task.title,
        url: task.url,
      },
    };
  }

  /**
   * 完成当前任务并交接给下一个 AI
   */
  async completeAndHandoff(
    ai: AIIdentity,
    params: {
      taskId?: number;
      nextAI: AIIdentity;
      message?: string;
    }
  ) {
    let taskId = params.taskId;

    // 如果没有指定 taskId，查找当前 in-progress 的任务
    if (!taskId) {
      const inProgressTasks = await this.github.listTasks({
        assignee: ai,
        status: "in-progress",
        state: "open",
      });

      if (inProgressTasks.length === 0) {
        throw new Error(`No in-progress tasks found for ${ai}`);
      }

      taskId = inProgressTasks[0].number;
    }

    // 获取任务详情
    const task = await this.github.getTask(taskId);

    // 重新分配任务给下一个 AI，并设置状态为 ready
    await this.github.reassignTask(taskId, params.nextAI, "ready");

    // 添加完成和交接评论
    const handoffMessage = params.message || "ready";
    await this.github.addComment(
      taskId,
      `✅ ${ai} done → @${params.nextAI} ${handoffMessage}`
    );

    // 发送 Slack 通知给下一个 AI
    if (this.slack) {
      await this.slack.sendToChannel(
        params.nextAI,
        `🔔 ${ai}→you #${taskId}: ${handoffMessage}\n${task.url}`
      );

      // 通知协调频道
      await this.slack.sendToChannel(
        "coordination",
        `🔄 ${ai}✅ → ${params.nextAI}🔜 #${taskId}`
      );
      
      // 通知原 AI 频道确认完成
      await this.slack.sendToChannel(
        ai,
        `✅ #${taskId} → ${params.nextAI}`
      );
    }

    return {
      success: true,
      taskId,
      title: task.title,
      handedOffTo: params.nextAI,
    };
  }
}


