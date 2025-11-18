# 合约地址清单

## Base Sepolia 测试网 (Chain ID: 84532)

### 已部署合约

| 合约名称 | 地址 | 状态 | 说明 |
|---------|------|------|------|
| **POIToken** | `0x737869142C93078Dae4d78D4E8c5dbD45160565a` | ✅ 已部署 | POI ERC20 代币 |
| **StakingRewards** | `0xe23f7688303768BB1CE2e2a98540A0C1ba63ec2d` | ✅ 已部署 | 质押奖励合约 |
| **VestingVault** | `0xe4E695722C598CBa27723ab98049818b4b827924` | ✅ 已部署 | 锁仓金库 |
| **MerkleAirdropDistributor** | `0xa3ae789eA6409ab5F92a69EC41dbA1E6f3C57A2e` | ✅ 已部署 | 空投分发 |
| **EarlyBirdAllowlist** | `0x75D75a4870762422D85D275b22F5A87Df78b4852` | ✅ 已部署 | 早鸟白名单 |

### 新部署合约

| 合约名称 | 地址 | 状态 | 说明 |
|---------|------|------|------|
| **TGESale** | `0x323b3197911603692729c6a5F7375d9AC8c3bA93` | ✅ 已部署 | TGE 销售合约（tiers 已配置） |
| **ReferralRegistry** | `0xD857D2E232031CD6311Fba80c62E3F11f7Fb9bD0` | ✅ 已部署 | 推荐注册表 |
| **AchievementBadges** | `0xe86C5077b60490A11316D40AB1368d7d73770E00` | ✅ 已部署 | 成就徽章 |
| **ImmortalityBadge** | `0xbd637B458edbdb1dB420d220BF92F7bd02382000` | ✅ 已部署 | 不朽徽章 |

---

## 部署说明

### 部署顺序

按以下顺序部署待部署合约：

1. **TGESale** (最高优先级)
2. **ReferralRegistry**
3. **AchievementBadges**
4. **ImmortalityBadge**

### 部署前准备

1. 确保 `.env` 文件已配置必要的环境变量：
   ```env
   PRIVATE_KEY=your_private_key
   BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
   POI_ADDRESS=0x737869142C93078Dae4d78D4E8c5dbD45160565a
   USDC_TOKEN_ADDRESS=your_usdc_address
   ```

2. 编译合约：
   ```bash
   npm run compile
   ```

### 部署命令

#### 1. 部署 TGESale

```bash
# 使用 Hardhat network flag
npx hardhat run scripts/deploy-tge-sale-run.cjs --network base-sepolia

# 或直接使用 node（需要配置 RPC_URL）
node scripts/deploy-tge-sale-run.cjs
```

**环境变量要求：**
- `USDC_TOKEN_ADDRESS` - USDC 代币地址
- `POI_ADDRESS` - POI 代币地址
- `TGE_TREASURY` (可选) - 金库地址，默认使用部署者地址

**配置来源：**
- 从 `scripts/tokenomics.config.json` 读取 TGE 配置
- 自动配置 tiers、sale window、contribution bounds、whitelist

#### 2. 部署 ReferralRegistry

```bash
node scripts/deploy-referral-run.cjs
```

**环境变量要求：**
- `POI_TOKEN_ADDRESS` 或 `POI_ADDRESS` (可选) - 如果设置，会自动配置为奖励代币

#### 3. 部署 AchievementBadges

```bash
node scripts/deploy-badges-run.cjs
```

**环境变量要求：**
- `BADGES_NAME` (可选) - 默认: "POI Achievement Badges"
- `BADGES_SYMBOL` (可选) - 默认: "POIAB"

#### 4. 部署 ImmortalityBadge

```bash
node scripts/deploy-immortality-badge-run.cjs
```

**环境变量要求：**
- `IMMORTALITY_BADGE_BASE_URI` (可选) - Base URI for token metadata
- `IMMORTALITY_BADGE_ADMIN` (可选) - Admin 地址，默认使用部署者地址

### 部署后验证

所有部署脚本会自动：
- ✅ 保存合约地址到 `shared/contracts/*.json`
- ✅ 验证合约代码存在（code size > 0）
- ✅ 输出部署地址和配置信息

### 地址持久化

所有部署脚本使用 `scripts/utils/persist-contract.cjs` 工具函数自动保存地址到：
- `shared/contracts/poi_tge.json` - TGESale
- `shared/contracts/referral_registry.json` - ReferralRegistry
- `shared/contracts/achievement_badges.json` - AchievementBadges
- `shared/contracts/immortality_badge.json` - ImmortalityBadge

---

## 环境变量配置

### 后端环境变量 (.env)

