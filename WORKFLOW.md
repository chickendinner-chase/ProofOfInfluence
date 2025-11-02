# ProofOfInfluence 工作流文档

## 🎯 开发流程概览

```
ChatGPT (规划) → Cursor (开发) → GitHub (版本控制) → Replit (部署)
```

---

## 👥 工具职责划分

### 1. ChatGPT (规划师和顾问)
- **用途**: 架构设计、需求分析、问题解决
- **时间占比**: 15%

**典型对话**:
```
"我要重新设计 Landing 页面，目标用户是 Web3 创作者。
需要突出：
1. 影响力证明
2. 空投资格
3. 数据分析

请给我：
- 页面结构建议
- 组件列表
- 文案方向"
```

### 2. Cursor (主力开发工具)
- **用途**: 编写代码、调试、重构
- **时间占比**: 70%

**核心快捷键**:
- `Ctrl/Cmd + K`: 行内快速编辑
- `Ctrl/Cmd + L`: Chat（询问代码问题）
- `Ctrl/Cmd + I`: Composer（多文件编辑）

**工作模式**:
```bash
# 1. 创建功能分支
git checkout -b feat/new-feature

# 2. 使用 Cursor AI 编写代码
# 在 Composer 中输入：
"创建 Testimonials.tsx 组件，使用 Shadcn Card，
支持左右滑动，参考 design_guidelines.md"

# 3. 本地测试
npm run dev

# 4. 提交代码
git add .
git commit -m "feat: add testimonials carousel"
git push origin feat/new-feature
```

### 3. GitHub (代码仓库)
- **用途**: 版本控制、代码托管、触发部署
- **时间占比**: 10%

**分支策略（MVP 简化版）**:
```
main          → 生产环境 (Replit 自动部署)
feat/*        → 功能开发
fix/*         → Bug 修复
```

### 4. Replit (部署平台)
- **用途**: 自动部署、生产环境、日志查看
- **时间占比**: 5%

**自动部署设置**:
1. Replit → Deployments → New deployment
2. 选择 "Autoscale"
3. Branch: `main`
4. 启用 "Auto-deploy on push"

---

## 🔄 日常开发循环

### 场景 A: 开发新功能 (标准流程)

```bash
# === 步骤 1: 规划 (ChatGPT, 5分钟) ===
# 在 ChatGPT 中讨论功能设计、获取代码骨架

# === 步骤 2: 开发 (Cursor, 30分钟) ===
cd D:\chickendinner\ProofOfInfluence
git checkout -b feat/landing-testimonials

# 使用 Cursor Composer 生成代码
# 本地测试
npm run dev

# === 步骤 3: 提交 (GitHub, 2分钟) ===
git add .
git commit -m "feat: add testimonials section to landing"
git push origin feat/landing-testimonials

# === 步骤 4: 合并 (GitHub Web, 1分钟) ===
# 在 GitHub 上创建 Pull Request
# 审查后点击 "Merge pull request"

# === 步骤 5: 部署 (Replit, 自动) ===
# Replit 自动检测到 main 分支更新
# 约 1-2 分钟后部署完成
# 访问生产 URL 验证
```

**总耗时**: 约 40 分钟

---

### 场景 B: 快速修复 (简化流程)

```bash
# 直接在 main 分支修改（小改动）
git checkout main
git pull

# 在 Cursor 中修改文件
# 例如：修改文案、调整样式

git add .
git commit -m "fix: update landing hero text"
git push origin main

# Replit 自动部署（约30秒）
```

**总耗时**: 约 5 分钟

---

### 场景 C: 解决问题 (ChatGPT + Cursor)

```
# === 遇到错误 ===
1. 复制错误信息到 ChatGPT
2. ChatGPT 提供解决方案
3. 在 Cursor 中应用修复
4. 测试验证
5. 提交修复

# === 示例 ===
ChatGPT 提问:
"我的 React 组件报错：
Error: Cannot read property 'map' of undefined

代码：
const { data: links } = useQuery(['/api/links']);
return links.map(link => <LinkItem key={link.id} {...link} />);

如何修复？"

ChatGPT 回答 → 在 Cursor 中应用 → 测试 → 提交
```

---

## 📁 项目结构

```
ProofOfInfluence/
├── .cursorrules           # Cursor AI 规则（重要！）
├── .github/
│   └── pull_request_template.md
├── client/                # 前端代码
│   └── src/
│       ├── components/    # React 组件
│       ├── pages/         # 页面
│       └── hooks/         # 自定义 hooks
├── server/                # 后端代码
│   ├── index.ts          # Express 服务器
│   ├── routes.ts         # API 路由
│   └── storage.ts        # 数据库层
├── shared/
│   └── schema.ts         # 共享类型和 Schema
├── package.json
├── .gitignore
└── WORKFLOW.md           # 本文件
```

