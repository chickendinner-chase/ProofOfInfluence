# Stripe Payment Setup Guide (Replit)

本项目仅在 Replit 部署，以下是 Stripe 支付配置步骤。

## Step 1: 获取 Stripe API 密钥

1. 访问 [Stripe Dashboard](https://dashboard.stripe.com/) 并登录
2. 点击左侧 **Developers**
3. 点击 **API keys**
4. 复制两个密钥：
   - **Publishable key**（公钥，以 `pk_test_` 或 `pk_live_` 开头）
   - **Secret key**（密钥，以 `sk_test_` 或 `sk_live_` 开头）

## Step 2: 在 Replit 配置环境变量

1. 打开你的 Replit 项目
2. 点击左侧工具栏的 **Secrets**（🔒 锁图标）
3. 添加以下 Secrets：

| Key | Value | 说明 |
|-----|-------|------|
| `STRIPE_SECRET_KEY` | `sk_test_...` 或 `sk_live_...` | Stripe 密钥 |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_...` 或 `pk_live_...` | Stripe 公钥 |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (可选) | Webhook 签名密钥 |
| `BASE_URL` | `https://your-repl.replit.app` | 你的 Replit 应用 URL |

> 💡 **测试模式**：使用 `sk_test_` 和 `pk_test_` 开头的密钥  
> 🔴 **生产模式**：使用 `sk_live_` 和 `pk_live_` 开头的密钥  
> ⚠️ **Webhook Secret**: 生产环境强烈推荐配置，用于验证 Stripe 发送的事件

## Step 3: 推送数据库变更

支付功能需要新的 `transactions` 表来存储交易记录。在 Replit Shell 运行：

```bash
npm run db:push
```

这将在数据库中创建以下表：
- `transactions` - 存储所有支付交易记录
  - 支持用户关联（已登录用户）和匿名购买
  - 记录 Stripe Session ID 和 Payment Intent ID
  - 追踪支付状态（pending, completed, failed, refunded）
  - 记录购买的 $POI token 数量

## Step 4: 配置 Stripe Webhook（生产环境推荐）

Webhook 用于接收 Stripe 的支付确认通知，自动更新交易状态。

### 开发环境（使用 Stripe CLI）

1. 安装 [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. 登录：`stripe login`
3. 转发 webhook 到本地：
```bash
stripe listen --forward-to https://your-repl.replit.app/api/stripe-webhook
```
4. 复制显示的 webhook secret (whsec_xxx) 到 Replit Secrets 中的 `STRIPE_WEBHOOK_SECRET`

### 生产环境

1. 在 [Stripe Dashboard](https://dashboard.stripe.com/webhooks) 创建 webhook
2. 端点 URL：`https://your-repl.replit.app/api/stripe-webhook`
3. 选择要接收的事件：
   - `checkout.session.completed` - 支付成功
   - `checkout.session.expired` - 支付会话过期
   - `payment_intent.payment_failed` - 支付失败
4. 复制 Webhook 签名密钥到 Replit Secrets 中的 `STRIPE_WEBHOOK_SECRET`

> 💡 如果不配置 Webhook Secret，系统仍可工作，但无法验证 Stripe 事件的真实性

## Step 5: 测试支付功能

### 测试卡号

Stripe 提供测试卡号用于开发测试：

**成功支付:**
- 卡号: `4242 4242 4242 4242`
- 有效期: 任何未来日期
- CVC: 任意3位数
- 邮编: 任意5位数

**拒绝支付（测试错误）:**
- 卡号: `4000 0000 0000 0002`

### 测试步骤

1. 点击 Replit 的 **Run** 按钮启动项目
2. 访问你的 Replit 应用 URL
3. 在 Landing 页面选择 $POI Token 购买金额（预设或自定义）
4. 点击 "Pay" 按钮
5. 重定向到 Stripe Checkout
6. 使用测试卡号完成支付
7. 成功后会重定向到 `/payment-success` 页面

## Step 6: 切换到生产模式

准备接受真实支付时：

1. **激活 Stripe 账户:**
   - 在 Stripe Dashboard 完成企业验证
   - 添加银行账户用于收款

2. **切换到生产密钥:**
   - 在 Stripe Dashboard 切换到 "Live mode"
   - 复制 **生产** API 密钥（以 `sk_live_` 和 `pk_live_` 开头）
   - 在 Replit Secrets 中更新密钥

3. **真实测试:**
   - 使用真实信用卡测试小额支付
   - 在 Stripe Dashboard 验证支付记录
   - 如需要可退款测试支付

## Payment Options

The integration is simplified to support only **$POI Token purchase**:

- **Buy $POI Token** - Quick select preset amounts: $10, $50, $100
- **Custom Amount** - Users can enter any amount between $1 and $10,000

The simplified interface removes complexity and focuses solely on token purchases through Stripe payment.

## Features Implemented

### ✅ Payment Flow
1. **Checkout Session Creation** - Creates Stripe payment session with user context
2. **Database Transaction Record** - Stores transaction details before redirect
3. **Stripe Hosted Checkout** - Secure payment page hosted by Stripe
4. **Webhook Processing** - Automatic status updates via Stripe webhooks
5. **Success Page** - Shows transaction details and $POI tokens purchased

### ✅ User Experience
- **Anonymous Purchases** - Users can buy without logging in
- **User-Linked Purchases** - Authenticated users get transactions linked to their account
- **Real-time Status** - Payment success page shows live transaction status
- **Transaction History** - Logged-in users can view purchase history at `/api/transactions`

### ✅ Data Management
- All transactions stored in database with full audit trail
- Status tracking: `pending` → `completed` / `failed`
- Email capture for receipts
- Metadata support for additional context

## 安全注意事项

- ✅ 所有密钥配置在 Replit Secrets，不要提交到 Git
- ✅ 开发测试使用 `sk_test_*` 密钥
- ✅ 生产环境使用 `sk_live_*` 密钥
- ✅ Secret Key 仅在后端使用，不要暴露在客户端代码

## 常见问题

### 错误: "Stripe Secret Key is not set"

- 检查 Replit Secrets 中是否配置了 `STRIPE_SECRET_KEY`
- 在 Replit Shell 重启服务

### 错误: "Failed to create checkout session"

- 验证 Stripe 密钥正确
- 确认金额在 $1 - $10,000 范围内
- 检查 Replit 网络连接

### 支付成功但跳转到 404

- 检查 Replit Secrets 中的 `BASE_URL` 是否正确
- 验证 `/payment-success` 路由是否正常工作

### Webhook Issues (Future Enhancement)

Currently, the integration uses simple redirects. For production, you may want to add webhooks to:
- Automatically update user accounts after payment
- Send confirmation emails
- Handle failed payments

See Stripe's [webhook documentation](https://stripe.com/docs/webhooks) for more info.

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Checkout Guide](https://stripe.com/docs/payments/checkout)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe Dashboard](https://dashboard.stripe.com/)

## Support

For issues with Stripe integration:
1. Check the browser console for errors
2. Check server logs in your terminal
3. Review Stripe Dashboard for payment events
4. Contact Stripe Support if you suspect an API issue

