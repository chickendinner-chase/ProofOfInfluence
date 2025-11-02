# ProofOfInfluence

> Web3-enabled link-in-bio platform - 用影响力证明你的价值

一个类似 Linktree 的个人链接展示平台，集成 Web3 钱包功能，为内容创作者提供影响力数据追踪和空投资格验证。

## 🤝 4方协作系统

本项目采用独特的 **ChatGPT + Cursor + Replit + 人工** 四方协作模式，实现高效的 AI 辅助开发：

| 工具 | 角色 | 职责 |
|------|------|------|
| **ChatGPT** | 战略规划师 | 需求分析、架构设计、问题诊断 |
| **Cursor** | 编码执行官 | 代码实现、调试重构、本地测试 |
| **Replit** | 部署运维官 | 自动部署、环境管理、日志监控 |
| **人工** | 决策指挥官 | 质量把关、流程控制、效果评估 |

📋 **开始工作**: [每日工作检查清单](CHECKLIST.md)  
📖 **详细指南**: [4方协作完整文档](COLLABORATION.md)  
🔄 **工作流程**: [开发工作流](WORKFLOW.md)

---

## ✨ 核心功能

- 🔐 **双重认证**: Google OAuth + MetaMask Web3 钱包
- 🔗 **链接聚合**: 在一个页面展示所有重要链接
- 📊 **数据分析**: 实时追踪页面浏览量和链接点击数
- 💰 **空投资格**: 连接钱包自动获得空投资格
- 🎨 **自定义设计**: 支持明暗主题，响应式设计
- 🚀 **一键部署**: Replit 自动部署，零配置上线

---

## 🛠️ 技术栈

### 前端
- **React 18** + **TypeScript** - 类型安全的组件化开发
- **Vite** - 极速构建工具
- **TailwindCSS** + **Shadcn UI** - 现代化 UI 组件库
- **TanStack Query** - 强大的服务器状态管理
- **Wouter** - 轻量级路由

### 后端
- **Express** + **TypeScript** - RESTful API 服务
- **Drizzle ORM** - 类型安全的数据库 ORM
- **PostgreSQL (Neon)** - Serverless 数据库
- **Replit Auth** - 基于 OpenID Connect 的认证

### Web3
- **MetaMask** - 浏览器钱包集成
- **ethers.js** - 以太坊交互（计划中）

---

## 🚀 快速开始

### 前置要求
- Node.js 20+
- PostgreSQL 数据库（推荐 Neon）
- Git

### 1. 克隆项目
```bash
git clone https://github.com/你的用户名/ProofOfInfluence.git
cd ProofOfInfluence
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
创建 `.env.local` 文件：
```bash
DATABASE_URL=postgresql://user:password@host:5432/database
SESSION_SECRET=your-random-secret-here
PORT=5000
NODE_ENV=development
```

> 详细配置说明见 [docs/QUICK_START.md](docs/QUICK_START.md)

### 4. 初始化数据库
```bash
npm run db:push
```

### 5. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:5173 🎉

---

## 📁 项目结构

```
ProofOfInfluence/
├── client/                 # 前端代码
│   └── src/
│       ├── components/     # React 组件
│       │   ├── ui/        # Shadcn UI 基础组件
│       │   └── *.tsx      # 业务组件
│       ├── pages/         # 页面组件
│       │   ├── Landing.tsx      # 落地页
│       │   ├── Dashboard.tsx    # 用户仪表板
│       │   └── PublicProfile.tsx # 公开资料页
│       └── hooks/         # 自定义 Hooks
├── server/                # 后端代码
│   ├── index.ts          # Express 服务器入口
│   ├── routes.ts         # API 路由定义
│   ├── storage.ts        # 数据库抽象层
│   └── replitAuth.ts     # 认证逻辑
├── shared/
│   └── schema.ts         # 数据库 Schema 和类型定义
├── .cursorrules          # Cursor AI 开发规则
├── WORKFLOW.md           # 开发工作流文档
└── docs/                 # 项目文档
```

---

## 🔧 开发命令

```bash
# 开发
npm run dev         # 启动开发服务器（前端 5173 + 后端 5000）
npm run build       # 构建生产版本
npm run start       # 启动生产服务器

# 代码质量
npm run check       # TypeScript 类型检查

