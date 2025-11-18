# Tokenomics Configuration Guide

本文档说明如何使用 `tokenomics.config.json` 统一管理所有智能合约参数。

## 配置文件位置

**主配置文件**: `scripts/tokenomics.config.json`

## 配置结构

### 1. POI Token 配置

```json
{
  "poiToken": {
    "initialSupply": "1000000000"
  }
}
```

**参数说明**:
- `initialSupply`: 初始供应量（POI 单位，18 位小数）
- 环境变量覆盖: `POI_INITIAL_SUPPLY`

---

### 2. TGE Sale 配置

```json
{
  "tgeSale": {
    "tiers": [
      {
        "price": "2",
        "amount": "500000"
      },
      {
        "price": "3",
        "amount": "250000"
      }
    ],
    "minContribution": "0",
    "maxContribution": "0",
    "saleStart": 0,
    "saleEnd": 0,
    "whitelistEnabled": false,
    "merkleRoot": "0x0000000000000000000000000000000000000000000000000000000000000000"
  }
}
```

**参数说明**:
- `tiers`: 价格层级数组
  - `price`: 每 POI 的 USDC 价格（6 位小数）
  - `amount`: 该层级的 POI 供应量（18 位小数）
- `minContribution`: 最小贡献额（USDC，6 位小数），0 = 无限制
- `maxContribution`: 最大贡献额（USDC，6 位小数），0 = 无限制
- `saleStart`: 销售开始时间戳，0 = 无限制
- `saleEnd`: 销售结束时间戳，0 = 无限制
- `whitelistEnabled`: 是否启用白名单
- `merkleRoot`: Merkle 根（启用白名单时必需）

**环境变量覆盖**:
- `SALE_TIERS`: JSON 格式的 tier 配置（覆盖 tiers 数组）
- `SALE_MIN_CONTRIBUTION`: 最小贡献额
- `SALE_MAX_CONTRIBUTION`: 最大贡献额
- `SALE_START_TIMESTAMP`: 开始时间戳
- `SALE_END_TIMESTAMP`: 结束时间戳
- `SALE_WHITELIST_ENABLED`: 是否启用白名单 (`"true"` / `"false"`)
- `SALE_MERKLE_ROOT`: Merkle 根

---

### 3. Vesting 配置

```json
{
  "vesting": {
    "schedules": [
      {
        "beneficiary": "0x1234567890123456789012345678901234567890",
        "totalAmount": "1000000",
        "cliff": 2592000,
        "duration": 15552000,
        "slicePeriodSeconds": 86400,
        "revocable": true,
        "start": 0
      }
    ]
  }
}
```

**参数说明**:
- `schedules`: 锁仓计划数组
  - `beneficiary`: 受益人地址（必需，空字符串会跳过该计划）
  - `totalAmount`: 总锁仓数量（POI 单位，18 位小数）
  - `cliff`: Cliff 期间（秒），例如 2592000 = 30 天
  - `duration`: 总锁仓时长（秒），例如 15552000 = 180 天
  - `slicePeriodSeconds`: 释放周期（秒），例如 86400 = 1 天
  - `revocable`: 是否可撤销
  - `start`: 开始时间戳（可选，默认为当前时间）

**创建 Vesting Schedules**:
```bash
node scripts/create-vesting-schedules.cjs
```

---

### 4. Staking Rewards 配置

```json
{
  "stakingRewards": {
    "rewardRate": "1000000000000000000",
    "rewardsDuration": 604800
  }
}
```

**参数说明**:
- `rewardRate`: 每秒奖励率（wei，18 位小数）
- `rewardsDuration`: 奖励周期（秒），例如 604800 = 7 天

**环境变量覆盖**:
- `STAKING_REWARD_RATE`: 每秒奖励率
- `STAKING_REWARDS_DURATION`: 奖励周期（秒）

---

### 5. Airdrop 配置

```json
{
  "airdrop": {
    "rounds": [
      {
        "roundId": 0,
        "recipients": [
          {
            "walletAddress": "0x1234567890123456789012345678901234567890",
            "amount": 1000
          }
        ]
      }
    ]
  }
}
```

