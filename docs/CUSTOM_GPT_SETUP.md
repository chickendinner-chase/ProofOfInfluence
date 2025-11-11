# Custom GPT Setup Guide

Complete guide to setting up Custom GPT for ProofOfInfluence AI task management.

## Overview

This guide will help you create a Custom GPT that can automatically create and manage GitHub Issues for coordinating Cursor, Codex, and Replit AI.

## Prerequisites

- ✅ ChatGPT Plus subscription ($20/month)
- ✅ GitHub account with repo access
- ✅ Replit account

---

## Step 1: Get GitHub Personal Access Token

### Create Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Set token name: `ProofOfInfluence API Server`
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `write:discussion` (optional, for Discussions)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again!)

### Token Format

```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Step 2: Configure Replit Secrets

1. Open your Replit project: https://replit.com/@youruser/ProofOfInfluence
2. Click Secrets (🔒 icon) in left sidebar
3. Add two secrets:

| Key | Value | Description |
|-----|-------|-------------|
| `GITHUB_TOKEN` | `ghp_xxx...` | Your GitHub PAT from Step 1 |
| `API_SECRET_KEY` | Generate random string | Secret key for Custom GPT authentication |

**Generate API_SECRET_KEY:**
```bash
# Use any strong random string, e.g.:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 3: Deploy API Server to Replit

### Verify Deployment

1. In Replit, click "Run" button
2. Check console for:
   ```
   🚀 API Server running on port 3001
   ```
3. Note your Replit URL:
   ```
   https://your-repl-name.replit.app
   ```

### Test API Endpoint

Open in browser:
```
https://your-repl-name.replit.app:3001/health
```

Should return:
```json
{
  "status": "ok",
  "service": "ProofOfInfluence API Server"
}
```

---

## Step 4: Create Custom GPT

### Access Custom GPT Builder

1. Go to: https://chatgpt.com/
2. Click "Explore" in sidebar
3. Click "Create a GPT" button
4. Choose "Configure" tab

### Configure Instructions

Paste this as the Custom GPT instructions:

```
You are the Project Manager for ProofOfInfluence, a Web3 platform development project.

Your role is to coordinate three AI developers:
- **Cursor AI**: Frontend/backend application development
- **Codex AI**: Smart contract development (Solidity)
- **Replit AI**: Deployment and operations

## Your Capabilities

You can create and manage GitHub Issues to assign tasks to the AIs using these labels:
- @cursor - For application development tasks
- @codex - For smart contract tasks
- @replit - For deployment tasks

Status labels:
- status:ready - Task ready to start
- status:in-progress - Currently being worked on
- status:needs-review - Waiting for review
- status:blocked - Blocked by dependency

## Task Creation Guidelines

When creating tasks:
1. Use clear, specific titles
2. Include detailed descriptions
3. Assign to appropriate AI
4. Set priority (low/medium/high) if important
5. Mention component (frontend/backend/contracts)

## Communication Style

Be concise and professional. When tasks are created, confirm with:
"✅ Created Issue #XX for [AI name]"

When checking status, provide clear summaries:
"Cursor has 2 tasks in-progress, 1 completed"

## Example Interactions

User: "Create backend API task for Market module"
You: Use create_task to create Issue with @cursor label

User: "Check Codex's progress"
You: Use list_tasks to get Codex's current tasks and summarize

User: "Mark task #42 as in-progress"
You: Use update_status to change task status
```

### Configure Name & Description

- **Name**: `ProofOfInfluence PM`
- **Description**: `Project manager for ProofOfInfluence AI collaboration. Creates and manages GitHub Issues for Cursor, Codex, and Replit.`

### Configure Actions

1. Click "Create new action"
2. Choose "Import from URL"
3. Enter URL:
   ```
   https://your-repl-name.replit.app:3001/openapi.yaml
   ```
4. Click "Import"
5. Configure authentication:
   - **Authentication Type**: Bearer
   - **Bearer Token**: `[Your API_SECRET_KEY from Replit Secrets]`

### Privacy Settings

- **Who can access**: Only you (or Team if you have organization)
- Click "Save" button in top right

---

## Step 5: Test Custom GPT

### Test 1: Create Task

In your Custom GPT, say:

```
Create a test task:
Title: "Test: Verify API Connection"
Assign to: Cursor
Description: "This is a test task to verify the Custom GPT integration works"
```

Expected response:
```
✅ Created Issue #XX for Cursor
View at: https://github.com/acee-chase/ProofOfInfluence/issues/XX
```

### Test 2: List Tasks

```
List all tasks assigned to Cursor
```

Expected response:
```
Cursor has X tasks:
- Issue #XX: Test: Verify API Connection (status: ready)
```

### Test 3: Check Project Status

```
Give me overall project status
```

