# 合约测试脚本使用指南

本文档说明如何使用测试脚本来验证已部署的智能合约功能。

## 测试脚本列表

1. **test-vesting.cjs** - 测试 VestingVault 合约
2. **test-airdrop.cjs** - 测试 MerkleAirdropDistributor 合约
3. **test-early-bird.cjs** - 测试 EarlyBirdAllowlist 合约

## 前置要求

### 1. 环境变量配置

在 `.env` 文件中配置以下变量：

```env
# 必需
PRIVATE_KEY=your_private_key_here
# 或
DEPLOYER_PRIVATE_KEY=your_private_key_here

# 合约地址（根据要测试的合约选择）
VESTING_VAULT_ADDRESS=0x...
MERKLE_AIRDROP_ADDRESS=0x...
EARLY_BIRD_ALLOWLIST_ADDRESS=0x...

# POI Token 地址
POI_TOKEN_ADDRESS=0x...
# 或
POI_ADDRESS=0x...
```

### 2. 网络配置

确保 `hardhat.config.cjs` 中配置了正确的网络（Base Sepolia 或 Base 主网）。

## 使用方法

### 测试 VestingVault

```bash
node scripts/test-vesting.cjs
```

**功能测试：**
- 检查用户是否有锁仓计划（schedule）
- 如果没有，且调用者是 owner，会尝试创建一个测试计划
- 检查每个计划的详细信息
- 测试释放（release）功能
- 验证状态变化和事件

**注意事项：**
- 需要 vault 合约中有足够的 POI 代币
- 如果创建新计划，需要确保 vault 已获得代币授权

### 测试 MerkleAirdropDistributor

```bash
node scripts/test-airdrop.cjs
```

**功能测试：**
- 检查 token 是否已设置
- 检查是否暂停（paused）
- 检查当前 round 和 Merkle root
- 测试 claim 功能（使用单叶树进行测试）
- 验证防重复 claim 机制

**注意事项：**
- 需要先设置 Merkle root（作为 owner）
- 需要向 airdrop 合约转入足够的 POI 代币
- 测试使用单叶树（root = leaf），实际使用需要生成完整的 Merkle 树

**设置测试 root：**
```javascript
// 对于单叶树，root = leaf
const leaf = keccak256(keccak256(abi.encode(index, account, amount)));
await airdrop.setRoot(leaf);
```

### 测试 EarlyBirdAllowlist

```bash
node scripts/test-early-bird.cjs
```

**功能测试：**
- 检查 Merkle root 是否已设置
- 测试验证（verify）功能
- 检查剩余分配（remaining）
- 测试消费（consume）功能
- 验证防超额消费机制

**注意事项：**
- 需要先设置 Merkle root（作为 owner）
- consume 功能需要调用者是 owner 或 trusted consumer
- 测试使用单叶树，实际使用需要生成完整的 Merkle 树

**设置测试 root：**
```javascript
// 对于单叶树，root = leaf
const leaf = keccak256(keccak256(abi.encode(account, allocation)));
await allowlist.setRoot(leaf);
```

**设置 trusted consumer：**
```javascript
await allowlist.setTrustedConsumer(consumerAddress, true);
```

## 测试流程建议

### 1. 部署合约后立即测试

```bash
# 1. 部署 VestingVault
npx hardhat run scripts/deploy-vesting.ts --network base-sepolia

# 2. 测试 VestingVault
node scripts/test-vesting.cjs

# 3. 部署 MerkleAirdropDistributor
npx hardhat run scripts/deploy-airdrop.ts --network base-sepolia

# 4. 测试 MerkleAirdropDistributor
node scripts/test-airdrop.cjs

# 5. 部署 EarlyBirdAllowlist
npx hardhat run scripts/deploy-early-bird.ts --network base-sepolia

# 6. 测试 EarlyBirdAllowlist
node scripts/test-early-bird.cjs
```

### 2. 准备测试数据

#### VestingVault
- 向 vault 合约转入 POI 代币
- 作为 owner 创建测试计划

#### MerkleAirdropDistributor
- 生成 Merkle 树（或使用单叶树测试）
- 设置 root
- 向合约转入 POI 代币

#### EarlyBirdAllowlist
- 生成 Merkle 树（或使用单叶树测试）
- 设置 root
- 设置 trusted consumer（如果需要）

## 常见问题

### 1. "Missing XXX_ADDRESS environment variable"

**解决：** 在 `.env` 文件中添加对应的合约地址。

### 2. "Cannot create schedule: caller is not owner"

**解决：** 使用 owner 账户的私钥，或让 owner 创建计划。

### 3. "Contract balance < claim amount"

**解决：** 向合约转入足够的代币。

### 4. "Root does not match test leaf"

**解决：** 设置与测试数据匹配的 root，或使用正确的 Merkle 证明。

### 5. "Not a trusted consumer"

**解决：** 作为 owner 调用 `setTrustedConsumer(consumerAddress, true)`。

## 测试输出说明

每个测试脚本会输出：
- ✅ 成功操作
- ⚠️ 警告信息
- ✗ 错误信息
- 详细的状态变化
- Gas 使用情况
- 事件日志

## 下一步

测试通过后，可以：
1. 更新 `shared/contracts/*.json` 中的合约地址
2. 在前端集成这些合约
3. 创建前端 hooks 来调用合约功能
4. 继续开发其他功能

## 相关文档

- **部署清单**: `docs/DEPLOYMENT_CHECKLIST.md`
- **合约架构**: `docs/ARCHITECTURE.md`
- **合约开发任务**: `CODEX_TASKS.md`

