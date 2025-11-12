import { randomUUID } from "node:crypto";
import type express from "express";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp";
import type { McpServer as McpServerType } from "@modelcontextprotocol/sdk/server/mcp";
import type { CollaborationTools } from "./tools.js";
import type { AIIdentity, TaskStatus } from "./types.js";

const AI_IDENTITY_VALUES = ["cursor", "codex", "replit"] as const;
const TASK_STATUS_VALUES = [
  "ready",
  "in-progress",
  "needs-review",
  "blocked",
  "done",
] as const;

const aiIdentitySchema = z.enum(AI_IDENTITY_VALUES);
const taskStatusSchema = z.enum(TASK_STATUS_VALUES);
const taskStateSchema = z.enum(["open", "closed", "all"]).optional();

interface CreateServerOptions {
  tools: CollaborationTools;
  serverName?: string;
  serverVersion?: string;
}

const defaultServerInfo = {
  name: "ProofOfInfluence MCP Server",
  version: "1.0.0",
};

function textContent(text: string, structuredContent?: unknown): any {
  return {
    content: [{ type: "text" as const, text }],
    ...(structuredContent !== undefined ? { structuredContent } : {}),
  };
}

function toolError(message: string): any {
  return {
    content: [{ type: "text" as const, text: message }],
    isError: true,
  };
}

function resolveIdentity(
  explicit: AIIdentity | undefined,
  extra: any,
): AIIdentity | undefined {
  if (explicit) return explicit;

  let headerIdentity: string | undefined;
  const headers = extra?.requestInfo?.headers;

  if (headers) {
    if (typeof headers.get === "function") {
      headerIdentity = headers.get("x-ai-identity") ?? undefined;
    } else if (typeof headers === "object") {
      const value = (headers as Record<string, string | string[] | undefined>)[
        "x-ai-identity"
      ];
      if (Array.isArray(value)) {
        headerIdentity = value[0];
      } else if (typeof value === "string") {
        headerIdentity = value;
      }
    }
  }

  if (
    headerIdentity &&
    (AI_IDENTITY_VALUES as readonly string[]).includes(headerIdentity)
  ) {
    return headerIdentity as AIIdentity;
  }

  const envIdentity = process.env.MCP_AI_IDENTITY;
  if (
    envIdentity &&
    (AI_IDENTITY_VALUES as readonly string[]).includes(envIdentity)
  ) {
    return envIdentity as AIIdentity;
  }

  return undefined;
}

