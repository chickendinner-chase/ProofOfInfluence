# ReferralRegistry 集成文档

## 概述

ReferralRegistry 合约用于在链上记录推荐关系，并支持奖励分发。

## 已完成的集成

### 1. 合约部署脚本
- ✅ `scripts/deploy-referral-run.cjs` - 部署脚本（CJS 版本，绕过 Hardhat 配置问题）

### 2. 前端集成
- ✅ `client/src/hooks/useReferral.ts` - React hook 用于与合约交互
- ✅ `client/src/components/ReferralCard.tsx` - UI 组件
- ✅ `client/src/lib/baseConfig.ts` - 添加了 `REFERRAL_REGISTRY_ADDRESS`

### 3. 后端 API
- ✅ `server/routes/referral.ts` - 推荐合约集成路由
- ✅ 已注册到主路由系统

## 部署步骤

### 1. 部署合约

```bash
# 编译合约
npm run compile

# 部署 ReferralRegistry
node scripts/deploy-referral-run.cjs
```

部署后，更新环境变量：
```env
REFERRAL_REGISTRY_ADDRESS=0x...
```

### 2. 设置奖励代币

部署后，合约会自动设置 POI_TOKEN_ADDRESS 作为奖励代币（如果环境变量已配置）。

或者手动设置：
```javascript
await registry.setRewardToken(POI_TOKEN_ADDRESS);
```

### 3. 授予角色

合约使用 AccessControl，需要授予角色：
- `REGISTRAR_ROLE`: 可以注册推荐关系（通常授予后端服务）
- `REWARDER_ROLE`: 可以分发奖励（通常授予后端服务）

```javascript
await registry.grantRole(REGISTRAR_ROLE, backendAddress);
await registry.grantRole(REWARDER_ROLE, backendAddress);
```

## 前端使用

### 在 Dashboard 中集成

```tsx
import { ReferralCard } from "@/components/ReferralCard";

// 在 Dashboard 中添加
<ReferralCard />
```

### Hook 使用示例

```tsx
import { useReferral } from "@/hooks/useReferral";

function MyComponent() {
  const {
    referral,
    hasReferral,
    referralCount,
    totalRewardsEarned,
    formattedRewards,
    selfRegister,
    isRegistering,
  } = useReferral();

  // 注册推荐关系
  const handleRegister = async () => {
    await selfRegister("0x...", "REF123");
  };
}
```

## 合约功能

### 主要函数

1. **selfRegister(address inviter, bytes32 code)**
   - 用户自己注册推荐关系
   - 需要用户钱包签名

2. **register(address inviter, address invitee, bytes32 code)**
   - 管理员注册推荐关系（需要 REGISTRAR_ROLE）

3. **reward(address inviter, address invitee, uint256 amount)**
   - 分发奖励给推荐人（需要 REWARDER_ROLE）

4. **getReferral(address invitee)**
   - 查询推荐关系

5. **referralCounts(address inviter)**
   - 查询推荐人数

6. **totalRewardsEarned(address inviter)**
   - 查询总奖励

## 后端集成

### API 端点

- `POST /api/referral/register-on-chain` - 注册链上推荐关系
- `GET /api/referral/on-chain` - 查询链上推荐数据

### 与数据库集成

后端已有推荐系统 API（`/api/referral/*`），可以与链上合约数据同步：

1. 用户注册推荐关系时，同时记录到数据库和链上
2. 分发奖励时，从链上查询推荐关系，确保数据一致性

## 测试

### 本地测试

```bash
# 启动服务器
npm run dev

# 测试前端组件
# 访问 Dashboard 页面，查看 ReferralCard
```

### 合约测试

```bash
# 运行 Hardhat 测试
npm test -- --grep ReferralRegistry
```

## 下一步

1. ✅ 部署脚本已创建
2. ✅ 前端 hook 和组件已创建
3. ✅ 后端 API 框架已创建
4. ⏳ 部署合约到测试网
5. ⏳ 集成 AgentKit 实现自动注册
6. ⏳ 添加奖励分发逻辑

## 注意事项

1. **角色管理**: 确保正确授予 REGISTRAR_ROLE 和 REWARDER_ROLE
2. **奖励代币**: 部署后需要设置 rewardToken
3. **Gas 费用**: 用户注册需要支付 gas，考虑提供 gas 补贴
4. **数据同步**: 保持数据库和链上数据同步

---

**最后更新**: 2025-11-17  
**状态**: ✅ 前端和后端集成完成，合约已部署

