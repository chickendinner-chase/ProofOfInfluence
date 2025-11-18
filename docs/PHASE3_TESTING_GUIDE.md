# Phase 3 测试指南

## 概述

Phase 3 实现了以下功能：
1. **AchievementBadges 合约集成** - 通过 AgentKit 铸造徽章
2. **ReferralRegistry 合约集成** - 查询推荐关系，准备用户签名交易
3. **钱包连接签名验证** - 实现 nonce-based 签名验证

## 前置条件

1. 服务器运行在 `http://localhost:5000`
2. 数据库已配置并连接
3. 合约地址已配置在 `shared/contracts/*.json`
4. AgentKit 环境变量已配置（CDP_API_KEY_NAME, CDP_API_KEY_PRIVATE_KEY）

## 测试步骤

### 1. 启动服务器

```bash
npm run dev
```

### 2. 测试合约配置加载

运行测试脚本：

```bash
node scripts/test-phase3-apis.js
```

这会检查：
- ✅ AchievementBadges 合约配置是否正确加载
- ✅ ReferralRegistry 合约配置是否正确加载
- ✅ Wallet nonce API 是否可访问

### 3. 测试 Wallet Nonce API（公开端点）

```bash
curl "http://localhost:5000/api/auth/wallet/nonce?address=0x1234567890123456789012345678901234567890"
```

**预期响应：**
```json
{
  "address": "0x1234567890123456789012345678901234567890",
  "nonce": "abc123...",
  "message": "Sign this nonce to prove ownership: abc123..."
}
```

### 4. 测试钱包连接签名验证（需要认证）

#### 步骤 1: 获取 nonce

```bash
curl "http://localhost:5000/api/auth/wallet/nonce?address=0xYourWalletAddress"
```

#### 步骤 2: 使用钱包签名消息

在前端或使用 ethers.js：
```javascript
const message = `Sign this nonce to prove ownership: ${nonce}`;
const signature = await wallet.signMessage(message);
```

#### 步骤 3: 提交连接请求

```bash
curl -X POST http://localhost:5000/api/wallet/connect \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{
    "walletAddress": "0xYourWalletAddress",
    "signature": "0xSignature..."
  }'
```

**预期响应：**
```json
{
  "id": "user-id",
  "walletAddress": "0xYourWalletAddress",
  ...
}
```

**测试场景：**
- ✅ 有效签名 → 成功连接
- ✅ 无效签名 → 返回 400 错误
- ✅ 过期 nonce → 返回 400 错误
- ✅ 重复使用 nonce → 返回 400 错误
- ✅ 无签名（向后兼容）→ 警告但允许

### 5. 测试 AchievementBadges Mint（需要认证 + AgentKit）

```bash
curl -X POST http://localhost:5000/api/badges/mint \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{
    "to": "0xUserWalletAddress",
    "badgeType": 1
  }'
```

**预期响应（成功）：**
```json
{
  "message": "徽章铸造成功",
  "to": "0xUserWalletAddress",
  "badgeType": 1,
  "txHash": "0x..."
}
```

**测试场景：**
- ✅ 有效请求 → 返回 txHash
- ✅ 未绑定钱包 → 返回 400 错误
- ✅ 无效 badgeType → 合约会拒绝
- ✅ 后端钱包无 MINTER_ROLE → 合约会拒绝

### 6. 测试 ReferralRegistry 查询（需要认证）

```bash
curl http://localhost:5000/api/referral/on-chain \
  -H "Cookie: <session-cookie>"
```

**预期响应：**
```json
{
  "hasReferral": true,
  "inviter": "0xInviterAddress",
  "code": "0x...",
  "timestamp": 1234567890,
  "referralCount": "5",
  "totalRewardsEarned": "1000000000000000000"
}
```

或如果没有推荐关系：
```json
{
  "hasReferral": false,
  "inviter": null,
  "referralCount": "0",
  "totalRewardsEarned": "0"
}
```

### 7. 测试 ReferralRegistry 注册准备（需要认证）

