# API Server for ProofOfInfluence

RESTful API server that enables ChatGPT Custom GPT and Slack to manage GitHub Issues and AI collaboration.

## Quick Start

### Installation

```bash
cd api-server
npm install
```

### Configuration

Create `.env` file or use Replit Secrets:

```env
# Required
GITHUB_TOKEN=ghp_your_github_personal_access_token
API_SECRET_KEY=your_secret_key_for_authentication
API_PORT=3001

# Optional: Slack Integration
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_CHANNEL_COORDINATION=C01234567
SLACK_CHANNEL_CURSOR=C01234568
SLACK_CHANNEL_CODEX=C01234569
SLACK_CHANNEL_REPLIT=C01234570
SLACK_CHANNEL_COMMITS=C01234571
```

**Note**: Slack integration is optional. If `SLACK_BOT_TOKEN` is not set, Slack endpoints will return 503 Service Unavailable.

### Run Locally

```bash
npm start
```

Server will start on `http://localhost:3001`

### Run on Replit

Replit will automatically:
1. Install dependencies
2. Load secrets from Replit Secrets
3. Start server on port 3001

---

## MCP Server

The API server now exposes a Model Context Protocol (MCP) server so that any MCP-capable client (Cursor, Codex CLI, Replit Agent, Custom GPT, etc.) can use the same GitHub + Slack tools.

### Available transports

- **HTTP / Streamable HTTP**: `POST/GET /mcp` (same port as the REST API)
- **stdio**: run locally with `npm run mcp:stdio` (set `MCP_AI_IDENTITY` before running)

### Running in stdio mode

```bash
# From the repo root
cd api-server
MCP_AI_IDENTITY=cursor npm run mcp:stdio
```

Environment variables:

- `GITHUB_TOKEN` (required)
- `SLACK_BOT_TOKEN` + channel IDs (optional, enables Slack tools)
- `MCP_AI_IDENTITY` – default AI identity for the current process (`cursor`, `codex`, `replit`)

### Connecting over HTTP/SSE

HTTP clients should send requests to `https://<host>:3001/mcp`.  
Include `X-AI-Identity` header to identify the caller AI. Example Codex CLI configuration (`~/.codex/config.toml`):

```toml
[mcp_servers.proofofinfluence]
url = "https://your-repl.replit.app/mcp"
headers = { "X-AI-Identity" = "codex" }
```

Cursor、Replit Agent 等也可以使用 `mcp-config.json` 中的示例通过 `npx tsx api-server/mcpServer.ts` 启动专用实例。

### Registered MCP tools

- `create_task`, `get_my_tasks`, `list_tasks`, `get_project_status`
- `update_task_status`, `add_task_comment`
- `notify_task_complete`, `notify_task_status`, `notify_deployment`, `notify_commit`
- `send_message_to_ai`, `broadcast_to_coordination`, `send_slack_message`

Each tool returns human-readable text and structured JSON content for programmatic use.

---

## API Endpoints

### Health Check

```
GET /health
```

Response:
```json
{
  "status": "ok",
  "service": "ProofOfInfluence API Server"
}
```

### Create Task

```
POST /api/tasks/create
Authorization: Bearer {API_SECRET_KEY}
Content-Type: application/json

{
  "title": "Implement Market API",
  "assignee": "cursor",
  "description": "Add POST /api/market/orders endpoint",
  "priority": "high",
  "component": "backend"
}
```

Response:
```json
{
  "number": 42,
  "url": "https://github.com/acee-chase/ProofOfInfluence/issues/42",
  "title": "Implement Market API",
  "assignee": "cursor"
}
```

### List Tasks

```
GET /api/tasks/list?assignee=cursor&status=in-progress
Authorization: Bearer {API_SECRET_KEY}
```

Response:
```json
{
  "tasks": [
    {
      "number": 42,
      "title": "Implement Market API",
      "url": "https://...",
      "state": "open",
      "labels": ["ai:cursor", "status:in-progress"],
      "created_at": "2025-11-11T10:00:00Z"
    }
  ],
  "count": 1
}
```

### Get Task Details

```
GET /api/tasks/42
Authorization: Bearer {API_SECRET_KEY}
```

### Update Task Status

```
PATCH /api/tasks/42/status
Authorization: Bearer {API_SECRET_KEY}
Content-Type: application/json

{
  "status": "in-progress"
}
```

### Add Comment

```
POST /api/tasks/42/comment
Authorization: Bearer {API_SECRET_KEY}
Content-Type: application/json

{
  "comment": "✅ Backend API completed, ready for frontend integration"
}
```

