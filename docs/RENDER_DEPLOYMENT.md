# Render 部署指南

## 概述

ProofOfInfluence 现在使用 Render 进行 live 测试和生产部署。Render 不支持 Replit Auth，因此我们使用**钱包认证**作为主要认证方式。

## 认证架构

### 自动检测机制

系统会自动检测认证方式：
- **如果设置了 `REPL_ID`** → 使用 Replit Auth（仅适用于 Replit 环境）
- **如果未设置 `REPL_ID`** → 自动使用钱包认证（Render 部署）

### 认证优先级

统一的 `isAuthenticated` 中间件按以下优先级检查：
1. Replit Auth（如果启用）
2. 钱包 Session 认证
3. Auth Bypass（开发模式）

## Render 环境变量配置

### 必需的环境变量

在 Render Dashboard → Environment 中设置：

```env
# 数据库（PostgreSQL）
DATABASE_URL=postgresql://user:password@host:5432/database

# Session 配置（必需，用于钱包认证 session）
SESSION_SECRET=your-random-session-secret-here

# 应用域名（用于 wallet login message）
APP_DOMAIN=proofofinfluence.onrender.com
# 或使用 Render 自动提供的域名

# 不要设置 REPL_ID（这样会使用钱包认证）
# REPL_ID=  # 留空或不设置
```

### Web3 配置

```env
# 区块链网络
BASE_RPC_URL=https://sepolia.base.org
# 或主网: https://mainnet.base.org

# 合约地址
POI_TOKEN_ADDRESS=0x...
TGESALE_ADDRESS=0x...
STAKING_REWARDS_ADDRESS=0x...
VESTING_VAULT_ADDRESS=0x...
MERKLE_AIRDROP_ADDRESS=0x...
EARLY_BIRD_ALLOWLIST_ADDRESS=0x...

# AgentKit（如果使用）
CDP_API_KEY_NAME=...
CDP_API_KEY_PRIVATE_KEY=...
```

### 前端环境变量（Vite）

```env
VITE_CHAIN_ID=84532  # Base Sepolia 或 8453 (Base Mainnet)
VITE_BASE_RPC_URL=https://sepolia.base.org
VITE_POI_ADDRESS=0x...
VITE_TGESALE_ADDRESS=0x...
VITE_WALLETCONNECT_PROJECT_ID=...
```

### 可选配置

```env
# Stripe（如果使用支付）
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# 开发模式（仅用于测试）
# AUTH_BYPASS=true  # 仅在开发环境使用
# DEV_MODE_AUTH_BYPASS=true
```

## 部署步骤

### 1. 在 Render 创建 Web Service

1. 登录 Render Dashboard
2. 点击 "New" → "Web Service"
3. 连接 GitHub 仓库
4. 选择 `dev` 分支（或 `main` 用于生产）

### 2. 配置构建和启动命令

**Build Command:**
```bash
npm ci && npm run build
```

**Start Command:**
```bash
npm start
```

### 3. 设置环境变量

在 Render Dashboard → Environment 中添加所有必需的环境变量（见上方列表）

**重要：**
- ✅ **必须设置** `SESSION_SECRET`
- ✅ **必须设置** `DATABASE_URL`
- ❌ **不要设置** `REPL_ID`（留空，这样会使用钱包认证）

### 4. 数据库迁移

首次部署后，在 Render Shell 中运行：
```bash
npm run db:push
```

### 5. 验证部署

1. 检查服务是否启动：访问 `https://your-app.onrender.com`
2. 测试钱包登录：
   - 访问登录页面
   - 连接钱包
   - 调用 `/api/auth/wallet/nonce?address=0x...`
   - 签名 message
   - 调用 `/api/auth/wallet/login` 完成登录

## 钱包认证流程

### 前端流程

```typescript
// 1. 获取 nonce 和 message
const res = await fetch(`/api/auth/wallet/nonce?address=${address}`);
const { message } = await res.json();

// 2. 用户签名 message
const signature = await signMessageAsync({ message });

// 3. 登录
const loginRes = await fetch("/api/auth/wallet/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include", // 重要：带上 cookie
  body: JSON.stringify({ address, signature, message }),
});

const { user } = await loginRes.json();
```

### 后端流程

1. 生成 nonce 和 SIWE 风格 message
2. 验证签名
3. 创建/查找用户
4. 写入 session（`req.session.walletUser`）
5. 显式保存 session

## 常见问题

### Q: 为什么登录后立即调用 API 还是 401？

A: 确保在登录请求中使用了 `credentials: "include"`，并且后续 API 调用也带上这个选项。

### Q: Session 不持久？

A: 检查 `SESSION_SECRET` 是否正确设置。每次部署时 session secret 应该保持一致。

### Q: 如何测试钱包登录？

A: 
1. 使用 MetaMask 或其他钱包连接
2. 调用 `/api/auth/wallet/nonce` 获取 message
3. 签名 message
4. 调用 `/api/auth/wallet/login` 完成登录
5. 后续 API 调用带上 `credentials: "include"`

### Q: 可以同时支持 Replit Auth 和钱包认证吗？

A: 可以。如果设置了 `REPL_ID`，系统会优先使用 Replit Auth，否则使用钱包认证。在 Render 上不设置 `REPL_ID` 即可。

## 与 Replit 的区别

| 特性 | Replit | Render |
|------|--------|--------|
| 认证方式 | Replit Auth | 钱包认证 |
| Session Store | PostgreSQL | PostgreSQL（相同） |
| REPL_ID | 必需 | 不设置（留空） |
| SESSION_SECRET | 必需 | 必需 |
| DATABASE_URL | 必需 | 必需 |

## 安全提醒

- ✅ 使用 Render Secrets 管理敏感信息
- ✅ `SESSION_SECRET` 应该是随机生成的强密码
- ✅ 不要将 `.env` 文件提交到 Git
- ✅ 生产环境使用 HTTPS（Render 自动提供）
- ✅ 定期轮换 `SESSION_SECRET`（需要用户重新登录）

## 相关文档

- [环境变量配置](./ENV_VARIABLES.md)
- [前端环境变量](./ENV_VARIABLES_FRONTEND.md)
- [部署清单](./DEPLOYMENT_CHECKLIST.md)

