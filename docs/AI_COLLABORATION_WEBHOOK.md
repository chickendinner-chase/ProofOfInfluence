# AI Collaboration via GitHub Webhooks

How Cursor, Codex, and Replit collaborate using GitHub Webhooks, Issues, and Labels.

## Overview

This system enables async AI collaboration without requiring a separate MCP server:

```
GitHub (Central Hub)
  ├── Code Repository (Git)
  ├── Issues (Task Board)
  ├── Webhooks (Event Notifications)
  └── Labels (AI Routing)
      ↓
  [Cursor] [Codex] [Replit]
```

---

## GitHub Labels for AI Coordination

### AI Assignment Labels

Create these labels in your GitHub repository:

| Label | Color | Description | Assigned To |
|-------|-------|-------------|-------------|
| `@codex` | `#0052CC` | Task for Codex AI | Smart contract work |
| `@cursor` | `#00B8D9` | Task for Cursor AI | Application development |
| `@replit` | `#00C853` | Task for Replit AI | Deployment tasks |

### Status Labels

| Label | Color | Description |
|-------|-------|-------------|
| `status:ready` | `#0E8A16` | Ready to start work |
| `status:in-progress` | `#FBCA04` | Currently being worked on |
| `status:needs-review` | `#D93F0B` | Waiting for review |
| `status:blocked` | `#B60205` | Blocked by dependency |
| `status:done` | `#0E8A16` | Completed |

### Component Labels (optional)

| Label | Description |
|-------|-------------|
| `component:contracts` | Smart contract related |
| `component:frontend` | Frontend UI related |
| `component:backend` | Backend API related |
| `component:deployment` | Deployment/infrastructure |

### How to Create Labels

1. Go to: `https://github.com/acee-chase/ProofOfInfluence/labels`
2. Click "New label"
3. Enter name, description, color
4. Click "Create label"

Or use GitHub CLI:

```bash
gh label create "@codex" --color "0052CC" --description "Task for Codex AI"
gh label create "@cursor" --color "00B8D9" --description "Task for Cursor AI"
gh label create "@replit" --color "00C853" --description "Task for Replit AI"
gh label create "status:ready" --color "0E8A16" --description "Ready to work"
gh label create "status:in-progress" --color "FBCA04" --description "Currently working"
gh label create "status:needs-review" --color "D93F0B" --description "Needs review"
```

---

## Webhook Configuration

### For Replit (Built-in Auto-Deploy)

Replit automatically watches your GitHub repository. No manual webhook needed!

**How it works:**
1. You push to GitHub
2. Replit detects the push
3. Replit auto-deploys

**Manual trigger (if needed):**
```bash
# In Replit Shell
git pull origin dev
npm install
npm run build
npm start
```

### For Codex (Optional - if using external API)

If Codex runs as a separate service:

1. Deploy Codex webhook endpoint: `https://codex-api.yourdomain.com/webhook`
2. Add webhook in GitHub:
   - Go to: Settings → Webhooks → Add webhook
   - Payload URL: `https://codex-api.yourdomain.com/webhook`
   - Content type: `application/json`
   - Secret: (generate secure token)
   - Events: `push`, `issues`, `pull_request`

3. Codex endpoint should:
   ```javascript
   app.post('/webhook', (req, res) => {
     const event = req.headers['x-github-event'];
     const payload = req.body;
     
     if (event === 'issues' && payload.action === 'labeled') {
       const labels = payload.issue.labels.map(l => l.name);
       
       if (labels.includes('@codex')) {
         // Start working on this issue
         handleCodexTask(payload.issue);
       }
     }
     
     res.sendStatus(200);
   });
   ```

### For Cursor (Local Development)

Cursor works locally, monitors GitHub via:
- Manual checks of Issues with `@cursor` label
- GitHub notifications
- Or runs a local script to poll Issues

---

## Collaboration Workflows

### Workflow 1: Contract Development → Frontend Integration

