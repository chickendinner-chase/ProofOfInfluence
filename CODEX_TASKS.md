# Codex 智能合约开发任务清单

## 📋 任务概述

**项目**: ProofOfInfluence TGE
**负责人**: Codex AI
**优先级**: P0 → P1 → P2
**技术栈**: Solidity 0.8.20 + Hardhat + OpenZeppelin
**网络**: Base, Arbitrum, Ethereum

---

## 🎯 P0 优先级（必须完成）

### 1. POI Token 合约

**合约名**: `POI.sol`
**基础**: ERC20 + ERC20Permit + AccessControl

**功能需求**:
- ✅ 标准 ERC20 功能（transfer, approve, transferFrom）
- ✅ EIP-2612 Permit（无 gas 授权）
- ✅ 角色管理（ADMIN, MINTER, PAUSER）
- ✅ 铸造功能（仅 MINTER 角色）
- ✅ 销毁功能（burn, burnFrom）
- ✅ 暂停功能（仅 PAUSER 角色）

**验收标准**:
- ✅ permit() 函数正常工作
- ✅ 非授权地址铸造失败
- ✅ 暂停后转账拒绝
- ✅ 部署到 Base Sepolia 可用，关键函数在实际交互脚本中跑通（mint/burn/pause）

**OpenZeppelin 导入**:
```solidity
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
```

---

### 2. Vesting Vault 解锁金库

**合约名**: `VestingVault.sol`

**功能需求**:
- ✅ 多受益人管理
- ✅ 断崖解锁（cliff period）
- ✅ 线性解锁（vesting period）
- ✅ 支持不同解锁计划
  - 团队：12 months cliff + 36 months linear
  - 投资者：6 months cliff + 24 months linear
- ✅ 查询已解锁金额
- ✅ 提取可用代币

**验收标准**:
- ✅ addBeneficiary(address, amount, cliff, duration) 正常
- ✅ vestedAmount(address) 计算正确
- ✅ withdraw() 仅能提取已解锁金额
- ✅ 时间计算精确

**关键函数**:
```solidity
function addBeneficiary(address beneficiary, uint256 amount, uint256 cliff, uint256 duration) external onlyOwner
function vestedAmount(address beneficiary) public view returns (uint256)
function withdraw() external
```

---

### 3. TGE Sale 销售合约

**合约名**: `TGESale.sol`

**功能需求**:
- ✅ USDC 募资
- ✅ 价格档位（分阶段定价）
- ✅ 白名单限额（Merkle proof）
- ✅ 最小/最大认购限制
- ✅ 黑名单功能
- ✅ 暂停/恢复销售
- ✅ 安全提取募集资金

**验收标准**:
- ✅ 认购后可赎回 POI
- ✅ 黑名单地址被拒绝
- ✅ 暂停时无法认购
- ✅ 资金与代币安全转移
- ✅ 事件日志完整

**关键函数**:
```solidity
function purchase(uint256 usdcAmount, bytes32[] calldata proof) external
function withdraw() external onlyOwner
function setPaused(bool paused) external onlyOwner
```

---

### 4. Merkle Airdrop 分发合约

**合约名**: `MerkleAirdropDistributor.sol`

**功能需求**:
- ✅ Merkle tree 验证
- ✅ 支持多轮空投（不同 Merkle 根）
- ✅ 每地址领取限制（一次/多次可配置）
- ✅ 时间窗口（开始/结束时间）
- ✅ 紧急暂停
- ✅ 剩余代币提取

**验收标准**:
- ✅ claim(index, account, amount, proof) 通过验证
- ✅ 重复领取被拒绝
- ✅ 无效 proof 被拒绝
- ✅ 事件 AirdropClaimed(index, account, amount) 触发

**关键函数**:
```solidity
function claim(uint256 index, address account, uint256 amount, bytes32[] calldata proof) external
function setMerkleRoot(bytes32 root, uint256 roundId) external onlyOwner
function isClaimed(uint256 index) public view returns (bool)
```

---

### 5. EarlyBird Allowlist 白名单

**合约名**: `EarlyBirdAllowlist.sol`

**功能需求**:
- ✅ Merkle root 验证
- ✅ 资格查询
- ✅ 可被其他合约调用（TGESale 等）
- ✅ 管理员可更新 Merkle 根

**验收标准**:
- ✅ isEligible(address, proof) 返回 true/false
- ✅ 其他合约可调用查询
- ✅ Merkle 根可更新

