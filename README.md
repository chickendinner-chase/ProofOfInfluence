# ProofOfInfluence

**ACEE Ventures** - 构建价值互联网

Acee 正在构建**价值互联网**——一个统一的基础设施，将影响力、身份、AI 行为和现实世界资产（RWA）标准化为可验证、可组合和可激励的价值单元。

**ProjectEX** 是价值互联网的社交金融枢纽，帮助品牌、创作者和用户将价值代币化、协调和变现。**Cyber Immortality** 是我们的旗舰项目，展示了 AI、身份和长期价值捕获的完整潜力。

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL (Neon recommended)
- Replit account (for deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/acee-chase/ProofOfInfluence.git
cd ProofOfInfluence

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Push database schema
npm run db:push

# Start development server
npm run dev
```

Visit `http://localhost:5000` to see the app.

## 📦 Features

### Core Modules

- **🛒 Spot Trading Market** - Decentralized $POI token trading
  - DEX integration (Uniswap V2)
  - CEX order matching
  - Real-time charts and analytics
  
- **💼 RWA Market** - Real-world asset tokenization
  - Luxury watches
  - Real estate
  - Art & collectibles

- **🎯 ProjectEX** - Social-financial hub for the Value Internet
  - Tokenization of RWA, IP, brand rights, and influence
  - On-chain coordination and trading
  - Incentive systems and identity/reputation
  - Complete influence monetization platform

### Platform Features

- **Multi-Wallet Support** - MetaMask, Coinbase, Phantom, Binance, OKX, WalletConnect
- **Stripe Payments** - Easy $POI token purchases with credit card
- **Access Control** - Role-based permissions (Guest/Web3/KYC)
- **Mobile Optimized** - DApp browser support, responsive design
- **Shareable Profiles** - Personal trading cards with embedded DEX

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- TailwindCSS + Shadcn UI
- AppKit (Reown) + wagmi + viem
- TanStack Query
- Wouter routing

### Backend
- Express + TypeScript
- Drizzle ORM
- PostgreSQL (Neon)
- Replit Auth + MetaMask
- Stripe Checkout

### Smart Contracts
- Solidity 0.8.20
- Hardhat
- OpenZeppelin
- Uniswap V2

#### Contract Suite

**已部署合约 (Base Sepolia) - 全部 9 个**:
- **POIToken** ✅ – `0x737869142C93078Dae4d78D4E8c5dbD45160565a` – Access-controlled ERC20 with pausing, blacklist controls, role-managed minting/burning, and permit support.
- **StakingRewards** ✅ – `0xe23f7688303768BB1CE2e2a98540A0C1ba63ec2d` – Staking rewards contract.
- **VestingVault** ✅ – `0xe4E695722C598CBa27723ab98049818b4b827924` – Multi-schedule linear vesting vault with revocation support.
- **MerkleAirdropDistributor** ✅ – `0xa3ae789eA6409ab5F92a69EC41dbA1E6f3C57A2e` – Multi-round POI distributor secured by Merkle proofs and replay protection.
- **EarlyBirdAllowlist** ✅ – `0x75D75a4870762422D85D275b22F5A87Df78b4852` – Merkle-based allocation tracker with consumer controls for TGE integrations.
- **TGESale** ✅ – `0x323b3197911603692729c6a5F7375d9AC8c3bA93` – Token generation event sale contract.
- **ReferralRegistry** ✅ – `0xD857D2E232031CD6311Fba80c62E3F11f7Fb9bD0` – On-chain inviter ledger with optional POI reward streaming.
- **AchievementBadges** ✅ – `0xe86C5077b60490A11316D40AB1368d7d73770E00` – Soulbound ERC721 achievements with configurable badge types.
- **ImmortalityBadge** ✅ – `0xbd637B458edbdb1dB420d220BF92F7bd02382000` – Immortality badge contract.

**部署脚本**: 
所有合约已部署完成。部署脚本位于 `scripts/` 目录：
```bash
# 部署脚本（所有合约已部署）
npm run deploy:token
npm run deploy:tge
npm run deploy:referral
npm run deploy:badges
npm run deploy:immortality

# 测试脚本
npm run test
```

**合约地址**: 所有地址已更新到 `shared/contracts/*.json`。详细列表见 `docs/CONTRACT_ADDRESSES.md`。

Each script prints constructor parameters, waits for confirmations, and persists ABI + address metadata, which powers backend calls via `shared/contracts`.

## 🤖 AI Collaboration

This project uses a **multi-AI collaboration system** coordinated by ChatGPT:

### Four AI Roles

- **💬 ChatGPT** - Project Manager (task planning & coordination)
- **🎨 Cursor AI** - Application development (frontend/backend/docs)
- **📜 Codex AI** - Smart contract development (Solidity/Hardhat)
- **🚀 Replit AI** - Deployment & operations (testing/staging/production)

### Collaboration Architecture

**ChatGPT Custom GPT + API Server:**
```
ChatGPT Custom GPT (Task planning)
    ↕ REST API
API Server (Replit:3001)
    ↕ GitHub API
GitHub Issues (Task management)
    ↕ Labels & Notifications
Cursor / Codex / Replit (Execution)
```

### How It Works

1. **ChatGPT creates tasks** via Custom GPT Actions
2. **API Server** creates GitHub Issues with appropriate labels
3. **AIs monitor** their assigned Issues (`@cursor`, `@codex`, `@replit`)
4. **AIs execute** tasks and update Issue comments
5. **ChatGPT monitors** progress and coordinates next steps

**Example interaction:**
```
You → ChatGPT Custom GPT:
"Create 3 tasks for Market module: backend API (Cursor), 
fee contract (Codex), deploy to testnet (Replit)"

ChatGPT:
✅ Created Issue #40 for Cursor
✅ Created Issue #41 for Codex  
✅ Created Issue #42 for Replit

Later:
"Check Cursor's progress"
→ "Cursor has 2 tasks in-progress, 1 completed"
```

### Setup Custom GPT

**Requirements:**
- ChatGPT Plus subscription
- GitHub Personal Access Token
- Replit deployment

**See**: [Custom GPT Setup Guide](docs/CUSTOM_GPT_SETUP.md)

### For Collaborators

- **Custom GPT Setup**: [docs/CUSTOM_GPT_SETUP.md](docs/CUSTOM_GPT_SETUP.md)
- **AI Collaboration**: [docs/AI_COLLABORATION_WEBHOOK.md](docs/AI_COLLABORATION_WEBHOOK.md)
- **Codex Rules**: [.codexrules](.codexrules)
- **Cursor Rules**: [.cursorrules](.cursorrules)
- **Git Workflow**: [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md)
- **Replit Workflow**: [docs/REPLIT_WORKFLOW.md](docs/REPLIT_WORKFLOW.md)

---

## 📚 Documentation

### 白皮书文档
- **[Whitepaper Overview](docs/whitepaper/README.md)** - 价值互联网愿景和产品栈概览
- **[Value Internet](docs/whitepaper/value-internet.md)** - 价值互联网架构和四层设计
- **[ProjectEX Platform](docs/whitepaper/projectex/overview.md)** - 社交金融枢纽详细说明
- **[Cyber Immortality](docs/whitepaper/cyber-immortality/overview.md)** - 旗舰项目介绍
- **[Contributing Guide](docs/whitepaper/contributing.md)** - 贡献指南
- **[API Documentation](docs/whitepaper/api-docs.md)** - API 集成指南

### 核心文档
- **[文档索引](docs/DOCUMENTATION_INDEX.md)** - 所有文档的索引和概览
- **[合约地址清单](docs/CONTRACT_ADDRESSES.md)** - 所有已部署合约地址
- **[部署和测试结果](docs/DEPLOYMENT_TEST_RESULTS.md)** - 最新部署状态和测试结果

### 开发指南
- **[Setup Guide](docs/SETUP.md)** - Wallet, payment, and token deployment
- **[Architecture](docs/ARCHITECTURE.md)** - System design and API specs
- **[Contract Testing](docs/CONTRACT_TESTING.md)** - 合约测试脚本使用指南
- **[Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md)** - Production deployment
- **[Environment Variables](docs/ENV_VARIABLES.md)** - Config reference
- **[Frontend Environment Variables](docs/ENV_VARIABLES_FRONTEND.md)** - 前端环境变量配置

### 工作流程
- **[Git Workflow](docs/GIT_WORKFLOW.md)** - Branch strategy and commit conventions
- **[Replit Workflow](docs/REPLIT_WORKFLOW.md)** - Deployment and operations
- **[AI Collaboration](docs/AI_COLLABORATION_WEBHOOK.md)** - How AIs work together

### 合约文档
- **[VestingVault](docs/contracts/VestingVault.md)** - 锁仓金库
- **[MerkleAirdropDistributor](docs/contracts/MerkleAirdropDistributor.md)** - 空投分发
- **[EarlyBirdAllowlist](docs/contracts/EarlyBirdAllowlist.md)** - 早鸟白名单

### 设计指南
- **[Design Guidelines](design_guidelines.md)** - UI/UX standards
- **[Design System Guide](docs/DESIGN_SYSTEM_GUIDE.md)** - Design system documentation

## 🗂️ Project Structure

```
ProofOfInfluence/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utilities
│   └── index.html
│
├── server/                  # Express backend
│   ├── index.ts            # Server entry
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Database layer
│   └── stripe.ts           # Payment integration
│
├── contracts/               # Smart contracts
│   └── POIToken.sol        # POI ERC20 token
│
├── scripts/                 # Deployment scripts
│   ├── deploy-token.ts
│   └── add-liquidity-v2.ts
│
├── docs/                    # Documentation
│   ├── SETUP.md
│   ├── ARCHITECTURE.md
│   ├── ENV_VARIABLES.md
│   └── DEPLOYMENT_CHECKLIST.md
│
├── shared/                  # Shared types
│   └── schema.ts
│
└── internal/                # Internal docs (gitignored)
```

## 🔐 Security

- Private keys stored in Replit Secrets (never committed)
- KYC/AML compliance for withdrawals
- JWT authentication + RBAC
- Rate limiting on all endpoints
- Stripe PCI-compliant payments

## 🌐 Networks

- **Mainnet**: Ethereum, Base, Arbitrum, Polygon
- **Testnets**: Sepolia, Base Sepolia

## 📖 Key Concepts

### Access Levels

| Level | Description | Features |
|-------|-------------|----------|
| **Guest** | Not authenticated | Public pages only |
| **Web3 Connected** | Wallet connected | Trading, staking, deposits |
| **KYC Verified** | KYC completed | Withdrawals, full access |

### Navigation

- **首页** - Platform overview
- **现货交易** - Spot trading market
- **RWA市场** - Real-world assets
- **ProjectX** - Product showcase
- **资源** - Documentation (dropdown)

## 🤝 Contributing

This is a private project. For collaborators:

1. Create feature branch from `main`
2. Follow naming: `feat/`, `fix/`, `refactor/`
3. Write clear commit messages
4. Submit PR for review
5. Ensure tests pass

## 📝 Development Workflow

### Cursor AI (Local Development)
- ✅ Code development
- ✅ Architecture design
- ✅ Code review
- ✅ Documentation

### Replit AI (Deployment)
- ✅ Deployment to production
- ✅ Environment configuration
- ✅ Secret management
- ✅ Testing validation

### GitHub Copilot (Coding Assistant)
- ✅ Code completion
- ✅ Pattern recognition
- ✅ Quick coding

## 🚀 Deployment

### Replit (Production)

1. Connect to Replit
2. Configure Secrets:
   - `DATABASE_URL`
   - `VITE_WALLETCONNECT_PROJECT_ID`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
3. Click "Run" to deploy

Visit your deployed app at `https://your-repl.replit.app`

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Type check
npm run check
```

## 📊 Status

- **Version**: v2.0.0
- **Status**: Active Development
- **License**: Private
- **Last Updated**: 2025-11-17

## 🔗 Links

- **Live Demo**: [Replit Deployment](https://proofofinfluence.replit.app)
- **Documentation**: [GitBook](https://docs.acee.ventures) (coming soon)
- **Smart Contracts**: [Contract Addresses](docs/TOKEN_DEPLOYMENT.md)

## 📞 Support

For issues or questions:
1. Check documentation in `/docs`
2. Review error logs
3. Contact development team

---

**Built with ❤️ by ACEE Ventures**

Powered by Replit | React | Express | PostgreSQL | Hardhat

