# SciFlow Setup Guide

This guide will help you set up SciFlow for local development and production deployment.

## Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- A Supabase account
- A Stripe account (for fiat payments)
- Solana wallet (for crypto payments)

---

## 1. Supabase Setup (Required)

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **API Keys** from Settings > API

### Run Database Migrations

1. Open the SQL Editor in your Supabase dashboard
2. Copy the contents of `lib/db/migrations/001_initial_schema.sql`
3. Run the SQL to create all tables, indexes, and RLS policies

### Get Your API Keys

From **Settings > API**, copy:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

---

## 2. Environment Variables

Create a `.env.local` file in the project root:

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe (Required for fiat payments)
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Solana (Required for Solana USDC)
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_ESCROW_PROGRAM_ID=your_program_id
SOLANA_PLATFORM_WALLET=your_wallet_pubkey

# Base (Required for Base USDC)
BASE_RPC_URL=https://mainnet.base.org
BASE_ESCROW_CONTRACT=0x...
BASE_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
BASE_PLATFORM_WALLET=0x...

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
PLATFORM_FEE_PERCENTAGE=5
```

---

## 3. Stripe Setup (Fiat Payments)

### Get API Keys

1. Go to [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable key** and **Secret key**
3. For testing, use the test mode keys (starting with `pk_test_` and `sk_test_`)

### Set Up Webhooks (Production)

1. Go to **Developers > Webhooks**
2. Add endpoint: `https://sciflowlabs.com/api/payments/stripe/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
4. Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`

---

## 4. Solana Setup (Crypto Payments)

### Deploy Escrow Program

For production, you'll need to deploy an escrow program on Solana. We recommend:

1. Use the Anchor framework
2. Deploy to Devnet first for testing
3. Audit the program before Mainnet deployment

### Configure RPC

For production, use a dedicated RPC provider:
- [Helius](https://helius.dev)
- [QuickNode](https://quicknode.com)
- [Alchemy](https://alchemy.com)

---

## 5. Base Setup (EVM Payments)

### Deploy Escrow Contract

1. Deploy an ERC20 escrow contract on Base
2. Use OpenZeppelin's audited contracts as a base
3. Test on Base Goerli before Mainnet

### USDC Address on Base

- Mainnet: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- Testnet: Check Circle's documentation

---

## 6. Running Locally

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Open http://localhost:3000
```

---

## 7. Deploying to Vercel

### Add Environment Variables

1. Go to your Vercel project settings
2. Navigate to **Settings > Environment Variables**
3. Add all variables from your `.env.local`

### Deploy

```bash
# Deploy to production
npx vercel --prod
```

---

## 8. Seeding Test Data

After setting up Supabase, run the seed script:

```bash
pnpm seed
```

This will create:
- 3 test users (funder, lab, admin)
- 5 sample labs with varying verification tiers
- 10 sample bounties in different states
- Sample proposals and milestones

---

## 9. Testing Payments

### Stripe Test Cards

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0025 0000 3155 | 3D Secure required |

### Solana Devnet

1. Get test SOL from [faucet.solana.com](https://faucet.solana.com)
2. Get test USDC from Circle's faucet

### Base Testnet

1. Get test ETH from Base Goerli faucet
2. Get test USDC from Circle's faucet

---

## Troubleshooting

### "Internal server error" on API routes
- Check that Supabase environment variables are set
- Verify the database migrations have been run

### "Unauthorized" errors
- Clear browser cookies and sign in again
- Check Supabase auth settings

### Payments not working
- Verify Stripe/Solana/Base credentials
- Check webhook endpoints are accessible

---

## Support

- Email: support@sciflowlabs.com
- Docs: https://sciflowlabs.com/docs
- FAQ: https://sciflowlabs.com/faq
