# ProofOfInfluence

## Overview

ProofOfInfluence is a Web3 influence monetization platform developed by ACEE Ventures. The platform enables creators and brands to convert influence into real value through the $POI utility token. It combines decentralized finance (DeFi) trading capabilities with real-world asset (RWA) tokenization, creating a comprehensive ecosystem for influence-based commerce.

The platform consists of three core modules:
- **Spot Trading Market** - Decentralized $POI token trading with DEX/CEX integration
- **RWA Market** - Real-world asset tokenization (luxury watches, real estate, art)
- **Creator/Brand Services** - Profile management and influence monetization tools

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **React 18** with TypeScript for type-safe UI development
- **Vite** as the build tool and development server
- **Wouter** for lightweight client-side routing
- **TanStack Query** (React Query) for server state management
- **Tailwind CSS** with custom design system based on shadcn/ui components
- **Wagmi + Reown AppKit** for Web3 wallet integration

**Design System:**
- Mobile-first responsive design with centered hierarchy
- Gradient-driven visual identity inspired by Rainbow.me and Gradient.page
- Typography: Inter (primary), JetBrains Mono (technical elements)
- Consistent spacing primitives (4, 6, 8, 12 units)
- Dark mode with theme toggling capability

**Component Architecture:**
- Radix UI primitives for accessible, unstyled components
- Custom business components in `client/src/components/`
- Page-level components in `client/src/pages/`
- Shared utilities and hooks in `client/src/lib/` and `client/src/hooks/`

**State Management Strategy:**
- Server state via TanStack Query with automatic caching and refetching
- Local UI state via React hooks
- Wallet state via Wagmi hooks (useAccount, useBalance, etc.)
- Form state via react-hook-form with Zod validation

### Backend Architecture

**Technology Stack:**
- **Express.js** server with TypeScript
- **Node.js 18+** runtime environment
- **Drizzle ORM** for database operations
- **Replit Auth** for Web2 authentication (OAuth/OIDC)
- **Passport.js** for session management

**API Structure:**
- RESTful API endpoints organized by domain:
  - `/api/auth/*` - Authentication and user management
  - `/api/market/*` - Trading operations (orders, trades, quotes)
  - `/api/reserve/*` - Reserve pool management (admin only)
  - `/api/merchant/*` - Merchant product and order management
  - `/api/wallet/*` - Wallet connection and Web3 integration
  - `/api/profile/*` - User profile and link management

**Authentication Flow:**
- Dual authentication: Replit OAuth (Web2) + Wallet signatures (Web3)
- Session-based auth with PostgreSQL session store
- Role-based access control (user, merchant, admin)
- Development mode bypass with `DEV_MODE_ADMIN=true` for testing

**Access Control Matrix:**
- **Guest**: Public content only
- **Web3 Connected**: Trading, staking, basic features
- **KYC Verified**: All features including withdrawals
- **Merchant**: Product and order management
- **Admin**: Reserve pool operations, system management

### Database Architecture

**Database Solution:**
- **PostgreSQL** via Neon serverless database
- Connection pooling with `@neondatabase/serverless`
- Schema management via Drizzle Kit migrations

**Schema Design:**
- **users** - Authentication data (Replit Auth + wallet addresses)
- **profiles** - Public profile information (bio, links, avatars)
- **links** - User-created links with click tracking
- **transactions** - Payment and financial records
- **poiTiers** - Membership tier definitions
- **poiFeeCredits** - User fee credit balances
- **poiBurnIntents** - Token burn tracking
- **marketOrders** - DEX/CEX trading orders
- **marketTrades** - Executed trade records
- **feesLedger** - Fee collection and distribution tracking
- **reserveBalances** - Reserve pool asset balances
- **reserveActions** - Reserve pool operation history
- **products** - Merchant product catalog
- **merchantOrders** - E-commerce order records
- **taxReports** - Tax compliance documentation
- **sessions** - User session storage (Replit Auth requirement)

**Data Relationships:**
- Users have one profile, multiple links, orders, and transactions
- Orders link to trades via foreign keys
- Fee credits connect to users and tiers
- Products belong to merchants (users with merchant role)

### Web3 Integration

**Smart Contract Architecture:**
- **POIToken.sol** - ERC20 token contract (OpenZeppelin-based)
- Upgradeable contract pattern using OpenZeppelin's UUPS proxy
- Deployment support for multiple networks (Ethereum, Base, Arbitrum, Polygon)