---

## 🛠️ 常用命令

### 开发
```bash
npm run dev         # 启动开发服务器
npm run check       # TypeScript 类型检查
npm run build       # 构建生产版本
```

### 数据库
```bash
npm run db:push     # 推送 Schema 变更到数据库
```

### Git
```bash
git status                          # 查看状态
git checkout -b feat/feature-name   # 创建新分支
git add .                           # 暂存所有改动
git commit -m "feat: description"   # 提交
git push origin branch-name         # 推送到 GitHub
git checkout main                   # 切换到 main 分支
git pull origin main                # 拉取最新代码
```

---

## 🔐 环境变量配置

### 本地开发 (.env.local)
```bash
DATABASE_URL=postgresql://...
SESSION_SECRET=local-dev-secret
PORT=5000
NODE_ENV=development
```

### Replit 生产环境 (Secrets 面板)
```
DATABASE_URL = <Neon 生产数据库>
SESSION_SECRET = <随机生成的密钥>
```

**注意**: 永远不要提交 `.env` 文件到 Git！

---

## 🚨 常见问题

### Q1: Replit 没有自动部署？
**检查清单**:
1. ✅ Replit Deployment 是否启用了 "Auto-deploy on push"？
2. ✅ 推送的是 `main` 分支吗？
3. ✅ GitHub 仓库与 Replit 是否正确连接？
4. ✅ 查看 Replit Deployments 页面的部署日志

### Q2: 本地运行正常，Replit 报错？
**常见原因**:
1. 环境变量缺失 → 检查 Replit Secrets
2. 端口号问题 → 确保代码使用 `process.env.PORT`
3. 数据库连接失败 → 验证 DATABASE_URL

### Q3: Git push 被拒绝？
```bash
# 拉取远程更新后重试
git pull origin main --rebase
git push origin main
```

### Q4: TypeScript 报错？
```bash
# 运行类型检查
npm run check

# 查看具体错误并修复
```

---

## 📊 开发时间分配建议

### MVP 阶段（当前）
- **开发新功能**: 70%
- **修复 Bug**: 15%
- **文档和优化**: 10%
- **学习和规划**: 5%

### 每日节奏
```
上午:
09:00 - 09:30  ChatGPT 规划今日任务
09:30 - 12:00  Cursor 开发核心功能

下午:
14:00 - 17:00  Cursor 继续开发/调试
17:00 - 17:30  提交代码、创建 PR

晚上:
20:00 - 20:30  审查 PR、合并到 main
20:30 -        Replit 自动部署、验证
```

---

## 🎯 MVP 开发原则

1. **功能优先**: 先让功能能用，再考虑优化
2. **小步快跑**: 每次改动保持小范围
3. **快速验证**: 频繁部署，及时获取反馈
4. **延迟优化**: 性能优化在功能稳定后进行
5. **简单直接**: 避免过度设计和抽象

---

## 📚 学习资源

- **React Query**: https://tanstack.com/query/latest/docs/react/overview
- **Shadcn UI**: https://ui.shadcn.com/
- **Drizzle ORM**: https://orm.drizzle.team/
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## 🔄 版本管理

### Commit 规范
```
feat: 新功能
fix: Bug 修复
refactor: 重构
style: 样式调整
docs: 文档更新
chore: 构建/工具变更

示例:
feat: add user testimonials to landing page
fix: wallet connection timeout issue
refactor: simplify profile update logic
```

### 分支命名
```
feat/[功能名称]    # 新功能
fix/[问题描述]     # Bug 修复
refactor/[模块名]  # 重构

示例:
feat/landing-redesign
fix/wallet-disconnect-error
refactor/auth-flow
```

---

## ✅ 工作流检查清单

### 开发前
- [ ] 拉取最新代码 (`git pull origin main`)
- [ ] 确认本地环境变量配置正确
- [ ] 本地开发服务器能正常启动

### 开发中
- [ ] 遵循 .cursorrules 中的规范
- [ ] 频繁保存和测试
- [ ] 使用有意义的变量和函数名

### 提交前
- [ ] 本地测试通过
- [ ] 没有 TypeScript 错误
- [ ] 移动端和桌面端都检查过
- [ ] 没有 console.log 和调试代码
- [ ] 没有提交敏感信息

### 部署后
- [ ] 访问生产 URL 验证功能
- [ ] 检查关键流程是否正常
- [ ] 查看 Replit 日志确认无错误

---

**祝开发顺利！🚀**

