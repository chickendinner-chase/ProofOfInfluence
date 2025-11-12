# MCP Client Configuration Examples

This directory contains configuration examples for connecting various AI tools to the ProofOfInfluence MCP Server.

## Cursor AI

### Local Connection (stdio)

1. Copy `cursor-mcp.json` to `~/.cursor/mcp.json` (or merge with existing config)
2. Update paths and tokens:
   - Replace `D:/chickendinner/ProofOfInfluence` with your actual project path
   - Replace tokens with your actual credentials
3. Restart Cursor

### Cloud Connection (HTTP)

Use the `proofofinfluence-cloud` configuration:
- Update `https://your-repl.replit.app/mcp` with your Replit URL
- No need for tokens (uses API_SECRET_KEY)

## Codex AI (gpt-5-codex)

### Local Connection (stdio)

1. Install Codex CLI (if not already installed):
   ```bash
   npm install -g @openai/codex
   ```

2. Copy or merge `codex-config.toml` into `~/.codex/config.toml`

3. Update paths and tokens:
   - Replace paths with your actual project path
   - Replace tokens with your actual credentials

4. Start Codex:
   ```bash
   codex
   ```

5. Verify connection:
   ```
   codex> :tools
   ```
   
   You should see tools like:
   - `proofofinfluence-local.create_task`
   - `proofofinfluence-local.get_my_tasks`
   - etc.

### Cloud Connection (HTTP)

Use the `proofofinfluence-cloud` configuration in the TOML file.

### Using Codex MCP Tools

```bash
# Get your tasks
codex> :call proofofinfluence-local.get_my_tasks {}

# Create a new task
codex> :call proofofinfluence-local.create_task {"title":"Implement staking contract","assignee":"codex","description":"Add ERC20 staking functionality","priority":"high"}

# Update task status
codex> :call proofofinfluence-local.update_task_status {"taskId":42,"status":"in-progress"}

# Add comment
codex> :call proofofinfluence-local.add_task_comment {"taskId":42,"comment":"Started implementation"}

# Notify completion
codex> :call proofofinfluence-local.notify_task_complete {"taskId":"42","title":"Staking contract","completedBy":"codex","branch":"codex/feat-staking","nextAI":"cursor","nextAction":"请集成前端"}

# Send message to Cursor
codex> :call proofofinfluence-local.send_message_to_ai {"toAI":"cursor","message":"Staking contract is ready for integration"}
```

## Replit AI

Configuration is already in the root `mcp-config.json`:
- `proofofinfluence-collab` server is configured
- Uses `MCP_AI_IDENTITY=replit`
- Automatically uses Replit Secrets for tokens

## Environment Variables

All configurations require these environment variables:

- `GITHUB_TOKEN` - GitHub Personal Access Token with `repo` scope
- `SLACK_BOT_TOKEN` - Slack Bot User OAuth Token (optional, for notifications)
- `SLACK_CHANNEL_*` - Slack channel IDs (optional)
- `MCP_AI_IDENTITY` - Current AI identity (`cursor`, `codex`, or `replit`)

## Security Notes

- **Never commit tokens to Git**
- Use environment variables or secure secret stores
- For local development, create a `.env` file
- For cloud deployment, use Replit Secrets or similar

## Troubleshooting

### MCP Server Not Found

**Error**: `Cannot find module 'mcpServer.js'`

**Solution**: Run `npm run build` in the `api-server` directory to compile TypeScript

### GitHub Token Invalid

**Error**: GitHub API authentication failed

**Solution**: 
1. Check token hasn't expired
2. Verify token has `repo` scope
3. Test token: `curl -H "Authorization: Bearer YOUR_TOKEN" https://api.github.com/user`

### AI Identity Not Set

**Error**: `AI identity is required`

**Solution**: Set `MCP_AI_IDENTITY` environment variable in your MCP configuration

### Slack Integration Disabled

**Warning**: Slack tools return null

**Solution**: Set `SLACK_BOT_TOKEN` and channel IDs if you want Slack notifications



