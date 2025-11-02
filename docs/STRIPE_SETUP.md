# Stripe Payment Setup Guide

This guide will help you configure Stripe payment integration for ProofOfInfluence.

## Prerequisites

- A Stripe account ([sign up here](https://dashboard.stripe.com/register))
- Access to your Stripe API keys

## Step 1: Get Stripe API Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com/)
2. Click on **Developers** in the left sidebar
3. Click on **API keys**
4. You'll see two keys:
   - **Publishable key** (starts with `pk_test_` for test mode)
   - **Secret key** (starts with `sk_test_` for test mode)

## Step 2: Configure Environment Variables

### For Local Development

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Stripe keys to `.env.local`:
   ```bash
   STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
   BASE_URL=http://localhost:5173
   ```

### For Production (Replit)

1. Open your Repl in Replit
2. Click on the **Secrets** tool (lock icon in left sidebar)
3. Add the following secrets:
   - Key: `STRIPE_SECRET_KEY`, Value: `sk_live_your_live_secret_key`
   - Key: `STRIPE_PUBLISHABLE_KEY`, Value: `pk_live_your_live_publishable_key`
   - Key: `BASE_URL`, Value: `https://your-repl-url.replit.app`

## Step 3: Test the Integration

### Using Test Mode

Stripe provides test mode for development. Use these test card numbers:

**Successful Payment:**
- Card number: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Declined Payment (for testing errors):**
- Card number: `4000 0000 0000 0002`

### Testing Steps

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit http://localhost:5173

3. Select a payment purpose and amount

4. Click the "Pay" button

5. You'll be redirected to Stripe Checkout

6. Use a test card number to complete payment

7. You should be redirected to `/payment-success`

## Step 4: Go Live (Production)

When you're ready to accept real payments:

1. **Activate your Stripe account:**
   - Complete business verification in Stripe Dashboard
   - Add bank account for payouts

2. **Switch to live keys:**
   - In Stripe Dashboard, toggle from "Test mode" to "Live mode"
   - Copy your **live** API keys (start with `sk_live_` and `pk_live_`)
   - Update your production environment variables

3. **Test with a real card:**
   - Use a real credit card with a small amount
   - Verify the payment appears in your Stripe Dashboard
   - Refund the test payment if needed

## Payment Options

The integration supports flexible pricing with these purposes:

1. **Buy $POI Token** - Preset amounts: $10, $50, $100, or custom
2. **Monthly Membership** - $9.99/month
3. **Yearly Membership** - $99.99/year (save 20%)
4. **Enterprise Plan** - $299
5. **Tip / Donation** - Preset amounts: $5, $10, $20, or custom

Users can also enter custom amounts between $1 and $10,000.

## Security Notes

- **Never commit** `.env.local` or actual API keys to Git
- The `.env.local` file is already in `.gitignore`
- Use **test keys** (`sk_test_*`) for development
- Use **live keys** (`sk_live_*`) only in production
- Keep your Secret Key secure - never expose it in client-side code

## Troubleshooting

### Error: "Stripe Secret Key is not set"

- Check that `STRIPE_SECRET_KEY` is configured in your environment
- Restart your dev server after adding environment variables

### Error: "Failed to create checkout session"

- Verify your Stripe secret key is correct
- Check that the amount is between $1 and $10,000
- Ensure you have internet connection (Stripe API requires it)

### Payment succeeds but redirects to 404

- Check that `BASE_URL` is set correctly in your environment
- Verify the `/payment-success` route is working

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