**参数说明**:
- `rounds`: 空投轮次数组
  - `roundId`: 轮次 ID
  - `recipients`: 接收者数组（空数组会跳过该轮次）
    - `walletAddress`: 钱包地址
    - `amount`: 空投数量（POI 单位）

---

### 6. Early Bird Allowlist 配置

```json
{
  "earlyBird": {
    "allocations": [
      {
        "account": "0x1234567890123456789012345678901234567890",
        "allocation": "10000"
      }
    ]
  }
}
```

**参数说明**:
- `allocations`: 分配数组（空数组表示无白名单）
  - `account`: 账户地址
  - `allocation`: 分配额度（POI 单位，18 位小数）

---

## 使用方式

### 1. 编辑配置文件

编辑 `scripts/tokenomics.config.json` 设置参数。

### 2. 部署时自动读取

以下脚本会自动读取配置文件：

- `scripts/deploy-token-run.cjs` - 读取 `poiToken.initialSupply`
- `scripts/deploy-tge-sale-run.cjs` - 读取 `tgeSale` 配置

### 3. 创建 Vesting Schedules

```bash
# 设置 VESTING_VAULT_ADDRESS
export VESTING_VAULT_ADDRESS=0x...

# 创建 schedules
node scripts/create-vesting-schedules.cjs
```

### 4. 环境变量覆盖

环境变量优先级高于配置文件，例如：

```bash
# 覆盖初始供应量
export POI_INITIAL_SUPPLY=2000000000

# 覆盖 TGE tier 价格
export TGE_TIER_PRICES="0.5,0.75,1"
export TGE_TIER_SUPPLIES="100000,200000,300000"
```

---

## 工具函数

### 在脚本中使用

```javascript
const { 
  getPOITokenConfig,
  getTGESaleConfig,
  getVestingSchedules,
  getStakingRewardsConfig,
  getAirdropRounds,
  getEarlyBirdAllocations
} = require("./utils/tokenomics");

// 获取 POI Token 配置
const poiConfig = getPOITokenConfig();
console.log(poiConfig.initialSupply); // "1000000000"

// 获取 TGE Sale 配置
const tgeConfig = getTGESaleConfig();
console.log(tgeConfig.tiers); // [{ price: "2", amount: "500000" }, ...]

// 获取 Vesting Schedules（自动过滤空的 beneficiary）
const schedules = getVestingSchedules();
```

---

## 配置示例

### 示例 1: TGE 销售配置

```json
{
  "tgeSale": {
    "tiers": [
      { "price": "0.5", "amount": "1000000" },
      { "price": "1.0", "amount": "500000" },
      { "price": "1.5", "amount": "250000" }
    ],
    "minContribution": "100",
    "maxContribution": "10000",
    "saleStart": 1735689600,
    "saleEnd": 1736294400,
    "whitelistEnabled": true,
    "merkleRoot": "0x..."
  }
}
```

### 示例 2: Vesting 配置（团队锁仓）

```json
{
  "vesting": {
    "schedules": [
      {
        "beneficiary": "0xTeamAddress...",
        "totalAmount": "5000000",
        "cliff": 7776000,
        "duration": 31536000,
        "slicePeriodSeconds": 86400,
        "revocable": false,
        "start": 1735689600
      }
    ]
  }
}
```

说明:
- 5,000,000 POI
- 90 天 cliff 期
- 365 天线性释放
- 每日释放
- 不可撤销
- 从指定时间戳开始

---

## 注意事项

1. **时间戳**: `saleStart`/`saleEnd` 使用 Unix 时间戳（秒）
2. **金额格式**: 所有金额使用字符串格式（避免 JavaScript 精度问题）
3. **空值处理**: 
   - Vesting schedules 中 `beneficiary` 为空字符串会跳过
   - Airdrop rounds 中空的 `recipients` 数组会跳过
4. **环境变量优先级**: 环境变量 > 配置文件 > 默认值
5. **向后兼容**: 现有脚本仍然支持纯环境变量配置

---

## 相关文档

- [合约地址清单](docs/CONTRACT_ADDRESSES.md)
- [部署脚本说明](docs/CONTRACT_TESTING.md)
- [TGE Sale 合约文档](docs/contracts/TGESale.md)
- [VestingVault 合约文档](docs/contracts/VestingVault.md)

