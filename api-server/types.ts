export type AIIdentity = "cursor" | "codex" | "replit";

export type TaskPriority = "low" | "medium" | "high";

export type TaskStatus =
  | "ready"       // Custom GPT 创建任务
  | "in-progress" // Cursor 开发中
  | "testing"     // Replit 测试中
  | "blocked"     // 阻塞（异常）
  | "done";       // 完成

export interface CreateTaskParams {
  title: string;
  assignee: AIIdentity;
  description?: string;
  priority?: TaskPriority;
  component?: string;
}

export interface TaskFilters {
  status?: TaskStatus;
  state?: "open" | "closed" | "all";
}

export interface NotifyTaskCompleteParams {
  taskId: string;
  title: string;
  completedBy: AIIdentity;
  branch?: string;
  commit?: string;
  files?: string[];
  nextAI?: AIIdentity;
  nextAction?: string;
}

export interface NotifyTaskStatusParams {
  taskId: string;
  title: string;
  oldStatus: string;
  newStatus: string;
  note?: string;
}

export interface NotifyTaskCreatedParams {
  taskId: string;
  title: string;
  assignee: AIIdentity;
  priority?: TaskPriority;
  description?: string;
}

export interface NotifyCommitParams {
  branch: string;
  message: string;
  author: string;
  sha: string;
  url: string;
  filesChanged?: number;
}

export interface NotifyDeploymentParams {
  environment: "production" | "staging" | "testing";
  branch: string;
  commit: string;
  status: "started" | "success" | "failed";
  url?: string;
  duration?: number;
  error?: string;
}

export interface SendSlackMessageParams {
  channel: "coordination" | "cursor" | "codex" | "replit" | "commits";
  text: string;
  blocks?: unknown;
}

export interface SendMessageToAIParams {
  toAI: AIIdentity;
  message: string;
  urgent?: boolean;
}

export interface BroadcastMessageParams {
  message: string;
}


