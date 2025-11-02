# Environment Variables Template for Stripe

Copy these variables to your `.env.local` file for local development, or add them to Replit Secrets for production.

## Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Session
SESSION_SECRET=your-session-secret-here

# Stripe Payment (Get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Base URL (for Stripe redirect URLs)
BASE_URL=http://localhost:5173
```

## Instructions

### For Local Development

1. Create a `.env.local` file in the project root
2. Copy the variables above
3. Replace placeholder values with your actual credentials
4. Get Stripe test keys from: https://dashboard.stripe.com/test/apikeys

### For Production (Replit)

1. Open your Repl
2. Click on **Secrets** (lock icon)
3. Add each variable as a separate secret
4. Use **live** Stripe keys (start with `sk_live_` and `pk_live_`)
5. Set `BASE_URL` to your Replit app URL

## Getting Stripe Keys

1. Sign up at https://dashboard.stripe.com/register
2. Navigate to **Developers > API keys**
3. For testing: Use keys that start with `sk_test_` and `pk_test_`
4. For production: Toggle to "Live mode" and use `sk_live_` and `pk_live_` keys

## Security

- Never commit `.env.local` to Git (it's in `.gitignore`)
- Keep your Secret Key private
- Use test keys for development
- Use live keys only in production

