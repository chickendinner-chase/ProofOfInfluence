# Replit 测试指南

本文档说明如何在 Replit 上测试新开发的 Airdrop API 和 ReferralRegistry 集成。

## 📋 测试前准备

### 1. 拉取最新代码

在 Replit 上：

```bash
# 确保在 dev 分支
git checkout dev
git pull origin dev

# 或如果第一次设置
git fetch origin
git checkout -b dev origin/dev
```

### 2. 安装依赖

```bash
npm ci
```

### 3. 环境变量配置

在 Replit Secrets 中配置以下变量：

#### 数据库
- `DATABASE_URL` - PostgreSQL 连接字符串

#### 区块链
- `PRIVATE_KEY` 或 `DEPLOYER_PRIVATE_KEY` - 部署者私钥
- `BASE_SEPOLIA_RPC_URL` - Base Sepolia RPC URL
- `BASE_RPC_URL` - Base 主网 RPC URL（可选）

#### 合约地址
- `POI_TOKEN_ADDRESS` 或 `POI_ADDRESS` - POI Token 地址
- `VESTING_VAULT_ADDRESS` - VestingVault 地址
- `MERKLE_AIRDROP_ADDRESS` - MerkleAirdropDistributor 地址
- `EARLY_BIRD_ALLOWLIST_ADDRESS` - EarlyBirdAllowlist 地址
- `REFERRAL_REGISTRY_ADDRESS` - ReferralRegistry 地址（如果已部署）

#### 前端环境变量
在 `.env` 或 Replit 环境变量中：

```env
VITE_CHAIN_ID=84532
VITE_BASE_RPC_URL=https://sepolia.base.org
VITE_POI_ADDRESS=0x...
VITE_VESTING_VAULT_ADDRESS=0xe4E695722C598CBa27723ab98049818b4b827924
VITE_MERKLE_AIRDROP_ADDRESS=0xa3ae789eA6409ab5F92a69EC41dbA1E6f3C57A2e
VITE_EARLY_BIRD_ALLOWLIST_ADDRESS=0x75D75a4870762422D85D275b22F5A87Df78b4852
VITE_REFERRAL_REGISTRY_ADDRESS=0x... # 部署后更新
```

## 🗄️ 数据库迁移

### 1. 运行数据库迁移

```bash
npm run db:push
```

这将更新 `airdrop_eligibility` 表，添加：
- `merkle_index`
- `merkle_proof` (JSONB)
- `round_id`

### 2. 验证迁移

检查表结构是否正确：

```bash
# 连接到数据库并检查
# 表应该包含新字段
```

## 📦 编译合约

```bash
npm run compile
```

这将编译所有合约，包括 ReferralRegistry。

## 🚀 部署 ReferralRegistry（如果未部署）

```bash
node scripts/deploy-referral-run.cjs
```

部署后，更新环境变量：
```env
REFERRAL_REGISTRY_ADDRESS=0x... # 部署后的地址
```

## 🧪 测试步骤

### 1. 启动服务器

```bash
npm run dev
```

### 2. 测试 Airdrop API

#### 测试 1: 检查空投资格（无记录）

```bash
curl "http://localhost:5000/api/airdrop/check?address=0x1234567890123456789012345678901234567890"
```

预期响应：
```json
{
  "eligible": false,
  "amount": "0",
  "index": undefined,
  "proof": [],
  "roundId": undefined
}
```

#### 测试 2: 创建空投资格记录（需要认证）

```bash
# 需要先登录获取认证
curl -X POST http://localhost:5000/api/admin/airdrop/eligibility \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{
    "walletAddress": "0x1234567890123456789012345678901234567890",
    "amount": 1000,
    "merkleIndex": 0,
    "merkleProof": [],
    "roundId": 0
  }'
```

#### 测试 3: 批量创建空投资格

```bash
curl -X POST http://localhost:5000/api/admin/airdrop/batch \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{
    "recipients": [
      {
        "walletAddress": "0x1111111111111111111111111111111111111111",
        "amount": 1000
      },
      {
        "walletAddress": "0x2222222222222222222222222222222222222222",
        "amount": 2000
      }
    ],
    "roundId": 0
  }'
```

预期响应：
```json
{
  "created": 2,
  "root": "0x...",
  "recipients": [...]
}
```

#### 测试 4: 再次检查空投资格（应该有记录）

```bash
curl "http://localhost:5000/api/airdrop/check?address=0x1111111111111111111111111111111111111111"
```

预期响应：
```json
{
  "eligible": true,
  "amount": "1000000000000000000000",
  "index": 0,
  "proof": [],
  "roundId": 0
}
```

### 3. 测试前端组件

#### 访问 Dashboard

1. 启动前端（如果使用分离的前后端）：
   ```bash
   npm run dev:frontend
   ```

2. 访问 `http://localhost:5173/dashboard`

