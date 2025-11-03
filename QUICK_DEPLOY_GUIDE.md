# 🚀 ProofOfInfluence 快速部署指南

## ✅ 已完成的功能

### 1. 登录后跳转到公开个人资料页
- 用户登录后自动跳转到 `/:username`
- 本人视角显示"编辑资料"和"充值"按钮

### 2. 独立充值页面（/recharge）
- 强调 $POI 为功能型代币
- 展示会员等级权益
- 说明费用抵扣积分机制

### 3. Landing 页面 RWA 链商板块
- 名贵手表示例
- 可溯源、匿名传递、高价值藏品
- 应用场景与隐私说明

### 4. $POI 优惠机制
- **会员等级折扣**：基于持有量的费率优惠
- **费用抵扣积分**：燃烧换积分（可选/分区开关）

---

## 📋 Replit 部署步骤

### 第 1 步：配置 Replit Secrets

在 Replit 项目中点击左侧 **"Tools" → "Secrets"**，添加以下环境变量：

#### 必需的环境变量（新增）

| Key | Value | 说明 |
|-----|-------|------|
| `REGION_DEFAULT` | `US` | 默认地区 |
| `FEATURE_POI_TIER_DISCOUNT` | `true` | 会员等级折扣功能（全局开启） |
| `FEATURE_POI_FEE_CREDIT` | `false` | 费用积分功能（默认关闭，按地区开放） |
| `POI_VWAP_FEED` | `internal` | POI 价格数据源 |
| `FEE_CREDIT_MAX_RATE` | `0.20` | 最多抵扣 20% 费用 |
| `FEE_CREDIT_DAILY_SNAPSHOT_HH` | `00` | 每日快照时间 |

#### 已有的环境变量（确认存在）

- `DATABASE_URL` - PostgreSQL 连接字符串
- `REPL_ID` - Replit 项目 ID
- `STRIPE_SECRET_KEY` - Stripe 密钥
- `STRIPE_WEBHOOK_SECRET` - Stripe Webhook 密钥
- `BASE_URL` - 网站基础 URL

---

### 第 2 步：Git 提交与推送

```bash
# 查看变更
git status

# 添加所有变更
git add .

# 提交
git commit -m "feat: POI utility token system with tier discounts and RWA luxury watch section

- Login redirects to public profile (/:username)
- Add /recharge page with utility token messaging
- Add RWA luxury watch section to landing
- Implement tier-based fee discounts (5-15%)
- Implement burn-for-credit mechanism (region-gated)
- Add checkout calculation utilities
- Add 4 new database tables for POI system
- Add 10+ API endpoints for POI and checkout
- Ensure compliance: POI only for fees, not item prices"

# 推送到 Replit（自动部署）
git push origin main
```

---

### 第 3 步：数据库迁移

Replit 部署完成后，在 Shell 中执行：

```bash
npm run db:push
```

**预期输出**：
```
✓ Created 4 new tables:
  - poi_tiers
  - poi_fee_credits
  - poi_burn_intents
  - poi_fee_credit_locks
```

---

### 第 4 步：初始化会员等级数据

有两种方式：

#### 方式 A：使用 SQL 文件（推荐）

```bash
# 如果有 psql 命令行工具
psql $DATABASE_URL < docs/DB_INIT.sql
```

#### 方式 B：手动插入

在 Replit Database 或 SQL 客户端中执行：

```sql
INSERT INTO poi_tiers (name, min_poi, fee_discount_rate, shipping_credit_cap_cents) 
VALUES
  ('Lv1 - Bronze', 5000, 0.05, 5000),
  ('Lv2 - Silver', 25000, 0.10, 15000),
  ('Lv3 - Gold', 100000, 0.15, 30000);
```

**验证数据**：

```sql
SELECT * FROM poi_tiers ORDER BY min_poi;
```

---

### 第 5 步：重启应用

在 Replit 中：
1. 停止当前运行（Ctrl+C 或点击 Stop）
2. 重新运行（点击 Run 按钮）

或者等待 Git push 后自动部署。

---

## 🧪 测试清单

### 前端功能测试

- [ ] **Landing 页面**
  - [ ] RWA 链商板块显示正常
  - [ ] 点击 "Get Started" 跳转到 Google 登录
  
- [ ] **登录流程**
  - [ ] Google 登录成功后自动跳转到 `/:username`
  - [ ] 本人视角显示"编辑资料"和"充值"按钮
  
- [ ] **充值页面** (`/recharge`)
  - [ ] 显示"功能型代币"文案
  - [ ] 展示会员等级表
  - [ ] Stripe 支付组件正常
  
- [ ] **公开资料页** (`/:username`)
  - [ ] 本人视角：显示编辑和充值按钮
  - [ ] 访客视角：不显示这些按钮
  
- [ ] **编辑页面** (`/dashboard`)
  - [ ] 可以正常编辑资料和链接