# 数据库
npm run db:push     # 推送 Schema 变更到数据库
```

---

## 📊 数据库结构

### users 表
- 存储用户认证信息（Google OAuth）
- 关联 Web3 钱包地址
- 自定义 username

### profiles 表
- 公开展示信息（姓名、头像、简介）
- 社交媒体链接
- 浏览量统计

### links 表
- 用户创建的链接
- 点击统计
- 排序和可见性控制

---

## 🌐 部署

### Replit 部署（推荐）

1. **导入项目**
   - 访问 Replit.com
   - Create → Import from GitHub
   - 选择此仓库

2. **配置环境变量**
   - 在 Replit Secrets 添加：
     - `DATABASE_URL`
     - `SESSION_SECRET`

3. **设置自动部署**
   - Deployments → New deployment
   - 选择 "Autoscale"
   - Branch: `main`
   - 启用 "Auto-deploy on push"

4. **推送代码触发部署**
   ```bash
   git push origin main
   ```

详细部署指南见 [WORKFLOW.md](WORKFLOW.md)

---

## 🔄 工作流

我们使用简化的 GitFlow 工作流：

```
main          → 生产环境（自动部署到 Replit）
feat/*        → 功能开发分支
fix/*         → Bug 修复分支
```

### 典型开发流程
1. 从 `main` 创建功能分支
2. 在 Cursor 中开发并本地测试
3. 提交代码到 GitHub
4. 创建 Pull Request
5. 合并到 `main` 触发自动部署

详细工作流见 [WORKFLOW.md](WORKFLOW.md)

---

## 🤝 协作工具集成

### ChatGPT (规划和咨询)
- 架构设计和技术选型
- 代码审查和优化建议
- 文档和文案生成

### Cursor (主力开发)
- AI 辅助编码
- 智能代码补全
- 多文件重构

### GitHub (版本控制)
- 代码托管
- Pull Request 审查
- 自动化部署触发

### Replit (部署平台)
- 一键部署
- 自动扩容
- 日志监控

---

## 📖 文档

### 协作系统
- **[每日工作检查清单](CHECKLIST.md)** ⭐ - 每次工作必看
- **[4方协作指南](COLLABORATION.md)** ⭐ - 完整协作协议
- [开发工作流](WORKFLOW.md) - 详细流程说明

### 开发指南
- [快速开始](docs/QUICK_START.md) - 10分钟上手
- [环境配置](docs/ENV_SETUP.md) - 环境变量设置
- [设计规范](design_guidelines.md) - UI/UX 指南
- [Cursor 规则](.cursorrules) - AI 开发规范

### 交接文档
- [配置完成](docs/SETUP_COMPLETE.md) - 配置验证清单
- [交接总结](docs/HANDOFF_SUMMARY.md) - 完整交接说明

---

## 🎯 路线图

### ✅ MVP (已完成)
- [x] 用户认证（Google OAuth）
- [x] Web3 钱包连接
- [x] 链接管理
- [x] 公开资料页
- [x] 基础分析

### 🚧 V1.0 (进行中)
- [ ] Landing 页面重设计
- [ ] 用户评价展示
- [ ] 社交分享优化
- [ ] 移动端优化

### 📅 V2.0 (计划中)
- [ ] 自定义主题
- [ ] 高级分析（UTM 追踪）
- [ ] NFT 展示
- [ ] 空投管理面板
- [ ] API 开放

---

## 🤔 常见问题

### 如何获取数据库连接？
推荐使用 [Neon](https://neon.tech/)，它提供免费的 Serverless PostgreSQL。

### 如何部署到自己的服务器？
项目支持任何 Node.js 环境，运行 `npm run build && npm start` 即可。

### 如何自定义设计？
修改 `client/src/index.css` 中的 CSS 变量，或直接修改组件的 Tailwind 类名。

### 支持哪些钱包？
目前支持 MetaMask，未来会添加 WalletConnect 支持更多钱包。

---

## 🙏 鸣谢

- [Shadcn UI](https://ui.shadcn.com/) - 优雅的组件库
- [Drizzle ORM](https://orm.drizzle.team/) - 类型安全的 ORM
- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [Replit](https://replit.com/) - 一键部署平台

---

## 📄 许可证

MIT License

---

## 💬 联系我们

- GitHub Issues: [提交问题](https://github.com/你的用户名/ProofOfInfluence/issues)
- Email: your-email@example.com

---

**用影响力证明你的价值 🚀**

