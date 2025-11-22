# ProofOfInfluence Architecture Documentation

Complete architecture overview including information structure, access control, and API specifications.

## Table of Contents

- [Information Architecture](#information-architecture)
- [Access Control System](#access-control-system)
- [Backend API Specification](#backend-api-specification)
- [Tech Stack](#tech-stack)

---

## Information Architecture

### Page Structure

#### Public Pages (No Auth Required)

1. **Landing** (`/`) - Homepage with platform overview
2. **Products** (`/products`) - ProjectEX modules overview
3. **For Creators** (`/for-creators`) - Creator services
4. **For Brands** (`/for-brands`) - Brand solutions
5. **Use Cases** (`/use-cases`) - Real-world applications
6. **Token & Docs** (`/token-docs`) - $POI documentation
7. **Compliance** (`/compliance`) - KYC/AML compliance info
8. **Changelog** (`/changelog`) - Feature updates
9. **Company** (`/company`) - About us

#### Protected Pages (Auth Required)

10. **Dashboard** (`/app`) - Main control panel
11. **Market** (`/app/market`) - Trading marketplace
    - Trading charts
    - Order management
    - Market statistics
12. **Profile** (`/profile`) - User profile settings
13. **Public Profile** (`/@username`) - Shareable profile card with CompactSwapCard

### Routing Configuration

All routes configured in `client/src/App.tsx`:

```typescript
<Route path="/" component={Landing} />
<Route path="/products" component={Products} />
<Route path="/for-creators" component={ForCreators} />
<Route path="/for-brands" component={ForBrands} />
<Route path="/use-cases" component={UseCases} />
<Route path="/token-docs" component={TokenDocs} />
<Route path="/compliance" component={Compliance} />
<Route path="/changelog" component={Changelog} />
<Route path="/company" component={Company} />
<Route path="/app" component={Dashboard} />
<Route path="/app/market" component={Market} />
<Route path="/profile" component={Profile} />
<Route path="/@:username" component={PublicProfile} />
```

---

## Access Control System

### Access Levels

| Level | Description | Can Access |
|-------|-------------|------------|
| `guest` | Unauthenticated | Public pages only |
| `web3_connected` | Wallet connected | Dashboard (basic), Trading, Staking |
| `kyc_verified` | KYC completed | Withdrawals, Full features |

### Implementation

#### useAccessControl Hook

`client/src/hooks/useAccessControl.ts`

```typescript
interface AccessControl {
  level: "guest" | "web3_connected" | "kyc_verified";
  canAccessDashboard: boolean;
  canWithdraw: boolean;
  canTrade: boolean;
  canStake: boolean;
}
```

#### AccessGuard Component

`client/src/components/AccessGuard.tsx`

```typescript
<AccessGuard requiredRole="web3_connected">
  <div>Protected content</div>
</AccessGuard>
```

#### FeatureFlag Component

`client/src/components/FeatureFlag.tsx`

```typescript
<FeatureFlag 
  requiredRole="kyc_verified"
  fallback={<p>Complete KYC to access</p>}
>
  <WithdrawButton />
</FeatureFlag>
```

### Permission Matrix

| Feature | Guest | Web3 Connected | KYC Verified |
|---------|-------|----------------|--------------|
| View Public Pages | ✅ | ✅ | ✅ |
| View Dashboard | ❌ | ✅ (Basic) | ✅ (Full) |
| Trading & Staking | ❌ | ✅ | ✅ |
| Deposits | ❌ | ✅ | ✅ |
| Withdrawals | ❌ | ❌ | ✅ |

---

## Backend API Specification

### General Requirements

- **Framework**: Node.js + Express
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: JWT + RBAC (user/merchant/admin roles)
- **Format**: RESTful JSON API
- **Error Format**: `{ message: string, code?: string }`
- **Idempotency**: All POST requests support `idempotencyKey`
- **Rate Limiting**: 100 req/min per IP

### Module A: Market API

#### Market Orders Table Schema

```sql
CREATE TABLE market_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  side VARCHAR(4) NOT NULL CHECK (side IN ('buy', 'sell')),
  token_in VARCHAR(50) NOT NULL,
  token_out VARCHAR(50) NOT NULL,
  amount_in DECIMAL(20, 8) NOT NULL,
  amount_out DECIMAL(20, 8),
  fee_bps INTEGER DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  tx_ref VARCHAR(255),
  route JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_market_orders_user_id ON market_orders(user_id);
CREATE INDEX idx_market_orders_status ON market_orders(status);
```

#### Endpoints

**POST /api/market/orders** - Create Order
```json
Request:
{
  "side": "buy",
  "tokenIn": "USDC",
  "tokenOut": "POI",
  "amountIn": "100.00",
  "idempotencyKey": "uuid-v4"
}

Response:
{
  "id": "uuid",
  "status": "PENDING",
  "side": "buy",
  "tokenIn": "USDC",
  "tokenOut": "POI",
  "amountIn": "100.00",
  "createdAt": "2025-11-09T10:00:00Z"
}
```

**GET /api/market/orders** - List Orders
```
Query: ?status=PENDING&limit=20&offset=0
Response:
{
  "orders": [...],
  "total": 100,
  "page": 1
}
```

**GET /api/market/stats/:pair** - Market Stats
```
Response:
{
  "pair": "USDC-POI",
  "price": "0.0015",
  "volume24h": "50000.00",
  "change24h": "+5.2%",
  "tvl": "1000000.00"
}
```

**GET /api/market/trades/:pair** - Recent Trades
```
Query: ?limit=20
Response:
{
  "trades": [
    {
      "price": "0.0015",
      "amount": "1000.00",
      "side": "buy",
      "timestamp": "2025-11-09T10:00:00Z"
    }
  ]
}
```

**PATCH /api/market/orders/:id/cancel** - Cancel Order
```
Response:
{
  "id": "uuid",
  "status": "CANCELED"
}
```

### Module B: Reserve Pool API

#### Reserve Pool Table Schema

```sql
CREATE TABLE reserve_pool_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tx_type VARCHAR(20) NOT NULL CHECK (tx_type IN ('FEE_COLLECT', 'TREASURY_DEPOSIT', 'BUYBACK', 'BURN')),
  amount DECIMAL(20, 8) NOT NULL,
  token VARCHAR(50) NOT NULL,
  tx_ref VARCHAR(255),
  source VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Endpoints

**GET /api/reserve-pool/stats** - Pool Statistics
```json
Response:
{
  "totalReserve": "500000.00",
  "feeCollected24h": "150.00",
  "buybackAmount24h": "5000.00",
  "burnedAmount": "10000.00",
  "poolBreakdown": {
    "USDC": "300000.00",
    "POI": "200000.00"
  }
}
```

**GET /api/reserve-pool/transactions** - Transaction History
```
Query: ?type=FEE_COLLECT&limit=20
Response:
{
  "transactions": [...],
  "total": 500
}
```

### Module C: Merchant API

#### Merchant Settings Table Schema

```sql
CREATE TABLE merchant_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) UNIQUE NOT NULL,
  business_name VARCHAR(255),
  markup_bps INTEGER DEFAULT 0,
  auto_pricing BOOLEAN DEFAULT FALSE,
  payment_methods JSONB DEFAULT '["POI", "USDC"]',
  tax_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Endpoints

**GET /api/merchant/settings** - Get Settings

**PUT /api/merchant/settings** - Update Settings
```json
Request:
{
  "businessName": "My Store",
  "markupBps": 250,
  "autoPricing": true,
  "paymentMethods": ["POI", "USDC"]
}
```

**GET /api/merchant/orders** - Order Management
```
Query: ?status=PENDING&startDate=2025-11-01
Response:
{
  "orders": [...],
  "total": 150,
  "revenue": "15000.00"
}
```

**GET /api/merchant/reports/tax** - Tax Report
```
Query: ?year=2025&quarter=Q1
Response:
{
  "period": "2025-Q1",
  "totalRevenue": "50000.00",
  "totalFees": "1500.00",
  "netIncome": "48500.00",
  "transactions": 250,
  "reportUrl": "https://cdn.example.com/tax_report_2025Q1.pdf"
}
```

---

## Tech Stack

### Frontend

- **Framework**: React 18 + TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query)
- **Styling**: TailwindCSS + Shadcn UI
- **Web3**: AppKit (Reown) + wagmi + viem
- **Icons**: Lucide React
- **Build**: Vite

### Backend

- **Runtime**: Node.js
- **Framework**: Express
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Auth**: Replit Auth (Google OAuth) + MetaMask
- **Payment**: Stripe Checkout

### Smart Contracts

- **Language**: Solidity 0.8.20
- **Framework**: Hardhat
- **Libraries**: OpenZeppelin
- **Networks**: Ethereum, Base, Arbitrum, Polygon

### Deployment

- **Platform**: Replit Autoscale
- **Database**: Neon PostgreSQL
- **CDN**: Cloudflare (optional)

---

## Design Principles

1. **Mobile First**: Responsive design starting from mobile
2. **Consistency**: Unified Header, Footer, and design language
3. **Progressive Enhancement**: Features unlock based on access level
4. **Clear IA**: Separate "Company Info" from "User Experience"
5. **Security & Compliance**: KYC required for critical features

---

## Navigation Structure (Current)

### Desktop Header
```
ACEE | 首页 | 🛒 现货交易 | 💼 RWA市场 | ProjectEX | 资源▼ | [钱包] [登录/App]
```

### Resources Dropdown
- 创作者专区
- 品牌专区
- 应用案例
- Token & 文档
- 合规
- 更新日志
- 公司

---

## Next Steps

### Phase 1: Core Features
- ✅ Information Architecture
- ✅ Access Control System
- ✅ Wallet Integration
- ✅ Payment Integration
- 🔄 Market API Backend
- 🔄 Reserve Pool Backend

### Phase 2: Advanced Features
- 📋 Merchant Dashboard
- 📋 Advanced Analytics
- 📋 Mobile App (React Native)
- 📋 Multi-language Support (i18n)

### Phase 3: Optimization
- 📋 SEO Optimization
- 📋 Performance Tuning
- 📋 Code Splitting
- 📋 Automated Testing

---

**Document Version**: 2.1  
**Last Updated**: 2025-11-16  
**Maintained by**: Development Team

## 最近更新

- ✅ 完成 VestingVault, MerkleAirdropDistributor, EarlyBirdAllowlist 合约部署
- ✅ 创建前端 hooks：useVestingVault, useAirdrop, useAllowlist
- ✅ 更新合约地址到 shared/contracts/*.json
- ✅ 更新前端配置 baseConfig.ts


