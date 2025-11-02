# ProofOfInfluence

> Web3-enabled Link-in-bio 平台，用影响力证明你的价值。

ProofOfInfluence 提供一个类似 Linktree 的个人链接聚合页面，并强化了 Web3 钱包验证与影响力数据展示功能。项目现在聚焦在交付稳定的 Link Bio 核心体验，同时保留一个轻量的 AI 协作流程，方便团队在需要时快速协同。

## ✨ 核心功能
- 🔐 **双重认证**：支持 Google OAuth 与 MetaMask Web3 钱包绑定。
- 🔗 **链接聚合**：集中展示创作者的社交账号、作品与重要入口。
- 📊 **数据分析**：跟踪页面浏览量与链接点击表现。
- 💰 **空投资格**：连接钱包即可同步空投白名单状态。
- 🎨 **自定义主题**：内建明暗主题，支持移动端自适应。

## 🛠️ 技术栈
### 前端
- **React 18** + **TypeScript**
- **Vite** 构建工具
- **TailwindCSS** 与 **Shadcn UI** 组件库
- **TanStack Query** 处理服务器状态
- **Wouter** 轻量路由

### 后端
- **Express** + **TypeScript** REST API
- **Drizzle ORM**（PostgreSQL）
- **Replit Auth** 以及计划中的 Web3 扩展

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
在根目录创建 `.env.local`：
```bash
DATABASE_URL=postgresql://user:password@host:5432/database
SESSION_SECRET=your-random-secret-here
PORT=5000
NODE_ENV=development
```

更多环境说明见 [docs/ENV_SETUP.md](docs/ENV_SETUP.md)。

### 4. 初始化数据库
```bash
npm run db:push
```

### 5. 启动开发服务器
```bash
npm run dev
```
访问 http://localhost:5173 查看效果。

## 📁 项目结构
```
ProofOfInfluence/
├── client/                 # 前端代码
│   └── src/
│       ├── components/     # 组件与 UI
│       ├── pages/          # 页面模块（Landing、Dashboard、PublicProfile）
│       └── hooks/          # 自定义 Hooks
├── server/                 # 后端服务
│   ├── index.ts            # Express 入口
│   ├── routes.ts           # API 路由
│   ├── storage.ts          # 数据持久化
│   └── replitAuth.ts       # Replit 登录整合
├── shared/                 # 前后端共享类型
│   └── schema.ts
├── docs/                   # 使用与开发文档
└── collaboration/          # 轻量 AI 协作速记
```

## 📖 文档
- [docs/QUICK_START.md](docs/QUICK_START.md)：10 分钟完成本地环境搭建。
- [docs/PROJECT.md](docs/PROJECT.md)：架构、API 与数据模型详解。
- [docs/ENV_SETUP.md](docs/ENV_SETUP.md)：环境变量与部署配置。
- [collaboration/README.md](collaboration/README.md)：精简版 AI 协作流程备忘。

## 🎯 路线图
### ✅ MVP
- [x] 用户认证（Google OAuth）
- [x] Web3 钱包连接
- [x] 链接管理
- [x] 公开资料页
- [x] 基础分析

### 🚧 规划中
- [ ] Landing 页面重新设计
- [ ] 社交分享优化
- [ ] 移动端交互细节打磨
- [ ] 自定义主题扩展
- [ ] 高级分析（UTM 追踪）

## 📄 许可证
MIT License

## 💬 联系
- GitHub Issues: [提交问题](https://github.com/你的用户名/ProofOfInfluence/issues)
- Email: your-email@example.com

欢迎贡献，一起打造好用的 Link Bio 体验！