### Get Project Status

```
GET /api/project/status
Authorization: Bearer {API_SECRET_KEY}
```

Response:
```json
{
  "total": 50,
  "open": 12,
  "closed": 38,
  "by_ai": {
    "cursor": { "total": 20, "open": 5, "in_progress": 3 },
    "codex": { "total": 15, "open": 4, "in_progress": 2 },
    "replit": { "total": 15, "open": 3, "in_progress": 1 }
  }
}
```

---

## Slack Endpoints

### Send Task Completion Notification

```
POST /api/slack/task/complete
Authorization: Bearer {API_SECRET_KEY}
Content-Type: application/json

{
  "taskId": "42",
  "title": "Implement Market API",
  "completedBy": "Cursor AI",
  "branch": "cursor/feat-market-api",
  "commit": "abc123def456",
  "files": ["server/routes.ts", "server/market.ts"],
  "nextAI": "replit",
  "nextAction": "请部署到测试环境"
}
```

### Send Task Status Update

```
POST /api/slack/task/status
Authorization: Bearer {API_SECRET_KEY}
Content-Type: application/json

{
  "taskId": "42",
  "title": "Implement Market API",
  "oldStatus": "pending",
  "newStatus": "in_progress",
  "note": "开始开发后端 API"
}
```

### Send Deployment Notification

```
POST /api/slack/deployment
Authorization: Bearer {API_SECRET_KEY}
Content-Type: application/json

{
  "environment": "staging",
  "branch": "dev",
  "commit": "abc123def456",
  "status": "success",
  "url": "https://dev-poi.replit.app",
  "duration": "2m 15s"
}
```

**Status values**: `started`, `success`, `failed`

**Environment values**: `production`, `staging`, `testing`

### Send Commit Notification

```
POST /api/slack/commit
Authorization: Bearer {API_SECRET_KEY}
Content-Type: application/json

{
  "branch": "dev",
  "message": "feat(frontend): add market dashboard (Cursor)",
  "author": "acee-chase",
  "sha": "abc123def456789",
  "url": "https://github.com/acee-chase/ProofOfInfluence/commit/abc123",
  "filesChanged": 5
}
```

### Send Custom Message

```
POST /api/slack/message
Authorization: Bearer {API_SECRET_KEY}
Content-Type: application/json

{
  "channel": "coordination",
  "text": "🤖 AI Status: All systems operational",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*AI Status Update*\n✅ Cursor: Online\n✅ Codex: Online\n✅ Replit: Online"
      }
    }
  ]
}
```

**Channel values**: `coordination`, `cursor`, `codex`, `replit`, `commits`

---

## Authentication

All API endpoints (except `/health` and `/openapi.yaml`) require Bearer token authentication:

```
Authorization: Bearer {YOUR_API_SECRET_KEY}
```

---

## Development

### Project Structure

```
api-server/
├── index.ts          # Express server
├── github.ts         # GitHub API wrapper
├── package.json      # Dependencies
├── tsconfig.json     # TypeScript config
├── openapi.yaml      # OpenAPI spec for Custom GPT
└── README.md         # This file
```

### Adding New Endpoints

1. Add method to `github.ts`
2. Add route to `index.ts`
3. Update `openapi.yaml`
4. Test endpoint
5. Update docs

---

## Error Handling

### Common Errors

**401 Unauthorized**
- Missing or invalid Authorization header
- Check API_SECRET_KEY

**403 Forbidden**
- GitHub token invalid or expired
- Insufficient permissions

**404 Not Found**
- Issue number doesn't exist
- Check task ID

**500 Server Error**
- Check Replit console logs
- Verify GITHUB_TOKEN is set
- Check GitHub API rate limits

---

## Rate Limiting

- GitHub API: 5,000 requests/hour (authenticated)
- Custom rate limit: 100 requests/hour per client (configurable)

---

## Deployment

Deployed automatically on Replit when code is pushed to GitHub.

Manual deployment:
```bash
git push origin dev
# Replit auto-deploys
```

---

## Monitoring

Check logs in Replit console:
- API requests
- GitHub API calls
- Errors and warnings

---

## MCP Server (Model Context Protocol)

The API server now includes a full MCP server implementation, enabling AI tools (Cursor, Codex, Replit) to directly access GitHub and Slack capabilities.

### Architecture