### 后端 API 测试

在浏览器或 Postman 中测试：

- [ ] `GET /api/poi/tiers` - 返回 3 个等级
- [ ] `GET /api/features` - 返回功能开关状态
- [ ] `GET /api/region` - 返回 `{"region":"US"}`

**需要登录的接口**：
- [ ] `GET /api/poi/me/tier` - 返回用户等级信息
- [ ] `GET /api/poi/me/fee-credits` - 返回积分余额

### 数据库测试

```sql
-- 查看所有表
\dt

-- 验证 POI 表存在
SELECT * FROM poi_tiers;
SELECT COUNT(*) FROM poi_fee_credits;
SELECT COUNT(*) FROM poi_burn_intents;
SELECT COUNT(*) FROM poi_fee_credit_locks;
```

---

## 🎯 用户流程演示

### 流程 1：新用户注册

```
访问 https://your-repl.replit.app
  ↓
点击 "Get Started - Sign in with Google"
  ↓
Google OAuth 认证
  ↓
自动跳转到 /your-username （公开资料页）
  ↓
看到 "编辑资料" 和 "充值" 按钮
```

### 流程 2：充值 $POI

```
公开资料页
  ↓
点击 "充值" 按钮
  ↓
/recharge 页面
  ↓
阅读功能型代币说明
  ↓
Stripe 支付
  ↓
POI 代币到账（未来实现）
```

### 流程 3：购物结算（未来）

```
选择商品（名贵手表）
  ↓
结算页面
  ↓
自动应用会员等级折扣（5-15%）
  ↓
可选使用 Fee Credits 抵扣（最多 20%）
  ↓
使用 Visa/Crypto 支付商品价款 + 剩余费用
  ↓
库内过户（匿名）或实物发货（需 KYC）
```

---

## 📊 新增的 API 端点

### POI 相关

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/poi/tiers` | 获取所有会员等级 | ❌ |
| GET | `/api/poi/me/tier` | 获取当前用户等级 | ✅ |
| GET | `/api/poi/me/fee-credits` | 获取积分余额 | ✅ |
| POST | `/api/poi/fee-credits/burn-intent` | 燃烧换积分 | ✅ |

### Checkout 相关

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/checkout/quote` | 计算结算金额 | ❌ |
| POST | `/api/checkout/lock-credits` | 锁定积分 | ✅ |
| POST | `/api/checkout/confirm` | 确认消费 | ✅ |
| POST | `/api/checkout/cancel` | 取消/释放 | ✅ |

### 配置相关

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/region` | 获取地区 | ❌ |
| GET | `/api/features` | 获取功能开关 | ❌ |

---

## 🔍 故障排查

### 问题 1：数据库迁移失败

**症状**：`npm run db:push` 报错 "DATABASE_URL not found"

**解决**：
1. 检查 Replit Secrets 中是否配置了 `DATABASE_URL`
2. 确保格式正确：`postgresql://user:password@host:5432/database`

### 问题 2：登录后没有跳转

**症状**：登录成功但停留在 Landing 页

**解决**：
1. 检查用户是否设置了 username
2. 在 Dashboard 的 Profile 标签页设置 username
3. 刷新页面

### 问题 3：会员等级数据未显示

**症状**：充值页面显示"示例数据"

**解决**：
1. 确认执行了 `docs/DB_INIT.sql`
2. 手动插入等级数据（见第 4 步）
3. 检查 API `/api/poi/tiers` 是否返回数据

### 问题 4：环境变量未生效

**症状**：功能开关不工作

**解决**：
1. 重启 Replit 应用
2. 检查 Secrets 拼写是否正确
3. 在 Shell 中运行 `echo $FEATURE_POI_TIER_DISCOUNT`

---

## 📚 相关文档

- **详细实现总结**：`IMPLEMENTATION_SUMMARY.md`
- **环境变量配置**：`ENV_CONFIG.md`
- **数据库初始化**：`docs/DB_INIT.sql`
- **Stripe 配置**：`docs/STRIPE_SETUP.md`

---

## 🎉 部署完成检查

部署成功后，确认以下项目：

- ✅ Landing 页面显示 RWA 链商板块
- ✅ 登录后自动跳转到 `/:username`
- ✅ 充值页面 `/recharge` 可访问
- ✅ 本人视角显示编辑和充值按钮
- ✅ `/api/poi/tiers` 返回 3 个等级数据
- ✅ `/api/features` 返回正确的功能开关

**恭喜！ProofOfInfluence 已成功部署！** 🚀

---

## 📞 需要帮助？

如果遇到问题：
1. 检查上面的故障排查部分
2. 查看 Replit Console 的错误日志
3. 检查 Network 面板的 API 请求
4. 参考详细文档（IMPLEMENTATION_SUMMARY.md）

祝部署顺利！🎊

