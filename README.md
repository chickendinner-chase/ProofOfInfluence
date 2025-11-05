# ProofOfInfluence

> Web3-enabled Link-in-bio 平台，用影响力证明你的价值。

ProofOfInfluence 提供一个类似 Linktree 的个人链接聚合页面，并强化了 Web3 钱包验证与影响力数据展示功能。项目现在聚焦在交付稳定的 Link Bio 核心体验，同时保留一个轻量的 AI 协作流程，方便团队在需要时快速协同。

## ✨ 核心功能
- 🔐 **双重认证**：支持 Google OAuth 与 MetaMask Web3 钱包绑定。
- 💳 **Stripe支付**：简化支付流程，专注 $POI Token 购买，支持预设金额和自定义金额。
- 🪙 **POI Token**：ERC20 代币系统，支持一键部署和 Uniswap V2 流动性管理。
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

### Web3
- **Solidity 0.8.20** 智能合约
- **Hardhat** 开发框架
- **OpenZeppelin** 合约库
- **Ethers.js v5** 以太坊交互

## 🚀 Replit 部署

本项目**仅在 Replit 上部署和运行**，不支持本地开发。

### 1. Fork 项目到 Replit
1. 访问 [Replit](https://replit.com/)
2. 点击 "Create Repl" → "Import from GitHub"
3. 输入仓库 URL：`https://github.com/chickendinner-chase/ProofOfInfluence`

### 2. 配置 Secrets（环境变量）
在 Replit 中点击 **Secrets**（锁图标），添加以下密钥：

```
DATABASE_URL=你的Neon数据库URL
SESSION_SECRET=随机生成的密钥
STRIPE_SECRET_KEY=你的Stripe密钥
STRIPE_PUBLISHABLE_KEY=你的Stripe公钥
BASE_URL=你的Replit应用URL
```

### 3. 初始化数据库
在 Replit Shell 运行：
```bash
npm run db:push
```

### 4. 运行项目
点击 Replit 的 **Run** 按钮，项目会自动启动。

### 5. 自动部署
推送到 GitHub 后，Replit 会自动检测变更并重新部署。

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
├── contracts/              # 智能合约 🆕
│   └── POIToken.sol        # POI ERC20 代币
├── scripts/                # 部署脚本 🆕
│   ├── deploy-token.ts
│   ├── add-liquidity-v2.ts
│   └── deploy-and-add-liquidity.ts
├── shared/                 # 前后端共享类型
│   └── schema.ts
├── docs/                   # 使用与开发文档
├── deployments/            # 部署记录 🆕
└── hardhat.config.ts       # Hardhat 配置 🆕
```

## 📖 文档

### 应用部署
- [docs/STRIPE_SETUP.md](docs/STRIPE_SETUP.md)：💳 Stripe支付配置（Replit）
- [replit.yaml](replit.yaml)：Replit 部署配置
- [design_guidelines.md](design_guidelines.md)：UI/UX 设计规范

### POI Token 部署 🆕
- **[README_POI_TOKEN.md](README_POI_TOKEN.md)**：🪙 POI Token 系统总览
- **[docs/QUICK_START_POI.md](docs/QUICK_START_POI.md)**：⚡ 5分钟快速部署指南
- [docs/TOKEN_DEPLOYMENT.md](docs/TOKEN_DEPLOYMENT.md)：📚 完整部署文档
- [docs/ENV_VARIABLES.md](docs/ENV_VARIABLES.md)：🔧 环境变量配置

## 🎯 路线图
### ✅ MVP
- [x] 用户认证（Google OAuth）
- [x] Web3 钱包连接
- [x] 链接管理
- [x] 公开资料页
- [x] 基础分析
- [x] POI Token 合约与部署系统 🆕

### 🚧 规划中
- [ ] Landing 页面重新设计
- [ ] 社交分享优化
- [ ] 移动端交互细节打磨
- [ ] 自定义主题扩展
- [ ] 高级分析（UTM 追踪）
- [ ] POI Token 前端集成（交易、余额展示）

## 📄 许可证
MIT License

## 💬 联系
- GitHub Issues: [提交问题](https://github.com/你的用户名/ProofOfInfluence/issues)
- Email: your-email@example.com

欢迎贡献，一起打造好用的 Link Bio 体验！