export function createMcpServer({
  tools,
  serverName,
  serverVersion,
}: CreateServerOptions): McpServerType {
  const server = new McpServer(
    {
      ...defaultServerInfo,
      ...(serverName ? { name: serverName } : {}),
      ...(serverVersion ? { version: serverVersion } : {}),
    },
    {
      capabilities: {
        logging: {},
        tools: {
          listChanged: true,
        },
      },
    },
  );

  server.registerTool(
    "create_task",
    {
      title: "Create GitHub Task",
      description: "Create a new GitHub issue assigned to a specific AI",
      inputSchema: {
        title: z.string().describe("Task title"),
        assignee: aiIdentitySchema.describe("Assignee AI identity"),
        description: z.string().optional().describe("Task description"),
        priority: z
          .enum(["low", "medium", "high"])
          .optional()
          .describe("Task priority"),
        component: z.string().optional().describe("Component label"),
      },
    },
    async (args, extra: any) => {
      const result = await tools.createTask(args);

      await server.sendLoggingMessage(
        {
          level: "info",
          data: `Task #${result.number} created for ${args.assignee}`,
        },
        extra.sessionId,
      );

      return textContent(
        `Created task #${result.number} assigned to ${args.assignee}`,
        result,
      );
    },
  );

  server.registerTool(
    "get_my_tasks",
    {
      title: "List Tasks for Current AI",
      description:
        "Retrieve GitHub issues assigned to the current AI (or specified assignee)",
      inputSchema: {
        assignee: aiIdentitySchema.optional().describe("AI identity override"),
        status: taskStatusSchema.optional().describe("Task status filter"),
        state: taskStateSchema.describe("GitHub issue state filter"),
      },
    },
    async (args, extra: any) => {
      const identity = resolveIdentity(args.assignee, extra);
      if (!identity) {
        return toolError(
          "AI identity is required. Provide `assignee` argument or set MCP_AI_IDENTITY / X-AI-Identity header.",
        );
      }

      const tasks = await tools.listTasksForAI(identity, {
        status: args.status,
        state: args.state,
      });

      return textContent(
        `Found ${tasks.length} tasks for ${identity}`,
        tasks,
      );
    },
  );

  server.registerTool(
    "list_tasks",
    {
      title: "List Project Tasks",
      description: "Retrieve GitHub issues with optional filters",
      inputSchema: {
        status: taskStatusSchema.optional().describe("Task status filter"),
        state: taskStateSchema.describe("GitHub issue state filter"),
      },
    },
    async (args, _extra: any) => {
      const tasks = await tools.listTasks({
        status: args.status,
        state: args.state,
      });

      return textContent(`Found ${tasks.length} tasks`, tasks);
    },
  );

  server.registerTool(
    "update_task_status",
    {
      title: "Update Task Status",
      description: "Update the status label of a GitHub issue",
      inputSchema: {
        taskId: z.number().describe("GitHub issue number"),
        status: taskStatusSchema.describe("New task status"),
      },
    },
    async ({ taskId, status }, extra: any) => {
      const result = await tools.updateTaskStatus(taskId, status);

      await server.sendLoggingMessage(
        {
          level: "info",
          data: `Updated status for task #${taskId} to ${status}`,
        },
        extra.sessionId,
      );

      return textContent(`Updated task #${taskId} to ${status}`, result);
    },
  );

  server.registerTool(
    "add_task_comment",
    {
      title: "Add Task Comment",
      description: "Add a comment to a GitHub issue",
      inputSchema: {
        taskId: z.number().describe("GitHub issue number"),
        comment: z.string().describe("Comment text"),
      },
    },
    async ({ taskId, comment }, _extra: any) => {
      const result = await tools.addTaskComment(taskId, comment);
      return textContent(`Added comment to task #${taskId}`, result);
    },
  );

  server.registerTool(
    "notify_task_complete",
    {
      title: "Notify Task Completion",
      description: "Send a Slack notification that a task has been completed",
      inputSchema: {
        taskId: z.string().describe("Task identifier"),
        title: z.string().describe("Task title"),
        completedBy: aiIdentitySchema.describe("Completing AI"),
        branch: z.string().optional().describe("Git branch"),
        commit: z.string().optional().describe("Commit SHA"),
        files: z.array(z.string()).optional().describe("Changed files"),
        nextAI: aiIdentitySchema
          .optional()
          .describe("Next AI to hand off the task to"),
        nextAction: z
          .string()
          .optional()
          .describe("Next action instructions"),
      },
    },
    async (args, _extra: any) => {
      await tools.notifyTaskComplete(args);
      return textContent(`Notified completion for task ${args.taskId}`);
    },
  );

  server.registerTool(
    "notify_task_status",
    {
      title: "Notify Task Status Change",
      description: "Send a Slack notification for a task status update",
      inputSchema: {
        taskId: z.string().describe("Task identifier"),
        title: z.string().describe("Task title"),
        oldStatus: z.string().describe("Previous status"),
        newStatus: z.string().describe("New status"),
        note: z.string().optional().describe("Additional note"),
      },
    },
    async (args, _extra: any) => {
      await tools.notifyTaskStatusUpdate(args);
      return textContent(
        `Notified status update for task ${args.taskId} (${args.oldStatus} → ${args.newStatus})`,
      );
    },
  );

  server.registerTool(
    "notify_deployment",
    {
      title: "Notify Deployment",
      description: "Send a Slack deployment notification",
      inputSchema: {
        environment: z
          .enum(["production", "staging", "testing"])
          .describe("Deployment environment"),
        branch: z.string().describe("Git branch"),
        commit: z.string().describe("Commit SHA"),
        status: z
          .enum(["started", "success", "failed"])
          .describe("Deployment status"),
        url: z.string().optional().describe("Deployment URL"),
        duration: z.number().optional().describe("Duration in seconds"),
        error: z.string().optional().describe("Error details"),
      },
    },
    async (args, _extra: any) => {
      await tools.notifyDeployment(args);
      return textContent(
        `Notified deployment (${args.environment} - ${args.status})`,
      );
    },
  );

  server.registerTool(
    "notify_commit",
    {
      title: "Notify Commit",
      description: "Send a Slack commit notification",
      inputSchema: {
        branch: z.string().describe("Git branch"),
        message: z.string().describe("Commit message"),
        author: z.string().describe("Commit author"),
        sha: z.string().describe("Commit SHA"),
        url: z.string().describe("Commit URL"),
        filesChanged: z
          .number()
          .optional()
          .describe("Number of files changed"),
      },
    },
    async (args, _extra: any) => {
      await tools.notifyCommit(args);
      return textContent(`Notified commit ${args.sha.substring(0, 7)}`);
    },
  );

  server.registerTool(
    "send_message_to_ai",
    {
      title: "Send Message to AI",
      description: "Send a direct Slack message to another AI agent",
      inputSchema: {
        toAI: aiIdentitySchema.describe("Recipient AI identity"),
        message: z.string().describe("Message content"),
        urgent: z
          .boolean()
          .optional()
          .describe("Mark the message as urgent"),
      },
    },
    async (args, extra: any) => {
      const sender = resolveIdentity(undefined, extra);
      const prefix = sender ? `[From ${sender}] ` : "";
      await tools.sendMessageToAI({
        toAI: args.toAI,
        message: `${prefix}${args.message}`,
        urgent: args.urgent,
      });

      return textContent(`Sent message to ${args.toAI}`);
    },
  );

  server.registerTool(
    "broadcast_to_coordination",
    {
      title: "Broadcast Message",
      description: "Send a message to the coordination Slack channel",
      inputSchema: {
        message: z.string().describe("Message content"),
      },
    },
    async (args, extra: any) => {
      const sender = resolveIdentity(undefined, extra);
      const formatted = sender
        ? `@${sender.toUpperCase()} ${args.message}`
        : args.message;
      await tools.broadcastToCoordination({ message: formatted });
      return textContent("Broadcast message sent to coordination channel");
    },
  );

  server.registerTool(
    "send_slack_message",
    {
      title: "Send Slack Message to Channel",
      description: "Send a custom Slack message to a configured channel",
      inputSchema: {
        channel: z
          .enum(["coordination", "cursor", "codex", "replit", "commits"])
          .describe("Slack channel key"),
        text: z.string().describe("Message content"),
      },
    },
    async (args, _extra: any) => {
      await tools.sendSlackMessage(args);
      return textContent(`Sent Slack message to #${args.channel}`);
    },
  );

  server.registerTool(
    "get_project_status",
    {
      title: "Get Project Status",
      description: "Retrieve overall project status summary from GitHub",
      inputSchema: {},
    },
    async (_args, _extra: any) => {
      const status = await tools.getProjectStatus();
      return textContent("Fetched project status", status);
    },
  );

  server.registerTool(
    "claim_task",
    {
      title: "Claim Task",
      description: "Claim a specific task and start working on it. Updates status to in-progress and adds a comment.",
      inputSchema: {
        taskId: z.number().describe("GitHub issue number to claim"),
      },
    },
    async (args, extra: any) => {
      const identity = resolveIdentity(undefined, extra);
      if (!identity) {
        return toolError("AI identity is required");
      }

      const result = await tools.claimTask(identity, args.taskId);

      await server.sendLoggingMessage(
        {
          level: "info",
          data: `${identity} claimed task #${args.taskId}`,
        },
        extra.sessionId,
      );

      return textContent(
        `✅ Claimed task #${result.taskId}: ${result.title}`,
        result
      );
    },
  );

  server.registerTool(
    "start_my_work",
    {
      title: "Start My Work",
      description: "Automatically find and claim the first ready task assigned to you. One-click to start working.",
      inputSchema: {},
    },
    async (_args, extra: any) => {
      const identity = resolveIdentity(undefined, extra);
      if (!identity) {
        return toolError("AI identity is required");
      }

      const result = await tools.startMyWork(identity);

      await server.sendLoggingMessage(
        {
          level: "info",
          data: result.started 
            ? `${identity} started work on task #${result.task?.taskId}`
            : `No ready tasks found for ${identity}`,
        },
        extra.sessionId,
      );

      if (!result.started) {
        return textContent(
          `ℹ️ No ready tasks found for ${identity}`,
          result
        );
      }

      return textContent(
        `✅ Started task #${result.task?.taskId}: ${result.task?.title}\n${result.task?.url}`,
        result
      );
    },
  );

  server.registerTool(
    "complete_and_handoff",
    {
      title: "Complete and Handoff Task",
      description: "Mark current task as complete and hand off to next AI. Automatically updates status, adds comments, and sends notifications.",
      inputSchema: {
        nextAI: aiIdentitySchema.describe("Next AI to handle the task"),
        taskId: z.number().optional().describe("Task ID (auto-detect current task if not provided)"),
        message: z.string().optional().describe("Handoff message for next AI"),
      },
    },
    async (args, extra: any) => {
      const identity = resolveIdentity(undefined, extra);
      if (!identity) {
        return toolError("AI identity is required");
      }

      const result = await tools.completeAndHandoff(identity, {
        taskId: args.taskId,
        nextAI: args.nextAI,
        message: args.message,
      });

      await server.sendLoggingMessage(
        {
          level: "info",
          data: `${identity} completed task #${result.taskId} and handed off to ${args.nextAI}`,
        },
        extra.sessionId,
      );

      return textContent(
        `✅ Task #${result.taskId} completed and handed off to ${args.nextAI}\n${result.title}`,
        result
      );
    },
  );

  return server;
}

