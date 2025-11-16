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

### 待部署合约

| 合约名称 | 状态 | 说明 |
|---------|------|------|
| **TGESale** | ⏭️ 待部署 | TGE 销售合约 |
| **ReferralRegistry** | ⏭️ 待部署 | 推荐注册表 |
| **AchievementBadges** | ⏭️ 待部署 | 成就徽章 |
| **ImmortalityBadge** | ⏭️ 待部署 | 不朽徽章 |

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
```

---

## 合约配置文件

所有合约地址已更新到 `shared/contracts/*.json`：

- ✅ `shared/contracts/poi.json`
- ✅ `shared/contracts/staking_rewards.json`
- ✅ `shared/contracts/vesting_vault.json`
- ✅ `shared/contracts/merkle_airdrop.json`
- ✅ `shared/contracts/early_bird_allowlist.json`

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

---

## 更新日期

**最后更新**: 2025-11-16  
**部署网络**: Base Sepolia (Chain ID: 84532)

