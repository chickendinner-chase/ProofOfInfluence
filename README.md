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

## 📚 Documentation

- **[Setup Guide](docs/SETUP.md)** - Wallet, payment, and token deployment
- **[Architecture](docs/ARCHITECTURE.md)** - System design and API specs
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

