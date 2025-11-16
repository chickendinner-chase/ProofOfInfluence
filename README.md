# ProofOfInfluence

**ACEE Ventures** - 一站式影响力变现平台

ProofOfInfluence (projectX) 是 ACEE Ventures 研发的 Web3 影响力变现平台，$POI 作为流量价值载体，帮助创作者和品牌将影响力转化为真实价值。

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

- **🎯 ProjectX** - Complete influence monetization platform
  - Token issuance
  - Community management  
  - Value circulation

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
- **POIToken** – Access-controlled ERC20 with pausing, blacklist controls, role-managed minting/burning, and permit support. Deployment artifact: `shared/contracts/poi.json`.
- **VestingVault** – Multi-schedule linear vesting vault with revocation support (`shared/contracts/vesting_vault.json`).
- **MerkleAirdropDistributor** – Multi-round POI distributor secured by Merkle proofs and replay protection (`shared/contracts/merkle_airdrop.json`).
- **EarlyBirdAllowlist** – Merkle-based allocation tracker with consumer controls for TGE integrations (`shared/contracts/early_bird_allowlist.json`).
- **ReferralRegistry** – On-chain inviter ledger with optional POI reward streaming (`shared/contracts/referral_registry.json`).
- **AchievementBadges** – Soulbound ERC721 achievements with configurable badge types (`shared/contracts/achievement_badges.json`).

Deployment scripts under `scripts/deploy-*.ts` now call a shared helper that emits addresses and writes ABI metadata into `shared/contracts/*.json`. To deploy the full stack on Base Sepolia:
1. `npx hardhat run scripts/deploy-token.ts --config hardhat.config.cjs --network base-sepolia`
2. `npx hardhat run scripts/deploy-vesting.ts --config hardhat.config.cjs --network base-sepolia`
3. `npx hardhat run scripts/deploy-airdrop.ts --config hardhat.config.cjs --network base-sepolia`
4. `npx hardhat run scripts/deploy-early-bird.ts --config hardhat.config.cjs --network base-sepolia`
5. `npx hardhat run scripts/deploy-referral.ts --config hardhat.config.cjs --network base-sepolia`
6. `npx hardhat run scripts/deploy-badges.ts --config hardhat.config.cjs --network base-sepolia`

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

- **[Setup Guide](docs/SETUP.md)** - Wallet, payment, and token deployment
- **[Architecture](docs/ARCHITECTURE.md)** - System design and API specs
- **[AI Collaboration](docs/AI_COLLABORATION_WEBHOOK.md)** - How AIs work together
- **[Git Workflow](docs/GIT_WORKFLOW.md)** - Branch strategy and commit conventions
- **[Environment Variables](docs/ENV_VARIABLES.md)** - Config reference
- **[Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md)** - Production deployment
- **[Design Guidelines](design_guidelines.md)** - UI/UX standards
- **[Local Development](LOCAL_DEVELOPMENT.md)** - Dev environment setup

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
- **Last Updated**: 2025-11-09

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

