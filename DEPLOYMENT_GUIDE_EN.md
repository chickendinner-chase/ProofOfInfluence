# ProofOfInfluence Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Copy `.env.sample` to `.env`
- [ ] Configure all required environment variables
- [ ] Set sensitive information in Replit Secrets

### 2. Required Keys & Accounts
- [ ] CDP API Keys (CDP_API_KEY_NAME, CDP_API_KEY_PRIVATE_KEY)
- [ ] Deployer Private Key (DEPLOYER_PRIVATE_KEY)
- [ ] Treasury Wallet Address
- [ ] Neon Database URL (DATABASE_URL)

---

## 🚀 Contract Deployment Order

### Step 1: Compile Contracts
```bash
npm ci
npm run compile
```

### Step 2: Deploy POI Token
```bash
npx hardhat run scripts/deploy-token.ts --network base-sepolia
```
- **Constructor Args**: 
  - admin: deployer.address
  - treasury: TREASURY_ADDRESS
  - initialSupply: POI_INITIAL_SUPPLY (1B POI = 1000000000 * 10^18)
- **Record Address**: Update `POI_TOKEN_ADDRESS` and `VITE_POI_ADDRESS`

### Step 3: Deploy TGESale Contract
```bash
npx hardhat run scripts/deploy-tge-sale.ts --network base-sepolia
```
- **Constructor Args**:
  - poiToken: POI_TOKEN_ADDRESS
  - usdcToken: USDC_TOKEN_ADDRESS
  - owner: deployer.address
  - treasury: SALE_TREASURY_ADDRESS
  - tiers, time windows, whitelist config
- **Record Address**: Update `TGESALE_ADDRESS` and `VITE_TGESALE_ADDRESS`
- **Post-Deploy**: 
  - Approve POI tokens for TGESale contract
  - Configure sale tiers and time windows

### Step 4: Deploy StakingRewards
```bash
npx hardhat run scripts/deploy-staking.ts --network base-sepolia
```
- **Constructor Args**:
  - stakingToken: POI_TOKEN_ADDRESS
  - rewardsToken: POI_TOKEN_ADDRESS
  - owner: deployer.address
- **Record Address**: Update `STAKING_REWARDS_ADDRESS`
- **Post-Deploy**: Configure reward rate and duration

### Step 5: Deploy VestingVault (Optional)
```bash
npx hardhat run scripts/deploy-vesting.ts --network base-sepolia
```
- **Constructor Args**:
  - tokenAddress: POI_TOKEN_ADDRESS
  - owner: deployer.address
- **Record Address**: Update `VESTING_VAULT_ADDRESS`

### Step 6: Deploy MerkleAirdropDistributor (Optional)
```bash
npx hardhat run scripts/deploy-airdrop.ts --network base-sepolia
```
- **Record Address**: Update `MERKLE_AIRDROP_ADDRESS`

### Step 7: Deploy EarlyBirdAllowlist (Optional)
```bash
npx hardhat run scripts/deploy-early-bird.ts --network base-sepolia
```
- **Record Address**: Update `EARLY_BIRD_ALLOWLIST_ADDRESS`

### Step 8: Deploy ReferralRegistry (Optional)
```bash
npx hardhat run scripts/deploy-referral.ts --network base-sepolia
```
- **Record Address**: Update `REFERRAL_REGISTRY_ADDRESS`

### Step 9: Deploy Badges (Optional)
```bash
npx hardhat run scripts/deploy-badges.ts --network base-sepolia
npx hardhat run scripts/deploy-immortality-badge.ts --network base-sepolia
```

---

## ✅ Post-Deployment Configuration

### 1. Update Contract Address Files
Update all `shared/contracts/*.json` files with deployed addresses

### 2. TGESale Authorization
If using AgentKit wallet for purchases:
```bash
POST /api/contracts/USDC/approve
Body: { "amount": "1000000000" }
```

### 3. Configure TGESale Parameters
```bash
# Configure sale tiers
npx hardhat run scripts/configure-tge-tiers.ts --network base-sepolia

# Set sale time window
npx hardhat run scripts/configure-tge-window.ts --network base-sepolia
```

### 4. Initialize StakingRewards
```bash
npx hardhat run scripts/configure-staking-rewards.ts --network base-sepolia
```

### 5. Add DEX Liquidity (Optional)
```bash
npx hardhat run scripts/add-liquidity-v2.ts --network base-sepolia
```

---

## 🗄️ Database Setup

### 1. Run Database Migration
```bash
npm run db:push
```

### 2. Verify Database Connection
```bash
npm run db:studio
```

---

## 🌐 Frontend Deployment

### 1. Verify Environment Variables
Ensure all `VITE_*` variables are correctly set:
- [ ] VITE_CHAIN_ID
- [ ] VITE_BASE_RPC_URL
- [ ] VITE_USDC_ADDRESS
- [ ] VITE_POI_ADDRESS
- [ ] VITE_TGESALE_ADDRESS

### 2. Build and Deploy
```bash
# Local testing
npm run dev

# Replit deployment (Autoscale)
# Click Replit deploy button
```

### 3. Feature Verification
- [ ] Immortality page: POI purchase and staking
- [ ] Early bird registration
- [ ] Profile page: wallet connection
- [ ] About page content

---

## 🧪 Testing Checklist

### User Wallet Mode
- [ ] Connect MetaMask/WalletConnect
- [ ] Approve USDC for TGESale
- [ ] Purchase POI tokens
- [ ] Approve POI for Staking
- [ ] Stake POI
- [ ] Withdraw and claim rewards

### AgentKit Mode (Optional)
- [ ] CDP wallet USDC approval
- [ ] Platform purchase via API
- [ ] Transaction hash verification

---

## ⚠️ Common Issues

1. **Contract Not Deployed**: Check `shared/contracts/*.json` addresses
2. **Wrong USDC Address**: Verify network-specific USDC address
3. **Sale Window Not Open**: Check `saleStart` and `saleEnd` timestamps
4. **Tier Not Configured**: Run `configureTiers` script
5. **AgentKit Config Error**: Verify CDP API keys and RPC URL
6. **Database Not Initialized**: Run `npm run db:push`

---

## 📝 Deployment Record

### Contract Addresses

| Contract | Address | Deploy Time | Network |
|----------|---------|-------------|---------|
| POIToken | | | Base Sepolia |
| TGESale | | | Base Sepolia |
| StakingRewards | | | Base Sepolia |
| VestingVault | | | Base Sepolia |
| MerkleAirdropDistributor | | | Base Sepolia |
| EarlyBirdAllowlist | | | Base Sepolia |
| ReferralRegistry | | | Base Sepolia |
| AchievementBadges | | | Base Sepolia |
| ImmortalityBadge | | | Base Sepolia |

---

**Note**: This checklist is for Base Sepolia testnet. Conduct thorough audits before mainnet deployment.