3. 检查以下组件：
   - ✅ **VestingCard**: 显示锁仓计划
   - ✅ **AirdropCard**: 显示空投资格和领取按钮
   - ✅ **AllowlistCard**: 显示早鸟白名单状态
   - ✅ **ReferralCard**: 显示推荐关系和注册表单

#### 测试流程

1. **连接钱包**
   - 点击钱包连接按钮
   - 使用 MetaMask 或其他钱包连接

2. **查看 VestingCard**
   - 检查是否有锁仓计划显示
   - 如果有可释放的代币，测试释放功能

3. **查看 AirdropCard**
   - 检查空投资格查询是否正常
   - 如果有资格，测试领取功能

4. **查看 AllowlistCard**
   - 检查白名单状态查询
   - 验证 Merkle root 显示

5. **查看 ReferralCard**
   - 输入推荐人地址
   - 测试注册推荐关系（需要合约已部署）

### 4. 使用测试脚本

运行自动化测试脚本：

```bash
# 设置 BASE_URL（如果服务器在不同端口）
export BASE_URL=http://localhost:5000

# 运行测试
node scripts/test-airdrop-api-simple.js
```

## 🔍 调试技巧

### 1. 检查日志

```bash
# 查看服务器日志
# 在 Replit 控制台中查看输出

# 检查数据库连接
# 确保 DATABASE_URL 正确配置
```

### 2. 验证环境变量

```bash
# 在 Replit Shell 中检查
echo $DATABASE_URL
echo $POI_TOKEN_ADDRESS
echo $VESTING_VAULT_ADDRESS
```

### 3. 检查合约地址

确保所有合约地址都已正确配置：

```bash
# 检查 shared/contracts/*.json 文件
cat shared/contracts/vesting_vault.json
cat shared/contracts/merkle_airdrop.json
cat shared/contracts/early_bird_allowlist.json
```

### 4. 测试数据库连接

```bash
# 在 Replit Shell 中
node -e "
const { db } = require('./server/db.ts');
db.select().from('users').limit(1).then(console.log).catch(console.error);
"
```

## ✅ 测试清单

### API 测试
- [ ] GET /api/airdrop/check - 检查空投资格（无记录）
- [ ] POST /api/admin/airdrop/eligibility - 创建资格记录
- [ ] POST /api/admin/airdrop/batch - 批量创建
- [ ] GET /api/airdrop/check - 检查空投资格（有记录）

### 前端组件测试
- [ ] VestingCard 加载和显示
- [ ] AirdropCard 资格检查和领取
- [ ] AllowlistCard 白名单状态显示
- [ ] ReferralCard 注册功能（如果合约已部署）

### 数据库测试
- [ ] airdrop_eligibility 表迁移成功
- [ ] 可以插入新记录
- [ ] 可以查询记录

### 合约集成测试
- [ ] 前端可以读取合约数据
- [ ] 前端可以调用合约方法（需要钱包）

## 🐛 常见问题

### 1. 数据库连接失败

**问题**: `Error: getaddrinfo ENOTFOUND host`

**解决**: 
- 检查 `DATABASE_URL` 是否正确
- 确保数据库服务运行正常
- 检查网络连接

### 2. 合约未配置

**问题**: 前端显示"合约未配置"

**解决**:
- 检查环境变量是否正确设置
- 确保 `shared/contracts/*.json` 中的地址正确
- 检查 `baseConfig.ts` 中的默认值

### 3. Merkle Proof 为空

**问题**: API 返回的 proof 是空数组

**解决**:
- 这是正常的（简化版本仅支持单 leaf 树）
- 生产环境需要使用 `merkletreejs` 生成完整 proof

### 4. 前端无法连接后端

**问题**: API 请求失败

**解决**:
- 检查服务器是否运行
- 检查 CORS 配置
- 检查端口是否正确

## 📝 测试报告模板

```markdown
## Replit 测试报告

**日期**: 2025-11-17
**测试者**: [姓名]
**分支**: dev

### 环境
- Node 版本: vXX.X.X
- 数据库: ✅ 连接正常
- 合约地址: ✅ 已配置

### API 测试结果
- ✅ GET /api/airdrop/check - 通过
- ✅ POST /api/admin/airdrop/batch - 通过
- ⚠️ POST /api/admin/airdrop/eligibility - 需要认证

### 前端测试结果
- ✅ VestingCard - 通过
- ✅ AirdropCard - 通过
- ✅ AllowlistCard - 通过
- ⏳ ReferralCard - 等待合约部署

### 问题
1. [列出任何问题]

### 下一步
1. [下一步行动]
```

## 🚀 部署到生产前的检查

1. ✅ 所有测试通过
2. ✅ 数据库迁移成功
3. ✅ 环境变量正确配置
4. ✅ 合约已部署并配置
5. ✅ 前端可以正常访问
6. ✅ API 响应正常
7. ✅ 错误处理完善

---

**最后更新**: 2025-11-17  
**状态**: ✅ 准备测试

