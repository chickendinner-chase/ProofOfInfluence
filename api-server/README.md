# API Server for ProofOfInfluence

RESTful API server that enables ChatGPT Custom GPT to manage GitHub Issues for AI collaboration.

## Quick Start

### Installation

```bash
cd api-server
npm install
```

### Configuration

Create `.env` file or use Replit Secrets:

```env
GITHUB_TOKEN=ghp_your_github_personal_access_token
API_SECRET_KEY=your_secret_key_for_authentication
API_PORT=3001
```

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
      "labels": ["@cursor", "status:in-progress"],
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

**API Server ready for Custom GPT integration!**

