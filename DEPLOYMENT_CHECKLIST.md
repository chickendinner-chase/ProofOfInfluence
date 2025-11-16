# ProofOfInfluence 部署清单

## 📋 部署前准备

### 1. 环境配置
- [ ] 复制 `.env.sample` 为 `.env`
- [ ] 配置所有必需的环境变量
- [ ] 确保 Replit Secrets 中已设置敏感信息

### 2. 必需的密钥和账户
- [ ] CDP API Keys (CDP_API_KEY_NAME, CDP_API_KEY_PRIVATE_KEY)
- [ ] Deployer Private Key (DEPLOYER_PRIVATE_KEY)
- [ ] Treasury Wallet Address
- [ ] Neon Database URL (DATABASE_URL)

---

## 🚀 合约部署顺序

### 步骤 1: 编译合约
```bash
npm ci
npm run compile
```

### 步骤 2: POI Token 部署
```bash
npx hardhat run scripts/deploy-token.ts --network base-sepolia
```
- **构造参数**: 
  - admin: deployer.address
  - treasury: TREASURY_ADDRESS
  - initialSupply: POI_INITIAL_SUPPLY (1B POI = 1000000000 * 10^18)
- **记录地址**: 更新 `POI_TOKEN_ADDRESS` 和 `VITE_POI_ADDRESS`

### 步骤 3: TGESale 合约部署
```bash
npx hardhat run scripts/deploy-tge-sale.ts --network base-sepolia
```
- **构造参数**:
  - poiToken: POI_TOKEN_ADDRESS
  - usdcToken: USDC_TOKEN_ADDRESS
  - owner: deployer.address
  - treasury: SALE_TREASURY_ADDRESS
  - tiers: SALE_TIERS
  - minContribution: SALE_MIN_CONTRIBUTION
  - maxContribution: SALE_MAX_CONTRIBUTION
  - saleStart: SALE_START_TIMESTAMP
  - saleEnd: SALE_END_TIMESTAMP
- **记录地址**: 更新 `TGESALE_ADDRESS` 和 `VITE_TGESALE_ADDRESS`
- **后置操作**: 
  - POI Token 授权 TGESale 合约可以转账 POI
  - 配置销售层级和时间窗口

### 步骤 4: StakingRewards 合约部署
```bash
npx hardhat run scripts/deploy-staking.ts --network base-sepolia
```
- **构造参数**:
  - stakingToken: POI_TOKEN_ADDRESS
  - rewardsToken: POI_TOKEN_ADDRESS
  - owner: deployer.address
- **记录地址**: 更新 `STAKING_REWARDS_ADDRESS`
- **后置操作**: 配置奖励速率和时长

### 步骤 5: VestingVault 合约部署 (可选)
```bash
npx hardhat run scripts/deploy-vesting.ts --network base-sepolia
```
- **构造参数**:
  - tokenAddress: POI_TOKEN_ADDRESS
  - owner: deployer.address
- **记录地址**: 更新 `VESTING_VAULT_ADDRESS`

### 步骤 6: MerkleAirdropDistributor 部署 (可选)
```bash
npx hardhat run scripts/deploy-airdrop.ts --network base-sepolia
```
- **构造参数**:
  - owner: deployer.address
  - token: POI_TOKEN_ADDRESS
  - treasury: TREASURY_ADDRESS
- **记录地址**: 更新 `MERKLE_AIRDROP_ADDRESS`

### 步骤 7: EarlyBirdAllowlist 部署 (可选)
```bash
npx hardhat run scripts/deploy-early-bird.ts --network base-sepolia
```
- **构造参数**:
  - owner: deployer.address
- **记录地址**: 更新 `EARLY_BIRD_ALLOWLIST_ADDRESS`

### 步骤 8: ReferralRegistry 部署 (可选)
```bash
npx hardhat run scripts/deploy-referral.ts --network base-sepolia
```
- **构造参数**:
  - admin: deployer.address
- **记录地址**: 更新 `REFERRAL_REGISTRY_ADDRESS`

### 步骤 9: AchievementBadges 部署 (可选)
```bash
npx hardhat run scripts/deploy-badges.ts --network base-sepolia
```
- **构造参数**:
  - name: "Achievement Badges"
  - symbol: "BADGE"
  - admin: deployer.address
- **记录地址**: 更新 `ACHIEVEMENT_BADGES_ADDRESS`

### 步骤 10: ImmortalityBadge 部署 (可选)
```bash
npx hardhat run scripts/deploy-immortality-badge.ts --network base-sepolia
```
- **记录地址**: 更新 `IMMORTALITY_BADGE_ADDRESS`

---

## ✅ 部署后配置

### 1. 更新合约地址文件
- [ ] 更新 `shared/contracts/poi.json` 中的 POI address
- [ ] 更新 `shared/contracts/poi_tge.json` 中的 TGESale address
- [ ] 更新 `shared/contracts/staking_rewards.json` 中的 Staking address
- [ ] 更新所有其他合约 JSON 文件

### 2. TGESale 授权配置
如果使用 AgentKit 钱包代购买：
```bash
# 方法 A: 通过 API
POST /api/contracts/USDC/approve
Body: { "amount": "1000000000" }

# 方法 B: 通过脚本
# 创建并运行授权脚本
```