Expected response:
```
Project Status:
- Total tasks: X
- Open: X
- Cursor: X tasks (X in progress)
- Codex: X tasks
- Replit: X tasks
```

---

## Step 6: Usage Examples

### Create Development Sprint

```
Create a development sprint for Market module:

1. Backend API implementation - assign to Cursor, high priority
2. Add fee collection to contract - assign to Codex, high priority  
3. Frontend UI for trading - assign to Cursor, medium priority
4. Deploy to testnet - assign to Replit, medium priority
5. Integration testing - assign to Cursor, low priority
```

Custom GPT will:
- Create 5 GitHub Issues
- Assign appropriate labels
- Set priorities
- Return all Issue URLs

### Monitor Progress

```
How is the Market module progressing?
```

Custom GPT will:
- Check all Market-related Issues
- Summarize status by AI
- Highlight blockers
- Suggest next steps

### Coordinate Handoffs

```
Codex completed the staking contract in Issue #45.
Create a follow-up task for Cursor to integrate the frontend.
```

Custom GPT will:
- Read Issue #45
- Create new Issue for Cursor
- Link the two Issues
- Add appropriate labels

---

## Troubleshooting

### API Server Not Responding

**Check:**
1. Replit is running (click "Run")
2. API_SERVER port 3001 is accessible
3. Check Replit console for errors

**Fix:**
```bash
# In Replit Shell
cd api-server
npm install
npm start
```

### Custom GPT Can't Call API

**Check:**
1. OpenAPI schema URL is correct
2. Bearer token matches API_SECRET_KEY in Replit
3. CORS is configured (should allow chatgpt.com)

**Fix:**
- Re-import OpenAPI schema in Custom GPT
- Verify API_SECRET_KEY in Replit Secrets
- Test API directly: `curl https://your-repl.replit.app:3001/health`

### GitHub Token Invalid

**Check:**
1. Token hasn't expired
2. Token has `repo` scope
3. Token is correctly set in Replit Secrets

**Fix:**
- Generate new token
- Update GITHUB_TOKEN in Replit Secrets
- Restart Replit

### Issues Not Created

**Check:**
1. Check Replit console logs for errors
2. Verify GitHub token permissions
3. Test API endpoint directly:
   ```bash
   curl -X POST https://your-repl.replit.app:3001/api/tasks/create \
     -H "Authorization: Bearer YOUR_API_SECRET_KEY" \
     -H "Content-Type: application/json" \
     -d '{"title":"Test","assignee":"cursor","description":"Test"}'
   ```

---

## Security Best Practices

### Do's ✅

- Store tokens in Replit Secrets only
- Use strong API_SECRET_KEY (32+ characters)
- Keep Custom GPT private (don't share publicly)
- Regenerate tokens if compromised
- Monitor API usage

### Don'ts ❌

- Don't commit tokens to Git
- Don't share API_SECRET_KEY publicly
- Don't use weak passwords
- Don't expose API without authentication
- Don't ignore security warnings

---

## Advanced Usage

### Batch Task Creation

```
Create 10 tasks for the next sprint based on docs/ARCHITECTURE.md.
Analyze the document and create appropriate tasks for each AI.
```

### Progress Reports

```
Generate a weekly progress report showing:
- Tasks completed by each AI
- Current blockers
- Upcoming milestones
```

### Automated Workflows

```
When Codex completes a contract task:
1. Create integration task for Cursor
2. Create deployment task for Replit
3. Set dependencies between tasks
```

---

## API Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check |
| `/api/tasks/create` | POST | Create new task |
| `/api/tasks/list` | GET | List tasks |
| `/api/tasks/:id` | GET | Get task details |
| `/api/tasks/:id/status` | PATCH | Update status |
| `/api/tasks/:id/comment` | POST | Add comment |
| `/api/project/status` | GET | Project summary |

Full API documentation: See `api-server/openapi.yaml`

---

## Maintenance

### Update API Server

When you update API server code:

```bash
# Commit changes
git add api-server/
git commit -m "feat: update API server (Cursor)"
git push origin dev

# Replit will auto-redeploy
```

### Rotate Secrets

Periodically (every 90 days):
1. Generate new GitHub PAT
2. Generate new API_SECRET_KEY
3. Update Replit Secrets
4. Update Custom GPT bearer token
5. Restart Replit

---

## Cost

- **ChatGPT Plus**: $20/month (required)
- **Replit**: Free tier OK, or $7/month for always-on
- **GitHub**: Free
- **Total**: $20-27/month

---

## Support

For issues:
1. Check Replit console logs
2. Test API endpoints directly
3. Verify GitHub token permissions
4. Review this guide
5. Create GitHub Issue with `@cursor` label

---

**Custom GPT Project Manager is now ready!**

You can now use natural language in ChatGPT to manage your entire development workflow.

