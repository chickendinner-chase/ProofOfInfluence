# Replit Configuration - Web2 Only

## Overview

**Important**: This Replit environment is configured for **Web2 applications only**. 

- ✅ Frontend (React + TypeScript)
- ✅ Backend API (Express)
- ✅ Database (PostgreSQL via Drizzle)
- ✅ Authentication (Replit Auth + OAuth)
- ✅ Payment (Stripe)

**❌ No Smart Contract Deployment or Management**

All Web3/blockchain operations (smart contracts, token deployment) should be done **locally**, not on Replit.

---

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, built using Vite for fast development and optimized production builds.

**UI Framework**: Shadcn UI components built on Radix UI primitives with Tailwind CSS for styling. The design follows a mobile-first approach with gradient-driven visual identity that emphasizes POI-centric Web3 Profile features, drawing inspiration from Rainbow.me's Web3 aesthetics and modern design principles.

**State Management**: TanStack Query (React Query) for server state management with built-in caching, optimistic updates, and automatic refetching. No additional global state management library is used.

**Routing**: Wouter for lightweight client-side routing with main routes:
- `/` - Landing page (unauthenticated) or Dashboard (authenticated)
- `/:username` - Public profile pages

**Key Design Decisions**:
- Component-based architecture with reusable UI primitives
- Custom design system with CSS variables for theming (light/dark mode)
- Mobile-first responsive design with Tailwind breakpoints
- Type-safe prop interfaces for all components

### Backend Architecture

**Framework**: Express.js server with TypeScript, running on Node.js.

**Authentication System**: 
- Primary: Replit Auth integration using OpenID Connect (OIDC) with Passport.js strategy
- Secondary: Web3 wallet authentication via MetaMask signature verification
- Session management using express-session with PostgreSQL storage (connect-pg-simple)

**API Design**: RESTful API with the following endpoint categories:
- Auth: `/api/auth/*` - Login, logout, user session
- Profile: `/api/profile` - User profile CRUD
- Links: `/api/links/*` - Link management
- Analytics: `/api/analytics` - View and click tracking
- Wallet: `/api/wallet/*` - Wallet connection (read-only in Replit)
- Payment: `/api/stripe/*` - Stripe payment handling

**Database**: PostgreSQL via Neon serverless with Drizzle ORM for type-safe database access. Schema defined in `shared/schema.ts` with automatic migrations via `drizzle-kit push`.

---

## Web3 Integration (Frontend Only)

**Important**: Replit handles only the **frontend** Web3 integration for:
- Wallet connection (MetaMask)
- Token balance display
- Transaction status tracking
- Uniswap interface embedding

**Not handled in Replit**:
- Smart contract deployment
- Contract management
- Private key operations
- Token minting/burning
- Liquidity pool management

All smart contract operations should be done **locally** using Hardhat.

---

## Development Workflow

### On Replit (Web2)

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Database migrations
npm run db:push

# Type checking
npm run check

# Build for production
npm run build
```

### Locally (Web3 - Not on Replit)

```bash
# Compile smart contracts
npm run compile

# Deploy contracts
npm run deploy:all -- --network <network>

# Verify contracts
npx hardhat verify --network <network> <address>
```

---

## Environment Variables (Replit Secrets)

### Web2 Application
```
DATABASE_URL=postgresql://...
SESSION_SECRET=...
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
BASE_URL=https://your-app.repl.co
```

### Web3 Configuration (Frontend Only)
```
POI_TOKEN_ADDRESS=0x...  # Read-only, for display
UNISWAP_PAIR_ADDRESS=0x...  # Read-only, for display
```

**Do NOT store private keys in Replit Secrets!**

---

## Deployment

### Automatic Deployment

When you push to the main branch on GitHub, Replit automatically:
1. Pulls the latest code
2. Installs dependencies
3. Builds the application
4. Restarts the server

### Manual Deployment

In Replit Shell:
```bash
npm run build
npm start
```

---

## Security Best Practices

### On Replit
- ✅ Store secrets in Replit Secrets
- ✅ Use environment variables for configuration
- ✅ Enable authentication middleware for protected routes
- ✅ Validate all user inputs
- ✅ Use HTTPS only (automatic on Replit)

### NOT on Replit
- ❌ No private key storage
- ❌ No smart contract deployment
- ❌ No direct blockchain write operations
- ❌ No mainnet fund management

---

## Limitations

### Replit Environment
- **Memory**: Limited RAM, avoid heavy processing
- **Storage**: Ephemeral filesystem (use database for persistence)
- **Networking**: Outbound connections only
- **Cold Starts**: Possible with minInstances = 0

### What to Do Locally Instead
- Smart contract development and testing
- Heavy computation or data processing
- File system-dependent operations
- Blockchain transaction signing

---

## Support

For Replit-specific issues:
- Check Replit documentation: https://docs.replit.com/
- Replit community: https://ask.replit.com/

For ProofOfInfluence issues:
- Check project documentation in `/docs`
- GitHub Issues
- Internal team communication

---

**Remember**: Replit is for Web2 applications only. All Web3/blockchain operations should be done locally!
