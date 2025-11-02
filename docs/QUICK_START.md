# ProofOfInfluence 快速开始指南

## 🚀 10分钟上手

### 前置要求
- Node.js 20+
- Git
- GitHub 账户
- Replit 账户（可选，用于部署）

---

## 1️⃣ 克隆项目

```bash
git clone https://github.com/你的用户名/ProofOfInfluence.git
cd ProofOfInfluence
```

---

## 2️⃣ 安装依赖

```bash
npm install
```

---

## 3️⃣ 配置环境变量

创建 `.env.local` 文件：

```bash
# 复制模板
cp .env.example .env.local

# 编辑配置
# 需要填入实际的数据库 URL 和密钥
```

### 获取 Neon PostgreSQL 数据库
1. 访问 https://neon.tech/
2. 注册并创建新项目
3. 复制连接字符串到 `DATABASE_URL`

### 生成 SESSION_SECRET
```bash
# 在终端生成随机密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 4️⃣ 初始化数据库

```bash
npm run db:push
```

这会创建所需的数据库表。

---

## 5️⃣ 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 查看应用。

---

## 6️⃣ 连接 Replit（可选，用于部署）

### 方式 A: 从 GitHub 导入
1. 登录 Replit.com
2. Create → Import from GitHub
3. 选择 `ProofOfInfluence` 仓库
4. 等待自动配置完成

### 方式 B: 手动连接
```bash
# 在 Replit Shell 中
git remote add origin https://github.com/你的用户名/ProofOfInfluence.git
git pull origin main
```

### 配置 Replit Secrets
在 Replit 的 Secrets 面板添加：
```
DATABASE_URL = <你的 Neon 数据库 URL>
SESSION_SECRET = <你的密钥>
```

### 设置自动部署
1. Replit → Deployments
2. New deployment → Autoscale
3. Branch: `main`
4. 启用 "Auto-deploy on push"

---

## 7️⃣ 开始开发

### 创建功能分支
```bash
git checkout -b feat/my-new-feature
```

### 修改代码
使用 Cursor 或其他编辑器修改代码。

### 提交更改
```bash
git add .
git commit -m "feat: add my new feature"
git push origin feat/my-new-feature
```

### 合并到主分支
在 GitHub 上创建 Pull Request，审查后合并到 `main`。

Replit 会自动检测并部署。

---

## 📁 项目结构

```
ProofOfInfluence/
├── client/              # React 前端
│   ├── src/
│   │   ├── components/  # 组件
│   │   ├── pages/       # 页面
│   │   └── hooks/       # Hooks
│   └── index.html
├── server/              # Express 后端
│   ├── index.ts         # 入口
│   ├── routes.ts        # API 路由
│   └── storage.ts       # 数据库
├── shared/
│   └── schema.ts        # 数据库 Schema
└── package.json
```

---

## 🛠️ 常用命令

```bash
# 开发
npm run dev         # 启动开发服务器
npm run build       # 构建生产版本
npm run start       # 启动生产服务器

# 数据库
npm run db:push     # 推送 Schema 变更

# 代码质量
npm run check       # TypeScript 类型检查
```

---

## 🔍 功能测试

### 测试用户注册流程
1. 访问 http://localhost:5173
2. 点击 "Sign in with Google"
3. 使用 Replit Auth 登录
4. 应该跳转到 Dashboard

### 测试链接管理
1. 在 Dashboard 切换到 "Links" 标签
2. 点击 "Add Link"
3. 填写标题和 URL
4. 保存后应该显示在列表中

### 测试公开资料
1. 在 Profile 标签设置 username
2. 点击 "Preview" 按钮
3. 应该打开你的公开资料页

---

## 🐛 常见问题

### 端口已被占用
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5173 | xargs kill
```

### 数据库连接失败
- 检查 `.env.local` 中的 `DATABASE_URL` 是否正确
- 确认 Neon 数据库是否正常运行
- 检查网络连接

### TypeScript 错误
```bash
# 清除缓存重新构建
rm -rf node_modules dist
npm install
npm run check
```

---

## 📚 下一步

- 阅读 [WORKFLOW.md](../WORKFLOW.md) 了解完整开发流程
- 查看 [design_guidelines.md](../design_guidelines.md) 了解设计规范
- 阅读 `.cursorrules` 了解代码规范

---

**需要帮助？** 查看 [WORKFLOW.md](../WORKFLOW.md) 或在 GitHub Issues 提问。