### 3. 配置 TGESale 参数
```bash
# 配置销售层级
npx hardhat run scripts/configure-tge-tiers.ts --network base-sepolia

# 设置销售时间窗口
npx hardhat run scripts/configure-tge-window.ts --network base-sepolia

# (可选) 设置白名单
npx hardhat run scripts/configure-whitelist.ts --network base-sepolia
```

### 4. StakingRewards 初始化
```bash
# 配置奖励期限和数量
npx hardhat run scripts/configure-staking-rewards.ts --network base-sepolia
```

### 5. DEX 流动性添加 (可选)
```bash
# 添加 POI/USDC 流动性池
npx hardhat run scripts/add-liquidity-v2.ts --network base-sepolia
```

---

## 🗄️ 数据库设置

### 1. 运行数据库迁移
```bash
npm run db:push
```

### 2. 验证数据库连接
```bash
# 检查数据库表是否正确创建
npm run db:studio
```

---

## 🌐 前端部署

### 1. 验证环境变量
确保所有 `VITE_*` 变量已正确设置：
- [ ] VITE_CHAIN_ID
- [ ] VITE_BASE_RPC_URL
- [ ] VITE_USDC_ADDRESS
- [ ] VITE_POI_ADDRESS
- [ ] VITE_TGESALE_ADDRESS
- [ ] VITE_BASESCAN_URL
- [ ] VITE_WALLETCONNECT_PROJECT_ID

### 2. 构建和部署
```bash
# 本地测试
npm run dev

# Replit 部署（Autoscale）
# 点击 Replit 部署按钮
```

### 3. 功能验证
- [ ] Immortality 页面
  - [ ] POI 购买 (TGE) 功能
  - [ ] POI 质押 (Staking) 功能
  - [ ] 显示正确的价格和余额
- [ ] 早鸟注册页面
  - [ ] 邮箱 + 钱包绑定
  - [ ] 提交流程正常
- [ ] Profile 页面
  - [ ] 钱包连接
  - [ ] 用户数据显示
- [ ] About 页面
  - [ ] 内容显示正常

---

## 🧪 测试清单

### 用户钱包模式测试
- [ ] 连接 MetaMask/WalletConnect
- [ ] USDC 授权给 TGESale 合约
- [ ] 购买 POI 代币 (`buyWithBaseToken`)
- [ ] 查看交易记录 (Basescan)
- [ ] POI 授权给 Staking 合约
- [ ] 质押 POI (`stake`)
- [ ] 解除质押 (`withdraw`)
- [ ] 领取质押奖励 (`getReward`)

### AgentKit 模式测试 (可选)
- [ ] CDP 钱包 USDC 授权: `POST /api/contracts/USDC/approve`
- [ ] 平台代购买: `POST /api/contracts/TGESale/purchase`
- [ ] 返回交易哈希验证

### 只读接口测试
- [ ] `GET /api/tge/status?wallet=0x...` 返回正确的销售状态
- [ ] `GET /api/staking/stats?wallet=0x...` 返回正确的质押信息

---

## ⚠️ 常见问题

### 1. 合约未部署
- **问题**: 前端/后端报 "Contract not deployed"
- **解决**: 检查 `shared/contracts/*.json` 是否有正确的 address

### 2. USDC 地址错误
- **问题**: 交易失败或代币显示错误
- **解决**: 确认 Base Sepolia 和 Base Mainnet 使用不同的 USDC 地址

### 3. 销售时间窗口未开放
- **问题**: 购买时提示 "Sale not started" 或 "Sale ended"
- **解决**: 检查 `saleStart` 和 `saleEnd` 时间戳

### 4. 销售额度未配置
- **问题**: 购买时提示 "Invalid tier"
- **解决**: 运行 `configureTiers` 设置销售层级

### 5. AgentKit 配置错误
- **问题**: CDP 调用失败
- **解决**: 
  - 检查 `CDP_API_KEY_NAME` 和 `CDP_API_KEY_PRIVATE_KEY`
  - 验证 RPC URL 可访问

### 6. 数据库未初始化
- **问题**: 后端 API 报数据库错误
- **解决**: 运行 `npm run db:push`

---

## 📝 部署记录

### 合约地址记录表

| 合约名称 | 地址 | 部署时间 | 网络 |
|---------|------|---------|------|
| POIToken | | | Base Sepolia |
| TGESale | | | Base Sepolia |
| StakingRewards | | | Base Sepolia |
| VestingVault | | | Base Sepolia |
| MerkleAirdropDistributor | | | Base Sepolia |
| EarlyBirdAllowlist | | | Base Sepolia |
| ReferralRegistry | | | Base Sepolia |
| AchievementBadges | | | Base Sepolia |
| ImmortalityBadge | | | Base Sepolia |

### 关键交易哈希

| 操作 | 交易哈希 | 时间 |
|-----|---------|------|
| POI 部署 | | |
| TGESale 部署 | | |
| POI 授权 TGESale | | |
| TGESale 配置 Tiers | | |
| Staking 部署 | | |
| Staking 配置奖励 | | |
| 添加流动性 | | |

---

## 🎯 下一步行动

部署完成后：
1. [ ] 在 Basescan 上验证所有合约
2. [ ] 向团队分享合约地址
3. [ ] 设置监控和告警
4. [ ] 准备审计报告
5. [ ] 更新官方文档

---

**注意**: 此清单适用于 Base Sepolia 测试网。主网部署前请进行全面审计和测试。
