## ProofOfInfluence – Deployment Checklist

This checklist covers deploying POI token + all contracts + the new platform (frontend + backend), for Base Sepolia or Base mainnet.

---

### 0) Prerequisites
- Node 18+ installed
- A fresh deployer wallet with funds on target network
- RPC for Base or Base Sepolia

---

### 1) Secrets / Environment Variables

Backend (.env or platform Secrets):
- DATABASE_URL = postgres://user:pass@host:5432/db
- BASE_RPC_URL = https://sepolia.base.org (or mainnet RPC)
- USDC_TOKEN_ADDRESS = 0x... (Base or Base Sepolia USDC)
- AGENTKIT_DEFAULT_CHAIN = base-sepolia (or base)
- DEPLOYER_PRIVATE_KEY = 0x... (DO NOT COMMIT)
- CDP_API_KEY_NAME = ...
- CDP_API_KEY_PRIVATE_KEY = ...
- (Optional) CDP_WALLET_ADDRESS = 0x...
- STRIPE_SECRET_KEY = (optional, if using Stripe)
- STRIPE_WEBHOOK_SECRET = (optional, if using webhooks)

Frontend (Vite) (.env.local or platform ENV):
- VITE_CHAIN_ID = 84532 (Base Sepolia) or 8453 (Base)
- VITE_BASE_RPC_URL = https://sepolia.base.org
- VITE_USDC_ADDRESS = 0x...
- VITE_TGESALE_ADDRESS = 0x... (fill after deploy)
- VITE_POI_ADDRESS = 0x... (fill after deploy)
- VITE_WALLETCONNECT_PROJECT_ID = ...
- VITE_BASESCAN_URL = https://sepolia.basescan.org (or https://basescan.org)

---

### 2) Install and Compile
```bash
npm ci
npm run compile
```

---

### 3) Deploy Contracts (record addresses)
Deploy in this order (adjust to your scripts):
1. POI (ERC20) → POI_ADDRESS
2. TGESale → TGESALE_ADDRESS
3. StakingRewards → STAKING_REWARDS_ADDRESS
4. VestingVault (optional) → VESTING_VAULT_ADDRESS
5. MerkleAirdropDistributor (optional) → MERKLE_AIRDROP_ADDRESS
6. EarlyBirdAllowlist (optional) → EARLY_BIRD_ALLOWLIST_ADDRESS
7. ReferralRegistry (optional) → REFERRAL_REGISTRY_ADDRESS
8. AchievementBadges / ImmortalityBadge → ACHIEVEMENT_BADGES_ADDRESS / IMMORTALITY_BADGE_ADDRESS

