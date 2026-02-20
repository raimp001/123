# SciFlow Security Hardening + Ideal Flow

## Critical Loopholes Found

1. Wallet auth replay/spoof risk
- Previous behavior: accepted signatures without nonce-bound message verification.
- Impact: account takeover risk.
- Fix implemented: nonce-backed challenge/response with expiry + one-time use, strict EVM and Solana signature checks (`/api/auth/wallet` + `wallet_auth_nonces` table).

2. Admin ethics gate missing from live flow
- Previous behavior: bounties could move toward funding without mandatory admin approval.
- Impact: harmful proposals could enter marketplace.
- Fix implemented: `admin_review` state and transitions (`ADMIN_APPROVE_PROTOCOL`, `ADMIN_REQUEST_CHANGES`, `ADMIN_REJECT_PROTOCOL`).

3. Payment integrity mismatch (client-driven amounts / schema mismatch)
- Previous behavior: funding amount accepted from client; crypto endpoints wrote columns not present in schema.
- Impact: incorrect escrow accounting and broken funding path.
- Fix implemented: server-derived amount from `bounties.total_budget`, corrected escrow field mappings for Stripe/Solana/Base.

4. Mock chain verification treated as success
- Previous behavior: Base/Solana tx verification accepted almost any tx hash.
- Impact: fake deposits could mark bounties funded.
- Fix implemented: insecure verification is disabled by default (`ALLOW_INSECURE_CHAIN_VERIFICATION=false`).

5. Webhook privilege model incorrect
- Previous behavior: Stripe webhook used session-scoped Supabase client.
- Impact: webhook updates could fail or behave unpredictably under RLS.
- Fix implemented: webhook now uses service-role client.

## OpenClaw Agent Orchestration (Implemented)

`lib/agents/openclaw-orchestrator.ts` now runs a deterministic pre-screen with:
- Harm scan
- Ethics sensitivity scan
- Quality/completeness scan
- Fraud-likelihood heuristic

Output:
- `decision`: `allow | manual_review | reject`
- `score`: 0-100
- `signals`: structured issues for admin review
- `traceId`: audit trail

Integration:
- Executed during bounty creation (`POST /api/bounties`).
- Hard reject on high-risk harm signal.
- All accepted submissions still enter `admin_review` for mandatory manual approval.

## Ideal End-to-End Lifecycle

1. Funder drafts bounty
2. OpenClaw pre-screen runs
3. Bounty enters `admin_review`
4. Admin approves to `ready_for_funding`
5. Funder initiates Stripe or crypto escrow
6. Verified funding transitions bounty to `bidding`
7. Lab selected, milestones executed, escrow released per verified milestone
8. Disputes route through admin/arbitrator resolution flow

## Base + Solana + Coinbase Smart Wallet

- Base wallet path is configured with `coinbaseWallet(... preference: 'smartWalletOnly')` in `lib/wagmi-config.ts`.
- Connect UI now labels this path as Coinbase Smart Wallet.
- Crypto funding API supports both Base and Solana escrow initialization and verification.

## Migration Requirements

Run:
- `lib/db/migrations/001_initial_schema.sql`
- `lib/db/migrations/002_wallet_auth_nonces.sql`

Without migration 002, wallet auth hardening will reject challenge creation.
