# SciFlow - DeSci Research Bounty Platform

A decentralized science (DeSci) platform connecting research funders with verified labs through bounties, milestones, and crypto-enabled payments.

## Features

- **Research Bounties** - Create and manage research bounties with milestone-based payouts
- **Lab Verification** - Tiered verification system (Basic, Verified, Trusted, Institutional)
- **Proposal System** - Labs submit proposals to compete for bounties
- **Admin Ethics Gate** - Every bounty passes admin safety/ethics approval before funding
- **OpenClaw Orchestration** - Automated pre-screening signals (harm, ethics, quality) to accelerate admin review
- **Milestone Tracking** - Track research progress with deliverables and verification
- **Multi-Currency Payments** - Support for USD (Stripe), Solana USDC, and Base USDC
- **Escrow System** - Secure fund management with milestone-based releases
- **Dispute Resolution** - Built-in arbitration for research disputes

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Styling**: Tailwind CSS + shadcn/ui
- **Payments**: Stripe, Solana, Base (via Coinbase CDP SDK)
- **State Management**: XState for bounty lifecycle

## Quick Start

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Configure environment**
   - Copy `.env.local` and fill in your credentials
   - At minimum, you need Supabase credentials

3. **Set up Supabase**
   - Create a project at [supabase.com](https://supabase.com)
   - Run the migration in `lib/db/migrations/001_initial_schema.sql`
   - Add your Supabase URL and keys to `.env.local`

4. **Run development server**
   ```bash
   pnpm dev
   ```

5. **Open the app**
   - Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

Required for basic functionality:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

See `docs/SETUP.md` for complete setup instructions including payment providers.
For the hardened architecture and risk model, see `docs/SECURITY-HARDENING-AND-IDEAL-FLOW.md`.

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Main application pages
│   └── (auth)/           # Authentication pages
├── components/            # React components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
│   ├── db/               # Database schema and migrations
│   ├── machines/         # XState state machines
│   ├── payments/         # Payment provider integrations
│   └── supabase/         # Supabase client configuration
└── types/                 # TypeScript type definitions
```

## License

MIT