```env
# Base Sepolia Network
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
CHAIN_ID=84532

# Contract Addresses
POI_TOKEN_ADDRESS=0x737869142C93078Dae4d78D4E8c5dbD45160565a
STAKING_REWARDS_ADDRESS=0xe23f7688303768BB1CE2e2a98540A0C1ba63ec2d
VESTING_VAULT_ADDRESS=0xe4E695722C598CBa27723ab98049818b4b827924
MERKLE_AIRDROP_ADDRESS=0xa3ae789eA6409ab5F92a69EC41dbA1E6f3C57A2e
EARLY_BIRD_ALLOWLIST_ADDRESS=0x75D75a4870762422D85D275b22F5A87Df78b4852

# 新部署合约地址
TGE_SALE_ADDRESS=0x323b3197911603692729c6a5F7375d9AC8c3bA93
REFERRAL_REGISTRY_ADDRESS=0xD857D2E232031CD6311Fba80c62E3F11f7Fb9bD0
ACHIEVEMENT_BADGES_ADDRESS=0xe86C5077b60490A11316D40AB1368d7d73770E00
IMMORTALITY_BADGE_ADDRESS=0xbd637B458edbdb1dB420d220BF92F7bd02382000
```

### 前端环境变量 (client/.env.local)

```env
# Base Sepolia Network
VITE_CHAIN_ID=84532
VITE_BASE_RPC_URL=https://sepolia.base.org
VITE_BASE_EXPLORER=https://sepolia.basescan.org

# Contract Addresses
VITE_POI_ADDRESS=0x737869142C93078Dae4d78D4E8c5dbD45160565a
VITE_STAKING_REWARDS_ADDRESS=0xe23f7688303768BB1CE2e2a98540A0C1ba63ec2d
VITE_VESTING_VAULT_ADDRESS=0xe4E695722C598CBa27723ab98049818b4b827924
VITE_MERKLE_AIRDROP_ADDRESS=0xa3ae789eA6409ab5F92a69EC41dbA1E6f3C57A2e
VITE_EARLY_BIRD_ALLOWLIST_ADDRESS=0x75D75a4870762422D85D275b22F5A87Df78b4852

# 新部署合约地址
VITE_TGE_SALE_ADDRESS=0x323b3197911603692729c6a5F7375d9AC8c3bA93
VITE_REFERRAL_REGISTRY_ADDRESS=0xD857D2E232031CD6311Fba80c62E3F11f7Fb9bD0
VITE_ACHIEVEMENT_BADGES_ADDRESS=0xe86C5077b60490A11316D40AB1368d7d73770E00
VITE_IMMORTALITY_BADGE_ADDRESS=0xbd637B458edbdb1dB420d220BF92F7bd02382000
```

---

## 合约配置文件

所有合约地址已更新到 `shared/contracts/*.json`：

**已部署合约：**
- ✅ `shared/contracts/poi.json`
- ✅ `shared/contracts/staking_rewards.json`
- ✅ `shared/contracts/vesting_vault.json`
- ✅ `shared/contracts/merkle_airdrop.json`
- ✅ `shared/contracts/early_bird_allowlist.json`

**新部署合约：**
- ✅ `shared/contracts/poi_tge.json` - TGESale
- ✅ `shared/contracts/referral_registry.json` - ReferralRegistry
- ✅ `shared/contracts/achievement_badges.json` - AchievementBadges
- ✅ `shared/contracts/immortality_badge.json` - ImmortalityBadge

---

## 前端配置

所有合约地址已添加到 `client/src/lib/baseConfig.ts`：

- ✅ `VESTING_VAULT_ADDRESS`
- ✅ `MERKLE_AIRDROP_ADDRESS`
- ✅ `EARLY_BIRD_ALLOWLIST_ADDRESS`

---

## 区块浏览器链接

### Base Sepolia Explorer
- **Base Sepolia**: https://sepolia.basescan.org

### 合约链接
- **POIToken**: https://sepolia.basescan.org/address/0x737869142C93078Dae4d78D4E8c5dbD45160565a
- **StakingRewards**: https://sepolia.basescan.org/address/0xe23f7688303768BB1CE2e2a98540A0C1ba63ec2d
- **VestingVault**: https://sepolia.basescan.org/address/0xe4E695722C598CBa27723ab98049818b4b827924
- **MerkleAirdropDistributor**: https://sepolia.basescan.org/address/0xa3ae789eA6409ab5F92a69EC41dbA1E6f3C57A2e
- **EarlyBirdAllowlist**: https://sepolia.basescan.org/address/0x75D75a4870762422D85D275b22F5A87Df78b4852
- **TGESale**: https://sepolia.basescan.org/address/0x323b3197911603692729c6a5F7375d9AC8c3bA93
- **ReferralRegistry**: https://sepolia.basescan.org/address/0xD857D2E232031CD6311Fba80c62E3F11f7Fb9bD0
- **AchievementBadges**: https://sepolia.basescan.org/address/0xe86C5077b60490A11316D40AB1368d7d73770E00
- **ImmortalityBadge**: https://sepolia.basescan.org/address/0xbd637B458edbdb1dB420d220BF92F7bd02382000

---

## 更新日期

**最后更新**: 2025-01-17  
**部署网络**: Base Sepolia (Chain ID: 84532)