```
1. Create Issue:
   Title: "Implement POI Staking Contract"
   Labels: @codex, status:ready, component:contracts

2. Codex sees Issue (manual check or webhook)
   ↓
3. Codex develops contract:
   - Create branch: codex/feat-staking
   - Develop contracts/POIStaking.sol
   - Write tests
   - Commit: feat(contracts): add staking contract (Codex)
   - Push to GitHub
   ↓
4. Codex comments on Issue:
   "✅ Contract complete
   Branch: codex/feat-staking
   ABI: [link to ABI file]
   @cursor please integrate frontend"
   
   Changes labels: @cursor, status:ready
   ↓
5. Cursor sees notification
   ↓
6. Cursor integrates:
   - Pull codex branch
   - Add frontend UI
   - Commit: feat(frontend): add staking UI (Cursor)
   - Create PR
   ↓
7. After PR merged:
   Cursor comments: "@replit ready for deployment"
   Changes labels: @replit, status:ready
   ↓
8. Replit deploys and reports results
```

### Workflow 2: Frontend Change → Backend Update

```
1. Cursor updates frontend:
   git commit -m "feat(frontend): add new user dashboard (Cursor)"
   git push origin dev
   ↓
2. GitHub Workflow detects frontend changes
   ↓
3. If backend API needed:
   Cursor manually creates Issue:
   Title: "Add API endpoint for user stats"
   Labels: @cursor, component:backend, status:ready
   ↓
4. Cursor (same AI) completes backend:
   git commit -m "feat(backend): add user stats API (Cursor)"
   ↓
5. Auto-notify Replit for deployment
```

### Workflow 3: Deployment Needed

```
1. Code merged to dev
   ↓
2. Create Issue:
   Title: "Deploy latest dev to staging"
   Labels: @replit, status:ready
   Body: "Latest changes ready for testing deployment"
   ↓
3. Replit sees Issue
   ↓
4. Replit deploys and comments:
   "✅ Deployed to staging
   URL: https://dev.your-repl.replit.app
   Timestamp: 2025-11-11 10:30 UTC
   Tests: All passing ✅"
   
   Closes Issue
```

---

## Communication Protocol

### Commit Messages

```bash
# Include AI name and action
git commit -m "feat(contracts): add staking rewards (Codex)"
git commit -m "fix(frontend): wallet connection bug (Cursor)"
git commit -m "chore(deployment): update env config (Replit)"
```

### Issue Comments

**Template for task handoff:**

```markdown
✅ [AI Name] Task Complete

**What was done:**
- Implemented X feature
- Updated Y file
- Added tests for Z

**Files changed:**
- path/to/file1
- path/to/file2

**Next action:**
@next-ai please [specific action needed]

**Branch:** branch-name (if applicable)
**Status:** Ready for [next step]
```

### Labels Workflow

```
Issue created with @codex, status:ready
    ↓
Codex starts work → change to status:in-progress
    ↓
Codex completes → change to status:needs-review, add @cursor
    ↓
Cursor reviews → change to @replit, status:ready
    ↓
Replit deploys → change to status:done, close issue
```

---

## Monitoring Collaboration

### GitHub Projects (Optional)

Create a project board:

```
To Do          In Progress       Review         Done
[@codex]       [@cursor]         [@replit]      [Completed]
[Issue #1]     [Issue #2]        [Issue #3]     [Issue #4]
```

### GitHub Discussions

Use Discussions for:
- Design decisions
- Architecture discussions
- Long-term planning
- Non-task communication

### Issue Dashboard

View all AI tasks:
- Filter by `@codex`: https://github.com/acee-chase/ProofOfInfluence/issues?q=label%3A%40codex
- Filter by `@cursor`: https://github.com/acee-chase/ProofOfInfluence/issues?q=label%3A%40cursor
- Filter by `@replit`: https://github.com/acee-chase/ProofOfInfluence/issues?q=label%3A%40replit

---

## Integration with External Tools (Optional)

### Slack/Discord Notifications

Set up webhook to send Issue updates to chat:

