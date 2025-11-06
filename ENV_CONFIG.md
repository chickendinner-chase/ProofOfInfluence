# 环境变量配置指南

本文档说明 ProofOfInfluence 项目需要的环境变量配置。

## 现有环境变量

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/proofofinfluence

# Replit Auth (OAuth)
REPL_ID=your-repl-id
REPLIT_DB_URL=your-replit-db-url

# Stripe Payment
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Base URL
BASE_URL=http://localhost:5173
```

## 新增环境变量（$POI 功能型代币）

### 区域与功能开关

```bash
# 默认地区设置（影响功能可用性）
REGION_DEFAULT=US

# 会员等级折扣功能（全局开启）
FEATURE_POI_TIER_DISCOUNT=true

# 费用抵扣积分功能（按地区灰度放开）
FEATURE_POI_FEE_CREDIT=false
```

### POI 代币定价与兑换

```bash
# POI 价格数据源：'internal'（内部设定）或 'oracle'（链上预言机）
POI_VWAP_FEED=internal

# 单笔交易费用抵扣上限（百分比，0.20 = 20%）
FEE_CREDIT_MAX_RATE=0.20

# 每日快照时间点（0-23 小时制）
FEE_CREDIT_DAILY_SNAPSHOT_HH=00
```

### 合规与安全限制（可选）

```bash
# POI 最小持有期（天数，避免短期投机）
POI_MIN_HOLDING_DAYS=7

# 单笔燃烧换积分上限（单位：美分）
FEE_CREDIT_MAX_PER_TX=50000

# 每日燃烧换积分总上限（单位：美分）
FEE_CREDIT_MAX_PER_DAY=200000
```

## Replit Secrets 配置方法

在 Replit 项目中：

1. 点击左侧 "Tools" → "Secrets"
2. 添加以下键值对：

| Key | Value (示例) | 说明 |
|-----|--------------|------|
| `REGION_DEFAULT` | `US` | 默认地区 |
| `FEATURE_POI_TIER_DISCOUNT` | `true` | 会员等级折扣（开启） |
| `FEATURE_POI_FEE_CREDIT` | `false` | 费用积分（默认关闭，按地区开放） |
| `POI_VWAP_FEED` | `internal` | 价格数据源 |
| `FEE_CREDIT_MAX_RATE` | `0.20` | 最多抵扣 20% 费用 |
| `FEE_CREDIT_DAILY_SNAPSHOT_HH` | `00` | 每日0点快照 |

## 数据库迁移

添加环境变量后，需要执行数据库迁移以创建 POI 相关表：

```bash
npm run db:push
```

或者手动执行 SQL（参见 `shared/schema.ts` 中的表定义）：

- `poi_tiers` - 会员等级表
- `poi_fee_credits` - 费用抵扣积分表
- `poi_burn_intents` - 燃烧记录表
- `poi_fee_credit_locks` - 积分锁定表

## 初始化会员等级数据

首次部署后，需要插入默认的会员等级数据：

```sql
INSERT INTO poi_tiers (name, min_poi, fee_discount_rate, shipping_credit_cap_cents) VALUES
('Lv1', 5000, 0.05, 5000),    -- 5,000 POI: -5% 平台费, $50 物流补贴
('Lv2', 25000, 0.10, 15000),  -- 25,000 POI: -10% 平台费, $150 物流补贴
('Lv3', 100000, 0.15, 30000); -- 100,000 POI: -15% 平台费, $300 物流补贴
```

## 合规说明

- **$POI 为功能型代币**：仅用于平台费用优惠，不能直接购买商品
- **会员等级折扣（默认开启）**：基于持有/质押 POI 获得费率优惠
- **费用抵扣积分（可选开启）**：燃烧 POI 换取 Fee Credits，仅抵扣平台费用
- **商品价款结算**：始终使用 Visa/Crypto 支付，$POI 不参与

## 测试配置

开发和测试环境建议配置：

```bash
REGION_DEFAULT=US
FEATURE_POI_TIER_DISCOUNT=true
FEATURE_POI_FEE_CREDIT=true  # 测试环境可开启
POI_VWAP_FEED=internal
FEE_CREDIT_MAX_RATE=0.20
```

## 生产环境注意事项

1. **地区合规**：根据用户所在地区和 KYC 状态决定是否启用 Fee Credit 功能
2. **价格预言机**：生产环境建议使用 `POI_VWAP_FEED=oracle` 连接链上价格数据
3. **监控与日志**：记录所有 POI 燃烧和积分使用行为，便于审计
4. **限额调整**：根据实际运营情况调整单笔/每日限额

## 相关文档

- [Stripe 配置](docs/STRIPE_SETUP.md)
- [数据库 Schema](shared/schema.ts)
- [API 路由](server/routes.ts)
- [前端充值页面](client/src/pages/Recharge.tsx)