**关键函数**:
```solidity
function isEligible(address account, bytes32[] calldata proof) public view returns (bool)
function setMerkleRoot(bytes32 root) external onlyOwner
```

---

## 🎯 P1 优先级（次要功能）

### 6. Referral Registry 邀请注册

**合约名**: `ReferralRegistry.sol`

**功能需求**:
- ✅ 记录 inviter → invitee 关系
- ✅ 防止自引（不能推荐自己）
- ✅ 一次性绑定（不可修改）
- ✅ 查询推荐关系
- ✅ 链上时间戳记录

**验收标准**:
- ✅ setReferrer(parent) 仅能调用一次
- ✅ 自引被拒绝
- ✅ emit RefBound(child, parent, timestamp)

**关键函数**:
```solidity
function setReferrer(address parent) external
function getReferrer(address child) public view returns (address)
function getReferralCount(address parent) public view returns (uint256)
```

---

### 7. Achievement Badges SBT徽章

**合约名**: `AchievementBadges.sol`
**基础**: ERC1155（非转让）

**功能需求**:
- ✅ 基于 ERC1155 多代币标准
- ✅ 铸造受控（仅授权地址）
- ✅ 转账被阻止（_beforeTokenTransfer hook）
- ✅ 批量查询（balanceOfBatch）
- ✅ URI 元数据

**验收标准**:
- ✅ mint(to, tokenId, amount) 仅 MINTER 可调用
- ✅ transfer/safeTransferFrom 全部 revert
- ✅ OpenSea 不显示"Transfer"按钮
- ✅ 前端可读取 balanceOf 批量渲染

**关键函数**:
```solidity
function mint(address to, uint256 id, uint256 amount) external onlyRole(MINTER_ROLE)
function _beforeTokenTransfer(...) internal override { revert("SBT: non-transferable"); }
```

---

## 🚀 P2 优先级（后续功能）

### 8. Staking Rewards 质押奖励

**合约名**: `StakingRewards.sol`
**参考**: Synthetix StakingRewards

**功能需求**:
- ✅ 单币质押 POI
- ✅ 奖励分发（由金库补充）
- ✅ 动态 APR 计算
- ✅ 灵活提取

**验收标准**:
- ✅ stake(amount) 正常
- ✅ withdraw(amount) 正常
- ✅ getReward() 领取奖励
- ✅ APR 由前端计算展示

**关键函数**:
```solidity
function stake(uint256 amount) external
function withdraw(uint256 amount) external
function getReward() external
function earned(address account) public view returns (uint256)
```

---

## 🛠️ 开发规范

### 代码标准
- Solidity 版本：`^0.8.20`
- 许可证：MIT
- 编码风格：遵循 OpenZeppelin 规范
- 注释：NatSpec 格式（@notice, @param, @return）

### 测试要求（以功能为准）
- 提供最小可运行的 Hardhat 脚本/测试，验证关键流程能用（部署→参数设置→真实函数调用）
- 至少包含失败分支示例（权限不足/超额/无效 proof 等）
- 可在 Base Sepolia 实测一遍（建议脚本化）

### 部署脚本
为每个合约创建部署脚本：
- `scripts/deploy-token.ts`
- `scripts/deploy-vesting.ts`
- `scripts/deploy-tge-sale.ts`
- `scripts/deploy-airdrop.ts`
- `scripts/deploy-early-bird.ts`
- `scripts/deploy-referral.ts`
- `scripts/deploy-badges.ts`
- `scripts/deploy-staking.ts`

### 部署记录
部署后保存到 `deployments/` 目录：
```json
{
  "network": "base-sepolia",
  "contractName": "POI",
  "address": "0x...",
  "deployer": "0x...",
  "timestamp": "2025-11-14T...",
  "constructorArgs": [...]
}
```

---

## 📦 交付要求

### 代码提交
- 分支：`dev`
- Commit 格式：`feat(contracts): add POI token contract (Codex)`

### 文件结构
```
contracts/
├── POI.sol
├── VestingVault.sol
├── TGESale.sol
├── MerkleAirdropDistributor.sol
├── EarlyBirdAllowlist.sol
├── ReferralRegistry.sol
├── AchievementBadges.sol
└── StakingRewards.sol

test/
├── POI.test.ts
├── VestingVault.test.ts
├── TGESale.test.ts
├── MerkleAirdropDistributor.test.ts
├── EarlyBirdAllowlist.test.ts
├── ReferralRegistry.test.ts
├── AchievementBadges.test.ts
└── StakingRewards.test.ts

scripts/
├── deploy-token.ts
├── deploy-vesting.ts
├── deploy-tge-sale.ts
├── deploy-airdrop.ts
├── deploy-early-bird.ts
├── deploy-referral.ts
├── deploy-badges.ts
└── deploy-staking.ts
```

