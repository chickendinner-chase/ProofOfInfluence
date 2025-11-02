# 环境变量配置指南

## 📝 概述

本项目使用环境变量来管理敏感配置信息。本地开发和生产环境使用不同的配置文件。

---

## 🔧 本地开发配置

### 创建 .env.local 文件

在项目根目录创建 `.env.local` 文件（此文件已在 .gitignore 中，不会被提交）：

```bash
# 数据库配置
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# 会话密钥（必须）
SESSION_SECRET=your-random-secret-key-here-change-in-production

# 服务器配置
PORT=5000
NODE_ENV=development

# Replit Auth 配置（如果使用 Replit）
REPL_ID=your-repl-id
REPL_OWNER=your-username

# 可选：其他第三方服务
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🗄️ 获取 DATABASE_URL

### 方式 A: Neon (推荐)

1. 访问 https://neon.tech/
2. 注册并登录
3. 创建新项目
4. 复制连接字符串（类似于）：
   ```
   postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. 粘贴到 `.env.local` 的 `DATABASE_URL`

### 方式 B: 其他 PostgreSQL 提供商

- **Supabase**: https://supabase.com/
- **Railway**: https://railway.app/
- **Heroku Postgres**: https://www.heroku.com/postgres

### 方式 C: 本地 PostgreSQL

```bash
# 安装 PostgreSQL 后
DATABASE_URL=postgresql://postgres:password@localhost:5432/proofofinfluence
```

---

## 🔑 生成 SESSION_SECRET

使用 Node.js 生成安全的随机密钥：

```bash
# 在终端运行
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

输出类似于：
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

复制这个字符串到 `SESSION_SECRET`。

---

## 🌐 Replit 生产环境配置

### 在 Replit 配置 Secrets

1. 打开 Replit 项目
2. 点击左侧的 "Secrets" 图标（锁形状）
3. 添加以下 Secrets：

| Key | Value | 说明 |
|-----|-------|------|
| `DATABASE_URL` | `postgresql://...` | Neon 生产数据库连接 |
| `SESSION_SECRET` | `<随机生成的密钥>` | 生产环境会话密钥 |
| `NODE_ENV` | `production` | 生产环境标识 |

### 自动注入

Replit 会自动将 Secrets 注入为环境变量，无需额外配置。

---

## 🔍 环境变量说明

### 必需变量

#### DATABASE_URL
- **说明**: PostgreSQL 数据库连接字符串
- **格式**: `postgresql://user:password@host:port/database?sslmode=require`
- **本地**: 可以使用测试数据库
- **生产**: 必须使用生产数据库（避免数据混淆）

#### SESSION_SECRET
- **说明**: Express session 加密密钥
- **格式**: 至少 32 字符的随机字符串
- **安全**: 本地和生产必须使用不同的密钥
- **生成**: 使用 `crypto.randomBytes(32).toString('hex')`

### 可选变量

#### PORT
- **说明**: 服务器监听端口
- **默认**: `5000`
- **Replit**: 自动使用 `process.env.PORT`（无需配置）

#### NODE_ENV
- **说明**: 运行环境标识
- **值**: `development` | `production` | `test`
- **作用**: 影响日志级别、错误显示等

#### REPL_ID / REPL_OWNER
- **说明**: Replit Auth 所需（仅在 Replit 环境）
- **获取**: Replit 自动注入，无需手动配置

---

## ✅ 验证配置

### 检查环境变量是否正确加载

创建测试文件 `test-env.js`：

```javascript
import 'dotenv/config';

console.log('Environment Variables Check:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓ Set' : '✗ Missing');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? '✓ Set' : '✗ Missing');
console.log('PORT:', process.env.PORT || '5000 (default)');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development (default)');
```

运行：
```bash
node test-env.js
```

### 测试数据库连接

```bash
npm run db:push
```

如果成功，说明数据库配置正确。

---

## 🚨 常见问题

### Q1: 启动时提示 "DATABASE_URL is not defined"

**原因**: 环境变量未正确加载

**解决**:
```bash
# 1. 确认 .env.local 存在且配置正确
ls -la .env.local

# 2. 检查文件内容
cat .env.local

# 3. 重启开发服务器
npm run dev
```

### Q2: 数据库连接超时

**原因**: 数据库 URL 错误或网络问题

**解决**:
1. 检查 DATABASE_URL 格式是否正确
2. 确认数据库服务正在运行
3. 检查防火墙/网络设置
4. 尝试在浏览器访问数据库管理面板

### Q3: Replit 部署失败

**原因**: Secrets 未配置或配置错误

**解决**:
1. 确认 Replit Secrets 中已添加所有必需变量
2. 检查变量名是否完全匹配（区分大小写）
3. 重新部署：Deployments → Redeploy

---

## 🔐 安全最佳实践

### ✅ 做什么
- ✅ 使用不同的密钥用于本地和生产
- ✅ 定期轮换生产环境的 SESSION_SECRET
- ✅ 使用 `.gitignore` 防止 `.env` 文件被提交
- ✅ 使用环境变量管理服务（如 Replit Secrets）

### ❌ 不要做什么
- ❌ 永远不要在代码中硬编码密钥
- ❌ 不要将 `.env` 文件提交到 Git
- ❌ 不要在公共场所（文档、Issue）分享真实密钥
- ❌ 不要在生产环境使用简单/默认密钥

---

## 📋 检查清单

开发前确认：
- [ ] `.env.local` 文件已创建
- [ ] `DATABASE_URL` 已配置且可连接
- [ ] `SESSION_SECRET` 已生成（不是默认值）
- [ ] 本地开发服务器能正常启动

部署前确认：
- [ ] Replit Secrets 已配置所有必需变量
- [ ] 生产数据库 URL 与本地不同
- [ ] 生产 SESSION_SECRET 与本地不同
- [ ] 已测试部署后的连接

---

## 📚 相关文档

- [快速开始指南](QUICK_START.md)
- [开发工作流](../WORKFLOW.md)
- [Neon 文档](https://neon.tech/docs/)
- [Replit Secrets](https://docs.replit.com/programming-ide/workspace-features/secrets)

---

**需要帮助？** 查看 [WORKFLOW.md](../WORKFLOW.md) 或在 GitHub Issues 提问。

