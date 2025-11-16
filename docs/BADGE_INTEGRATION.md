# AchievementBadges 集成文档

## 概述

AchievementBadges 合约用于发放不可转移的 ERC721 成就徽章，支持角色控制的铸造。

## 已完成的集成

### 1. 合约部署脚本
- ✅ `scripts/deploy-badges-run.cjs` - 部署脚本（CJS 版本，绕过 Hardhat 配置问题）

### 2. 前端集成
- ✅ `client/src/hooks/useBadge.ts` - React hook 用于与合约交互
- ✅ `client/src/components/BadgeCard.tsx` - UI 组件
- ✅ `client/src/lib/baseConfig.ts` - 添加了 `ACHIEVEMENT_BADGES_ADDRESS`

### 3. 后端 API
- ✅ `server/routes/badge.ts` - 徽章相关路由
- ✅ 已注册到主路由系统

## 部署步骤

### 1. 部署合约

```bash
# 编译合约
npm run compile

# 部署 AchievementBadges
node scripts/deploy-badges-run.cjs
```

部署后，更新环境变量：
```env
ACHIEVEMENT_BADGES_ADDRESS=0x...
```

### 2. 配置徽章类型

部署后，需要设置徽章类型：

```javascript
await badges.setBadgeType(1, "https://example.com/badge1.json", true);
await badges.setBadgeType(2, "https://example.com/badge2.json", true);
```

### 3. 授予 MINTER_ROLE

合约使用 AccessControl，需要授予角色：

```javascript
await badges.grantRole(MINTER_ROLE, backendAddress);
```

## 前端使用

### 在 Dashboard 中集成

```tsx
import { BadgeCard } from "@/components/BadgeCard";

// 在 Dashboard 中添加
<BadgeCard />
```

### Hook 使用示例

```tsx
import { useBadge } from "@/hooks/useBadge";

function MyComponent() {
  const {
    balance,
    badges,
    isLoading,
    isConfigured,
    refetch,
  } = useBadge();

  // balance 显示用户拥有的徽章数量
  // badges 需要从后端 API 或事件获取 token IDs
}
```

## 合约功能

### 主要函数

1. **setBadgeType(uint256 badgeType, string uri, bool enabled)**
   - 管理员配置徽章类型（需要 DEFAULT_ADMIN_ROLE）

2. **mintBadge(address to, uint256 badgeType)**
   - 铸造徽章给用户（需要 MINTER_ROLE）

3. **balanceOf(address owner)**
   - 查询用户拥有的徽章数量

4. **badgeTypeOf(uint256 tokenId)**
   - 查询徽章的类型

5. **tokenURI(uint256 tokenId)**
   - 查询徽章的元数据 URI

6. **getBadgeType(uint256 badgeType)**
   - 查询徽章类型的配置

## 重要限制

### ERC721Enumerable 缺失

合约**没有实现** ERC721Enumerable，这意味着：
- ❌ 没有 `tokenOfOwnerByIndex()` 方法
- ❌ 无法直接查询用户拥有的所有 token IDs

### 解决方案

1. **事件索引**: 通过监听 `BadgeMinted` 事件来追踪 token IDs
2. **后端索引器**: 在后端维护用户徽章索引
3. **简化实现**: 仅显示 balance，详细列表需要从后端获取

当前实现使用方案 3（简化版），未来可以升级到方案 1 或 2。

## 后端集成

### API 端点

- `GET /api/badges/tokens` - 获取用户的徽章 token IDs（需要认证）
- `GET /api/badges/:tokenId` - 查询特定徽章的详情
- `POST /api/badges/mint` - 铸造徽章（需要认证和 MINTER_ROLE）

### 与数据库集成

后端可以维护一个徽章索引表：

```typescript
// 伪代码
interface BadgeIndex {
  tokenId: bigint;
  owner: string;
  badgeType: number;
  mintedAt: Date;
}
```

从合约事件中同步数据：

```javascript
// 监听 BadgeMinted 事件
badges.on("BadgeMinted", (to, badgeType, tokenId) => {
  // 存储到数据库
  await storage.createBadgeIndex({
    tokenId,
    owner: to,
    badgeType,
    mintedAt: new Date(),
  });
});
```

## 测试

### 本地测试

```bash
# 启动服务器
npm run dev

# 测试前端组件
# 访问 Dashboard 页面，查看 BadgeCard
```

### 合约测试

```bash
# 运行 Hardhat 测试
npm test -- --grep AchievementBadges
```

## 下一步

1. ✅ 部署脚本已创建
2. ✅ 前端 hook 和组件已创建
3. ✅ 后端 API 框架已创建
4. ⏳ 部署合约到测试网
5. ⏳ 实现事件索引器
6. ⏳ 添加后端徽章索引数据库表
7. ⏳ 集成 AgentKit 实现自动铸造

## 注意事项

1. **角色管理**: 确保正确授予 MINTER_ROLE
2. **徽章类型**: 部署后需要配置徽章类型
3. **Token IDs**: 需要从事件或后端索引获取，合约本身不提供枚举功能
4. **Soulbound**: 徽章不可转移，这是设计特性

---

**最后更新**: 2025-01-XX  
**状态**: ✅ 前端和后端集成完成，等待部署和事件索引实现