### 文档要求
每个合约包含：
- README.md（功能说明）
- 合约注释（NatSpec）
- 测试说明
- 部署说明

---

## ⚠️ 注意事项

### Codex 职责
- ✅ 开发智能合约
- ✅ 编写测试
- ✅ 创建部署脚本
- ✅ 提交代码到 GitHub
- ❌ **不部署**（交给 Replit）

### Replit 职责
- ✅ 在 Replit Secrets 管理私钥
- ✅ 部署合约到测试网/主网
- ✅ 验证部署结果
- ✅ 记录部署信息

### Cursor 职责（我）
- ✅ 前端页面开发（已完成）
- ✅ 集成智能合约 ABI
- ✅ 前端调用合约方法
- ✅ 审查合约代码

---

## 🔄 工作流程

```
1. Codex 开发合约
   ↓
2. Codex 编写测试
   ↓
3. Codex 提交到 GitHub (dev 分支)
   ↓
4. Cursor 审查代码
   ↓
5. Replit 部署到测试网
   ↓
6. Cursor 集成前端
   ↓
7. 测试验证
   ↓
8. Replit 部署到主网
```

---

## 📧 沟通协议

### 开始任务
**Codex → Coordination**:
```
"开始开发 POI Token 合约（P0-1）"
```

### 完成任务
**Codex → Cursor**:
```
"POI Token 合约已完成并提交到 dev 分支
- 文件: contracts/POI.sol
- 测试: test/POI.test.ts
- 运行脚本: scripts/deploy-token.ts + scripts/verify-token-call.ts（包含一次 mint/burn/pause 验证）
- 请审查代码"
```

### 请求部署
**Codex → Replit**:
```
"POI Token 合约代码已完成，请部署到 Base Sepolia 测试网
- 合约: contracts/POI.sol
- 脚本: scripts/deploy-token.ts
- 初始铸造: 1,000,000,000 POI"
```

---

## 📚 参考资源

### OpenZeppelin 文档
- ERC20: https://docs.openzeppelin.com/contracts/4.x/erc20
- AccessControl: https://docs.openzeppelin.com/contracts/4.x/access-control
- Pausable: https://docs.openzeppelin.com/contracts/4.x/api/security#Pausable

### Hardhat 文档
- Testing: https://hardhat.org/tutorial/testing-contracts
- Deployment: https://hardhat.org/tutorial/deploying-to-a-live-network

### 项目参考
- Synthetix StakingRewards: https://github.com/Synthetixio/synthetix/blob/master/contracts/StakingRewards.sol
- OpenZeppelin Merkle Airdrop: https://github.com/OpenZeppelin/workshops/tree/master/06-nft-merkle-drop

---

## ✅ 任务检查清单

### 合约开发
- [ ] POI Token (P0-1)
- [ ] Vesting Vault (P0-2)
- [ ] TGE Sale (P0-3)
- [ ] Merkle Airdrop (P0-4)
- [ ] EarlyBird Allowlist (P0-5)
- [ ] Referral Registry (P1-6)
- [ ] Achievement Badges (P1-7)
- [ ] Staking Rewards (P2-8)

### 测试
- [ ] 每个合约单元测试
- [ ] 集成测试
- [ ] Gas 优化
- [ ] 安全审查

### 部署准备
- [ ] 部署脚本
- [ ] 构造函数参数
- [ ] 验证脚本
- [ ] 文档说明

---

## 🎯 优先级执行顺序

**Week 1**:
1. POI Token（最基础）
2. Vesting Vault（团队/投资者解锁）
3. TGE Sale（募资核心）

**Week 2**:
4. Merkle Airdrop（空投分发）
5. EarlyBird Allowlist（白名单）

**Week 3**:
6. Referral Registry（推荐关系）
7. Achievement Badges（徽章系统）

**Week 4**:
8. Staking Rewards（质押功能）

---

## 📞 联系方式

**有问题随时沟通**:
- Coordination 频道：技术讨论
- Cursor 频道：前端集成相关
- Replit 频道：部署相关

---

**Codex，准备好开始了吗？建议从 P0-1 POI Token 合约开始！** 🚀