```javascript
// In .github/workflows/ai-collaboration.yml
- name: Send Slack notification
  if: contains(github.event.issue.labels.*.name, '@codex')
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "🤖 New task for Codex: ${{ github.event.issue.title }}"
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Email Notifications

Enable GitHub email notifications:
1. Settings → Notifications
2. Subscribe to:
   - Issues assigned to you
   - Mentions (@codex, @cursor, @replit)
   - PR reviews

---

## Best Practices

### Do's ✅

- Use clear, descriptive Issue titles
- Always add appropriate AI labels
- Comment with progress updates
- Link related Issues/PRs
- Close Issues when complete
- Update labels as status changes

### Don'ts ❌

- Don't create Issues for trivial tasks (just commit)
- Don't assign multiple AIs to same task without clear coordination
- Don't leave Issues open indefinitely
- Don't forget to notify next AI in comments

---

## Example Scenarios

### Scenario 1: New Feature Request

```
Human creates Issue:
"Add token burn mechanism to POI contract"
Labels: @codex, feature, status:ready
↓
Codex implements
↓
Comments: "@cursor contract ready for frontend integration"
Changes labels: @cursor, status:ready
↓
Cursor integrates
↓
Comments: "@replit ready for deployment"
Changes labels: @replit, status:ready
↓
Replit deploys and closes Issue
```

### Scenario 2: Bug Fix

```
User reports bug in Issue:
"Wallet connection fails on mobile"
Labels: @cursor, bug, status:ready
↓
Cursor investigates and fixes
↓
Comments: "Fixed, ready for deployment"
Changes labels: @replit, status:ready
↓
Replit deploys hotfix
↓
Closes Issue
```

### Scenario 3: Coordinated Update

```
Discussion in Issue:
"Need to update tokenomics"

Step 1: @codex update contract
Step 2: @cursor update frontend display
Step 3: @cursor update documentation
Step 4: @replit deploy to testnet
Step 5: @replit deploy to mainnet

Each AI changes labels as they complete their part.
```

---

## Automation Scripts (Optional)

### Auto-create Issues from Commits

```javascript
// scripts/create-followup-issue.js
// Run after significant commits to create next steps

const { Octokit } = require("@octokit/rest");

async function createFollowupIssue(commitMessage, filesChanged) {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  
  // Parse commit to determine next action
  if (commitMessage.includes('(Codex)') && filesChanged.includes('contracts/')) {
    await octokit.issues.create({
      owner: 'acee-chase',
      repo: 'ProofOfInfluence',
      title: 'Cursor: Integrate new contract changes',
      body: 'New contract deployed, please update frontend integration',
      labels: ['@cursor', 'status:ready', 'component:frontend']
    });
  }
}
```

---

## Comparison to MCP

| Feature | GitHub Webhooks | MCP Server |
|---------|----------------|------------|
| **Real-time** | ❌ (30s-2min delay) | ✅ (instant) |
| **Cost** | ✅ Free | ❌ $30-70/month |
| **Complexity** | ✅ Simple | ❌ Complex |
| **Reliability** | ✅ Very high | ⚠️ Single point failure |
| **Audit Trail** | ✅ Git + Issues | ⚠️ Needs logging |
| **Setup Time** | ✅ 1-2 days | ❌ 2-3 weeks |
| **Context Sharing** | ⚠️ Via Issues/Git | ✅ Built-in |
| **Tool Sharing** | ❌ Not supported | ✅ Supported |

**Recommendation:** Start with GitHub Webhooks. Upgrade to MCP only if you need real-time tool sharing.

---

## Troubleshooting

### Webhook Not Triggering

**Check:**
1. Webhook configured correctly in GitHub Settings
2. Endpoint URL accessible (test with curl)
3. Webhook secret matches
4. GitHub Webhook delivery logs

### AI Not Responding

**Possible causes:**
1. AI not monitoring Issues (check notification settings)
2. Label missing or incorrect
3. Issue description unclear
4. Dependency not resolved

**Solution:**
- Manually mention AI in comment: "@codex please check this"
- Verify labels are correct
- Add more context to Issue description

---

## Next Steps

1. Create GitHub labels (see above)
2. Configure webhooks (if using external Codex API)
3. Test with a sample Issue
4. Monitor and refine workflow

---

**Simple, reliable, cost-effective AI collaboration!**

Built on GitHub's proven infrastructure, no extra servers needed.