```bash
curl -X POST http://localhost:5000/api/referral/register-on-chain \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{
    "inviterAddress": "0xInviterAddress"
  }'
```

**预期响应：**
```json
{
  "message": "推荐关系注册交易已准备",
  "inviterAddress": "0xInviterAddress",
  "inviteeAddress": "0xUserWalletAddress",
  "code": "0x...",
  "transaction": {
    "to": "0xD857D2E232031CD6311Fba80c62E3F11f7Fb9bD0",
    "data": "0x...",
    "value": "0"
  },
  "note": "请在前端使用用户钱包签名并发送此交易"
}
```

**前端使用：**
```javascript
const response = await fetch("/api/referral/register-on-chain", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ inviterAddress: "0x..." })
});

const { transaction } = await response.json();

// 使用用户钱包签名并发送
const hash = await walletClient.sendTransaction({
  to: transaction.to,
  data: transaction.data,
  value: BigInt(transaction.value || 0),
});
```

## 集成测试流程

### 完整流程测试

1. **用户登录** → 获取 session cookie
2. **获取 nonce** → `/api/auth/wallet/nonce`
3. **签名并连接钱包** → `/api/wallet/connect`
4. **查询推荐关系** → `/api/referral/on-chain`
5. **准备注册交易** → `/api/referral/register-on-chain`
6. **用户签名并发送** → 前端使用 wagmi
7. **铸造徽章** → `/api/badges/mint`（AgentKit 执行）

## 错误处理测试

### AchievementBadges

- ❌ 合约未部署 → 错误消息
- ❌ 后端钱包无 MINTER_ROLE → 合约 revert
- ❌ 无效 badgeType → 合约 revert

### ReferralRegistry

- ❌ 合约未部署 → 返回默认值
- ❌ RPC 连接失败 → 返回默认值并记录错误
- ❌ 用户未绑定钱包 → 400 错误

### 钱包连接

- ❌ 无效地址格式 → 400 错误
- ❌ 签名不匹配 → 400 错误
- ❌ Nonce 过期 → 400 错误
- ❌ Nonce 已使用 → 400 错误

## 前端测试

### 使用浏览器 DevTools

1. 打开 `http://localhost:5173`
2. 登录并连接钱包
3. 打开 DevTools → Network 标签
4. 执行操作并观察 API 请求

### 测试 AchievementBadges

访问 `/app/immortality` 页面，点击"铸造徽章"按钮。

### 测试 ReferralRegistry

访问推荐相关页面，测试：
- 查询推荐关系
- 准备注册交易
- 用户签名并发送

## 验证清单

- [ ] 合约配置正确加载
- [ ] Wallet nonce API 正常工作
- [ ] 钱包连接签名验证工作
- [ ] AchievementBadges mint 通过 AgentKit 执行
- [ ] ReferralRegistry 查询返回正确数据
- [ ] ReferralRegistry 注册准备返回交易数据
- [ ] 错误处理正确（无效输入、合约错误等）
- [ ] 前端可以正常调用这些 API

## 注意事项

1. **AgentKit 配置**：确保 `CDP_API_KEY_NAME` 和 `CDP_API_KEY_PRIVATE_KEY` 已配置
2. **合约权限**：确保后端钱包有 AchievementBadges 的 MINTER_ROLE
3. **RPC 连接**：确保 `BASE_SEPOLIA_RPC_URL` 可访问
4. **数据库**：确保数据库连接正常（用于存储用户钱包地址）

## 故障排除

### 问题：AchievementBadges mint 失败

**检查：**
- 后端钱包是否有 MINTER_ROLE
- AgentKit 环境变量是否正确
- 合约地址是否正确

### 问题：ReferralRegistry 查询失败

**检查：**
- RPC URL 是否正确
- 合约地址是否正确
- 网络连接是否正常

### 问题：钱包连接签名验证失败

**检查：**
- Nonce 是否过期（10 分钟 TTL）
- 签名消息格式是否正确
- 钱包地址格式是否正确