**Blockchain Networks:**
- Primary: Base (lower fees, EVM-compatible)
- Supported: Ethereum Mainnet, Base Sepolia (testnet), Arbitrum, Polygon
- Network switching handled via Wagmi's `useSwitchChain`

**DEX Integration:**
- Uniswap V2 protocol for token swaps
- BaseSwap (Uniswap V2 fork) on Base network
- Smart contract interactions via ethers.js v5 (Uniswap SDK Core compatibility)
- Quote fetching and swap execution with slippage protection

**Wallet Support:**
- Featured wallets: MetaMask, Coinbase Wallet, Phantom, Binance Web3, OKX
- Universal WalletConnect v2 support (300+ wallets)
- Mobile browser compatibility (Safari, WeChat, Chrome)

### Payment Processing

**Stripe Integration:**
- Fiat on-ramp for $POI token purchases
- Checkout session creation for credit card payments
- Webhook handling for payment confirmations
- Payment success/failure routing

**Fee Structure:**
- Trading fees: 0.3% (0.1% goes to $POI buyback and burn)
- Platform fees, authentication fees, custody fees
- Tier-based fee discounts (POI holders get discounts)
- Fee credits system (utility use of $POI token)

**Compliance:**
- Fee credits and tier discounts apply ONLY to fees, never to item prices
- $POI is a utility token, not a security
- Transparent fee breakdown in checkout flow

## External Dependencies

### Third-Party Services

**WalletConnect Cloud:**
- Project ID required for wallet connection
- Configure at: https://cloud.walletconnect.com/
- Environment variable: `VITE_WALLETCONNECT_PROJECT_ID`

**Neon Database:**
- Serverless PostgreSQL hosting
- Connection string in `DATABASE_URL` environment variable
- Automatic scaling and connection pooling

**Stripe Payment Gateway:**
- Secret key: `STRIPE_SECRET_KEY`
- Publishable key: `STRIPE_PUBLISHABLE_KEY`
- Webhook endpoint for payment confirmations

**Replit Authentication:**
- OAuth/OIDC provider for user login
- Session secret: `SESSION_SECRET`
- Issuer URL: `https://replit.com/oidc` (configurable via `ISSUER_URL`)

**RPC Providers:**
- Ethereum/Base/Arbitrum/Polygon nodes
- Default public RPCs provided, custom URLs configurable
- Environment variables: `MAINNET_RPC_URL`, `BASE_RPC_URL`, etc.

### AI Collaboration Infrastructure

**API Server (Port 3001):**
- Standalone Express server for AI task management
- GitHub Issues API integration for task creation
- Slack Bot integration for team notifications
- Custom GPT integration via OpenAI

**GitHub Integration:**
- Repository: `acee-chase/ProofOfInfluence`
- Issue labels: `@cursor`, `@codex`, `@replit` for AI assignment
- Personal access token required: `GITHUB_TOKEN`

**Slack Integration (Optional):**
- Bot token: `SLACK_BOT_TOKEN`
- Channels: `#ai-coordination`, `#cursor-dev`, `#codex-contracts`, `#replit-deploy`
- Real-time task notifications and coordination

### Development Tools

**Build Tools:**
- Vite for frontend bundling and dev server
- esbuild for backend compilation
- TypeScript compiler for type checking
- Drizzle Kit for database migrations

**Deployment Tools:**
- Hardhat for smart contract compilation and deployment
- tsx for TypeScript execution in Node.js
- Replit for hosting and continuous deployment

**Code Quality:**
- TypeScript for type safety
- Zod for runtime validation
- ESLint and Prettier (configuration not included but recommended)

### Environment Configuration

**Required Environment Variables:**
- `DATABASE_URL` - Neon PostgreSQL connection string
- `SESSION_SECRET` - Replit Auth session encryption key
- `VITE_WALLETCONNECT_PROJECT_ID` - WalletConnect project identifier

**Optional for Production:**
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` - Payment processing
- `PRIVATE_KEY` - Deployer wallet private key (smart contracts)
- `NETWORK` - Blockchain network for deployment
- `POI_TOKEN_ADDRESS` - Deployed token contract address

**Development Mode:**
- `DEV_MODE_ADMIN=true` - Grants all authenticated users admin access
- `NODE_ENV=development` - Enables dev-only features
- API server mocking via `VITE_USE_MOCK_*` flags