export function registerMcpHttpRoutes(
  app: express.Express,
  tools: CollaborationTools,
): { server: McpServerType; transport: StreamableHTTPServerTransport } {
  const server = createMcpServer({ tools });
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    enableJsonResponse: true,
    allowedHosts: undefined,
    allowedOrigins: undefined,
    enableDnsRebindingProtection: false,
  });

  server
    .connect(transport)
    .then(() => {
      console.log("🌐 MCP HTTP transport ready at /mcp");
    })
    .catch((error) => {
      console.error("❌ Failed to initialize MCP HTTP transport:", error);
    });

  app.all("/mcp", async (req, res) => {
    try {
      await transport.handleRequest(req, res, req.body);
    } catch (error: any) {
      console.error("❌ MCP transport error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Internal server error",
          },
          id: null,
        });
      }
    }
  });

  return { server, transport };
}

async function startStdioServer(tools: CollaborationTools) {
  const server = createMcpServer({ tools });
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🟢 MCP server running on stdio transport");
}

if (process.argv[1] && process.argv[1].includes("mcpServer")) {
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    console.error("❌ GITHUB_TOKEN is required to start the MCP server.");
    process.exit(1);
  }

  const { GitHubClient } = await import("./github.js");
  const { SlackClient } = await import("./slack.js");
  const { CollaborationTools } = await import("./tools.js");

  const github = new GitHubClient(githubToken);
  const slackToken = process.env.SLACK_BOT_TOKEN;
  const slackChannels = {
    coordination: process.env.SLACK_CHANNEL_COORDINATION || "C01234567",
    cursor: process.env.SLACK_CHANNEL_CURSOR || "C01234568",
    codex: process.env.SLACK_CHANNEL_CODEX || "C01234569",
    replit: process.env.SLACK_CHANNEL_REPLIT || "C01234570",
    commits: process.env.SLACK_CHANNEL_COMMITS || "C01234571",
  };

  const slack = slackToken ? new SlackClient(slackToken, slackChannels) : null;
  const tools = new CollaborationTools(github, slack);

  startStdioServer(tools).catch((error) => {
    console.error("❌ MCP stdio server failed:", error);
    process.exit(1);
  });
}