```
┌─────────────────────────────────────────┐
│   ProofOfInfluence MCP/API Server       │
│                                         │
│   CollaborationTools (Unified Layer)   │
│   ├─ GitHub Operations                 │
│   └─ Slack Operations                  │
│                                         │
│   ┌────────────┐   ┌────────────┐     │
│   │ REST API   │   │ MCP Server │     │
│   │ (/api/*)   │   │ (/mcp)     │     │
│   └────────────┘   └────────────┘     │
└─────────────────────────────────────────┘
        ↓                   ↓
   Custom GPT       Cursor/Codex/Replit
   (OpenAPI)            (MCP Protocol)
```

### MCP Tools Available

The MCP server provides 13 tools for AI collaboration:

#### GitHub Tools
1. **create_task** - Create GitHub issue assigned to specific AI
2. **get_my_tasks** - Get tasks for current AI
3. **list_tasks** - List all project tasks with filters
4. **update_task_status** - Update task status label
5. **add_task_comment** - Add comment to GitHub issue
6. **get_project_status** - Get overall project status

#### Slack Tools
7. **notify_task_complete** - Send task completion notification
8. **notify_task_status** - Send status update notification
9. **notify_deployment** - Send deployment notification
10. **notify_commit** - Send commit notification
11. **send_message_to_ai** - Direct message to another AI
12. **broadcast_to_coordination** - Broadcast to coordination channel
13. **send_slack_message** - Custom Slack message

### Running MCP Server

#### stdio Mode (Local AI Tools)

```bash
# Start for Cursor
MCP_AI_IDENTITY=cursor npm run mcp:stdio

# Start for Codex
MCP_AI_IDENTITY=codex npm run mcp:stdio

# Start for Replit
MCP_AI_IDENTITY=replit npm run mcp:stdio
```

#### HTTP Mode (Cloud Deployment)

The MCP server is automatically integrated into the Express server:
```bash
npm start
```

Access at: `http://localhost:3001/mcp` (or `https://your-repl.replit.app/mcp`)

### Connecting AI Clients

#### Cursor Configuration

Create or edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "proofofinfluence": {
      "command": "node",
      "args": ["/path/to/api-server/dist/mcpServer.js"],
      "env": {
        "MCP_AI_IDENTITY": "cursor",
        "GITHUB_TOKEN": "your-token",
        "SLACK_BOT_TOKEN": "your-slack-token"
      }
    }
  }
}
```

See `config-examples/cursor-mcp.json` for full example.

#### Codex (gpt-5-codex) Configuration

Add to `~/.codex/config.toml`:

```toml
[mcp_servers.proofofinfluence]
command = "node"
args = ["/path/to/api-server/dist/mcpServer.js"]

[mcp_servers.proofofinfluence.env]
MCP_AI_IDENTITY = "codex"
GITHUB_TOKEN = "your-token"
```

See `config-examples/codex-config.toml` for full example.

#### Replit AI Configuration

Already configured in root `mcp-config.json`:
```json
{
  "mcpServers": {
    "proofofinfluence-collab": {
      "command": "npx",
      "args": ["-y", "tsx", "api-server/mcpServer.ts"],
      "env": {
        "MCP_AI_IDENTITY": "replit",
        ...
      }
    }
  }
}
```

### AI Identity Resolution

The MCP server determines which AI is calling based on:

1. **Environment variable** `MCP_AI_IDENTITY` (for stdio mode)
2. **HTTP header** `X-AI-Identity` (for HTTP mode)
3. **Explicit parameter** in tool arguments (override)

Priority: Explicit parameter > HTTP header > Environment variable

### Testing

```bash
# Test stdio mode
npm run build
node test-mcp.js

# Test HTTP mode (requires server running)
npm start &
node test-http.js
```

### Example Usage

#### Cursor AI Workflow

```
# In Cursor, with MCP configured:
1. Query my tasks: Use get_my_tasks tool
2. Start working: Use update_task_status to set "in-progress"
3. Complete task: Use notify_task_complete with nextAI="replit"
4. Notify Replit: Use send_message_to_ai
```

#### Codex AI Workflow

```bash
# In Codex CLI:
codex> :call proofofinfluence.get_my_tasks {"status":"ready"}
codex> :call proofofinfluence.update_task_status {"taskId":45,"status":"in-progress"}
# ... work on contract ...
codex> :call proofofinfluence.notify_task_complete {"taskId":"45","title":"Staking Contract","completedBy":"codex","branch":"codex/feat-staking","nextAI":"cursor"}
```

---

**API Server ready for Custom GPT and MCP integration!**

