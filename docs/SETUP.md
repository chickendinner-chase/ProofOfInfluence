# ProofOfInfluence Setup Guide

Complete setup guide for wallet integration, payment processing, and token deployment.

## Table of Contents

- [Wallet Integration](#wallet-integration)
- [Stripe Payment Setup](#stripe-payment-setup)
- [POI Token Deployment](#poi-token-deployment)

---

## Wallet Integration

### Supported Wallets

**Featured Wallets:**
1. MetaMask - Most popular Ethereum wallet
2. Coinbase Wallet - Coinbase official wallet
3. Phantom - Modern multi-chain wallet
4. Binance Web3 Wallet - Binance ecosystem wallet
5. OKX Wallet - OKX exchange wallet

**Other Supported:**
- WalletConnect (300+ wallets via QR code)
- Trust Wallet
- Rainbow Wallet
- Ledger & Trezor hardware wallets

### Mobile Support

- ✅ Safari iOS - WalletConnect QR scanning
- ✅ WeChat Browser - WalletConnect QR scanning
- ✅ Chrome Mobile - Browser extension or QR
- ✅ Any mobile browser - Universal WalletConnect

### Configuration Steps

#### 1. Get WalletConnect Project ID

Visit https://cloud.walletconnect.com/

1. Sign up / Login
2. Click "Create New Project"
3. Fill project info:
   - Project Name: `ProofOfInfluence`
   - Homepage URL: `https://yourapp.replit.app`
4. Copy the generated **Project ID**

#### 2. Configure Environment in Replit

In your Replit project:

1. Open "Secrets" (🔐 icon in toolbar)
2. Add new Secret:
   - Key: `VITE_WALLETCONNECT_PROJECT_ID`
   - Value: `[paste your Project ID]`
3. Save

#### 3. Test Deployment

```bash
npm install
npm run build
npm start
```

### Testing Checklist

**Desktop:**
- [ ] Chrome + MetaMask connection
- [ ] Network switching (Base/Ethereum)
- [ ] View balance
- [ ] Execute transaction

**Mobile:**
- [ ] Open in Safari
- [ ] Connect wallet
- [ ] Scan QR code
- [ ] Confirm in mobile wallet
- [ ] Test transaction

### Tech Stack

```json
{
  "@reown/appkit": "^1.7.0",
  "@reown/appkit-adapter-wagmi": "^1.7.0",
  "wagmi": "^2.0.0",
  "viem": "^2.0.0"
}
```

---

## Stripe Payment Setup

### Step 1: Get Stripe API Keys

1. Visit [Stripe Dashboard](https://dashboard.stripe.com/)
2. Click **Developers** → **API keys**
3. Copy both keys:
   - **Publishable key** (`pk_test_` or `pk_live_`)
   - **Secret key** (`sk_test_` or `sk_live_`)

### Step 2: Configure in Replit

Add these Secrets in Replit:

| Key | Value | Description |
|-----|-------|-------------|
| `STRIPE_SECRET_KEY` | `sk_test_...` or `sk_live_...` | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_...` or `pk_live_...` | Stripe public key |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (optional) | Webhook signature key |
| `BASE_URL` | `https://your-repl.replit.app` | Your app URL |

💡 **Test Mode**: Use `sk_test_` and `pk_test_` keys  
🔴 **Production**: Use `sk_live_` and `pk_live_` keys

### Step 3: Push Database Changes

Run in Replit Shell:

```bash
npm run db:push
```

This creates the `transactions` table for payment records.

### Step 4: Configure Webhooks (Production Recommended)

#### Development (Stripe CLI)

```bash
stripe listen --forward-to https://your-repl.replit.app/api/stripe-webhook
```

Copy the webhook secret to `STRIPE_WEBHOOK_SECRET` in Replit Secrets.

#### Production

1. Create webhook at [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Endpoint URL: `https://your-repl.replit.app/api/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
4. Copy webhook signature to Replit Secrets

### Step 5: Test Payment

**Test Card Numbers:**

Success:
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

Declined:
- Card: `4000 0000 0000 0002`

**Test Flow:**
1. Run project in Replit
2. Visit your app URL
3. Select $POI amount
4. Click "Pay"
5. Use test card at Stripe Checkout
6. Verify redirect to `/payment-success`

### Step 6: Production Mode

1. **Activate Stripe Account:**
   - Complete business verification
   - Add bank account

2. **Switch to Live Keys:**
   - Toggle to "Live mode" in Stripe Dashboard
   - Copy production keys (`sk_live_` and `pk_live_`)
   - Update Replit Secrets

3. **Real Testing:**
   - Test with real card (small amount)
   - Verify in Stripe Dashboard
   - Refund test payment if needed

---

## POI Token Deployment

### Prerequisites

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Configure Environment

Create `.env` file:

```env
# Required
PRIVATE_KEY=your_private_key_here
NETWORK=sepolia

# Liquidity Config (optional)
WETH_AMOUNT=0.1
POI_AMOUNT=100000

# RPC URL (optional)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

⚠️ **Security:**
- Never commit private keys to Git
- Use Replit Secrets for sensitive data

#### 3. Prepare Wallet

Ensure your wallet has:
- ✅ Sufficient test ETH for gas
- ✅ POI tokens for liquidity

**Get Test ETH:**
- Sepolia: https://sepoliafaucet.com/
- Base Sepolia: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

### Quick Start

#### One-Click Deploy (Recommended)

```bash
# Deploy on Sepolia
npx hardhat run scripts/deploy-and-add-liquidity.ts --network sepolia

# Or on other networks
npx hardhat run scripts/deploy-and-add-liquidity.ts --network base-sepolia
```

This script:
1. ✅ Deploys POI Token contract
2. ✅ Mints 1,000,000,000 POI tokens
3. ✅ Approves Uniswap Router
4. ✅ Adds liquidity to Uniswap V2

### Step-by-Step Deployment

#### Step 1: Compile Contracts

```bash
npm run compile
```

#### Step 2: Deploy Token

```bash
npx hardhat run scripts/deploy-and-add-liquidity.ts --network sepolia
```

Success output:
```
✅ POI Token deployed: 0x...
   Total supply: 1000000000.0 POI
```

#### Step 3: Add Liquidity

```bash
export POI_TOKEN_ADDRESS=0x...  # Your token address
export WETH_AMOUNT=0.1          # 0.1 ETH
export POI_AMOUNT=100000        # 100,000 POI

npm run deploy:liquidity
```

### Supported Networks

| Network | Network ID | Recommended Use |
|---------|-----------|-----------------|
| **Mainnet** | `mainnet` | Production |
| **Sepolia** | `sepolia` | Testing |
| **Base** | `base` | L2 Production |
| **Base Sepolia** | `base-sepolia` | L2 Testing |
| **Arbitrum** | `arbitrum` | L2 Production |
| **Polygon** | `polygon` | Sidechain |

### POI Token Details

```
Name: Proof of Influence
Symbol: POI
Decimals: 18
Initial Supply: 1,000,000,000 POI
```

### Contract Features

- ✅ Standard ERC20: `transfer`, `approve`, `transferFrom`
- ✅ Burnable: `burn` (holders can burn own tokens)
- ✅ Mintable: `mint` (owner only)
- ✅ Batch Transfer: `batchTransfer` (gas optimization)

### Verification

#### 1. Check Deployment Info

```bash
cat deployments/deployment-sepolia.json
```

#### 2. View on Block Explorer

- Sepolia: https://sepolia.etherscan.io/address/YOUR_TOKEN_ADDRESS
- Base: https://basescan.org/address/YOUR_TOKEN_ADDRESS

#### 3. Check Uniswap Pool

```
https://app.uniswap.org/pool/YOUR_PAIR_ADDRESS
```

### Frontend Integration Example

```typescript
import { ethers } from "ethers";

const POI_TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
];

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const poiToken = new ethers.Contract(
  "YOUR_POI_TOKEN_ADDRESS",
  POI_TOKEN_ABI,
  signer
);

// Check balance
const balance = await poiToken.balanceOf(address);
console.log("POI Balance:", ethers.utils.formatEther(balance));

// Transfer tokens
const tx = await poiToken.transfer(recipientAddress, ethers.utils.parseEther("100"));
await tx.wait();
```

---

## Troubleshooting

### Wallet Issues

**Problem:** Connection button not responding  
**Solution:** Check browser console, verify AppKit initialization

**Problem:** WalletConnect QR not showing  
**Solution:** Verify `VITE_WALLETCONNECT_PROJECT_ID` in Secrets

**Problem:** Network switching fails  
**Solution:** Some wallets require manual network switching

### Payment Issues

**Problem:** "Stripe Secret Key is not set"  
**Solution:** Check `STRIPE_SECRET_KEY` in Replit Secrets, restart service

**Problem:** "Failed to create checkout session"  
**Solution:** Verify Stripe keys, check amount range ($1-$10,000)

**Problem:** Payment success but 404 redirect  
**Solution:** Check `BASE_URL` in Secrets, verify `/payment-success` route

### Deployment Issues

**Problem:** "insufficient funds"  
**Solution:** Get test ETH from faucet

**Problem:** Liquidity addition fails  
**Solution:** Check wallet has ETH and POI, verify Router approval

**Problem:** Mainnet deployment concerns  
**Solution:** Use `mainnet` in config, prepare sufficient ETH, proceed carefully

---

## Resources

- [AppKit (Reown) Docs](https://docs.reown.com/appkit/overview)
- [wagmi Docs](https://wagmi.sh/)
- [Stripe Docs](https://stripe.com/docs)
- [Hardhat Docs](https://hardhat.org/docs)
- [OpenZeppelin Docs](https://docs.openzeppelin.com/)
- [Uniswap V2 Docs](https://docs.uniswap.org/contracts/v2/overview)

---

**Last Updated:** 2025-11-08  
**Maintained by:** Cursor AI