Fill addresses into:
- shared/contracts/*.json (address field)
- Frontend VITE_* vars (POI/TGESale/USDC/Chain/RPC)

---

### 4) TGESale Approvals (only if AgentKit “platform-broker” mode)
- Approve CDP/AgentKit wallet to spend USDC to TGESale:
  - POST /api/contracts/USDC/approve (body: { amount: "1000000000" }) or
  - Use a script / Hardhat console to call USDC.approve(TGESale, amount)
- In “user-wallet” mode, the frontend will guide approval automatically.

---

### 5) Optional: Add Liquidity (DEX)
- Create POI/USDC pool (use existing script if present)
- Set initial price and liquidity
- (Optional) Fill any frontend config for Market module

---

### 6) Database and Backend
```bash
npm run db:push
npm run server
```
Verify:
```bash
GET /api/tge/status?wallet=0x...
```

---

### 7) Frontend
```bash
npm run dev       # local
npm run build     # production
npm run preview   # local preview
```
Deploy to your chosen hosting (Vercel/Netlify/… or Replit).

---

### 8) Acceptance Tests
User Wallet Mode:
1) Connect wallet on Immortality page
2) TGE purchase: approve USDC → purchase → verify txHash on BaseScan
3) Staking: stake → balance updates → withdraw → claim reward
4) Negative cases: inactive sale / insufficient allowance or balance → friendly errors

AgentKit Mode (optional):
1) POST /api/contracts/USDC/approve (CDP wallet)
2) POST /api/contracts/TGESale/purchase → txHash
3) Verify on BaseScan

---

### 9) Common Pitfalls
- Missing shared/contracts/*.json addresses
- Wrong USDC address (testnet vs mainnet)
- Sale window/tier/limits not configured
- Missing RPC or AgentKit credentials
- DATABASE_URL missing or db push not run

# POI Token 部署检查清单

部署前请逐项检查以确保顺利部署。

## ✅ 部署前检查

### 1. 环境配置

- [ ] 已安装所有依赖 (`npm install --legacy-peer-deps`)
- [ ] 已配置 `PRIVATE_KEY` 环境变量
- [ ] 已配置 `NETWORK` 环境变量 (sepolia/base/arbitrum等)
- [ ] 已配置 RPC URL (可选，使用默认的也可以)

### 2. 钱包准备

- [ ] 钱包有足够的 ETH 用于 gas (建议 0.2+ ETH)
- [ ] 确认钱包地址正确
- [ ] 私钥安全保管，未泄露

### 3. 网络选择

- [ ] 确认部署网络 (测试网推荐：sepolia 或 base-sepolia)
- [ ] 了解目标网络的 gas 费用
- [ ] 获取测试币 (如果是测试网)

### 4. 合约参数

- [ ] 确认代币名称：Proof of Influence
- [ ] 确认代币符号：POI
- [ ] 确认初始供应量：1,000,000,000 POI
- [ ] 如需修改，已编辑 `contracts/POIToken.sol`

### 5. 流动性配置

- [ ] 确认添加的 ETH 数量 (`WETH_AMOUNT`)
- [ ] 确认添加的 POI 数量 (`POI_AMOUNT`)
- [ ] 计算好初始价格 = POI_AMOUNT / WETH_AMOUNT

## 🚀 部署步骤

### 步骤 1: 编译合约

```bash
npm run compile
```

**预期结果**: 
```
Compiled 8 Solidity files successfully
```

### 步骤 2: 部署代币和添加流动性

```bash
# 一键部署 (推荐)
npx hardhat run scripts/deploy-and-add-liquidity.ts --config hardhat.config.cjs --network sepolia
```

**预期结果**:
```
✅ POI Token 已部署: 0x...
✅ 流动性已添加
📍 流动性池: 0x...
```

### 步骤 3: 保存部署信息

- [ ] 记录代币地址
- [ ] 记录流动性池地址
- [ ] 记录交易哈希
- [ ] 保存 `deployments/` 目录中的 JSON 文件

### 步骤 4: 验证部署

- [ ] 在区块浏览器查看代币合约
- [ ] 在区块浏览器查看流动性池
- [ ] 在 Uniswap 查看交易对
- [ ] 测试代币转账功能

## 📋 部署后操作

### 1. 合约验证 (可选但推荐)

```bash
npx hardhat verify --network sepolia YOUR_TOKEN_ADDRESS
```

### 2. 更新前端配置

- [ ] 将代币地址添加到前端配置
- [ ] 更新环境变量 `POI_TOKEN_ADDRESS`
- [ ] 测试前端集成

### 3. 流动性管理

- [ ] 了解如何移除流动性
- [ ] 保存 LP Token 信息
- [ ] 监控流动性池状态

### 4. 安全检查

- [ ] 确认代币合约所有权
- [ ] 检查代币铸造权限
- [ ] 验证流动性池配置

## ⚠️ 注意事项

### 测试网部署

- ✅ 推荐先在测试网部署
- ✅ 充分测试所有功能
- ✅ 验证合约正确性
- ✅ 检查 gas 优化

### 主网部署

- ⚠️ **主网部署不可逆**
- ⚠️ 准备足够的 ETH (gas 费用更高)
- ⚠️ 多次确认所有配置
- ⚠️ 考虑使用多签钱包
- ⚠️ 建议进行安全审计

### 常见错误预防

- ❌ 私钥泄露 → ✅ 使用 Replit Secrets
- ❌ gas 不足 → ✅ 准备充足 ETH
- ❌ 网络错误 → ✅ 确认 RPC URL 可用
- ❌ 代币数量不足 → ✅ 检查钱包余额

## 📊 Gas 费用估算

### Sepolia 测试网

| 操作 | Gas | 费用估算 |
|------|-----|---------|
| 部署代币 | ~1,500,000 | 0.003 ETH |
| 授权 | ~50,000 | 0.0001 ETH |
| 添加流动性 | ~200,000 | 0.0004 ETH |
| **总计** | ~1,750,000 | **0.0035 ETH** |

### 主网

| 操作 | Gas | 费用估算 (30 gwei) |
|------|-----|-------------------|
| 部署代币 | ~1,500,000 | 0.045 ETH (~$100) |
| 授权 | ~50,000 | 0.0015 ETH (~$3) |
| 添加流动性 | ~200,000 | 0.006 ETH (~$13) |
| **总计** | ~1,750,000 | **0.0525 ETH (~$116)** |

*注：主网费用会根据 gas price 波动*

### Base / Arbitrum (L2)

| 操作 | Gas | 费用估算 |
|------|-----|---------|
| 部署代币 | ~1,500,000 | 0.0015 ETH (~$3) |
| 授权 | ~50,000 | 0.00005 ETH (~$0.1) |
| 添加流动性 | ~200,000 | 0.0002 ETH (~$0.4) |
| **总计** | ~1,750,000 | **0.00175 ETH (~$3.5)** |

*L2 网络 gas 费用显著降低*

## 🆘 故障排查

### 部署失败

1. 检查 gas 余额
2. 验证私钥正确
3. 确认网络连接
4. 查看错误日志

### 流动性添加失败

1. 检查代币余额
2. 验证授权成功
3. 确认流动性池地址
4. 增加 gas limit

### 合约验证失败

1. 确认编译器版本
2. 检查优化设置
3. 验证构造函数参数
4. 使用正确的 API Key

## 📞 需要帮助？

- 📖 查看完整文档: [TOKEN_DEPLOYMENT.md](./TOKEN_DEPLOYMENT.md)
- ⚡ 快速开始: [QUICK_START_POI.md](./QUICK_START_POI.md)
- 🔧 环境配置: [ENV_VARIABLES.md](./ENV_VARIABLES.md)
- 💬 提交 Issue: GitHub Issues

---

**祝部署顺利！记得在主网部署前充分测试。🚀**


