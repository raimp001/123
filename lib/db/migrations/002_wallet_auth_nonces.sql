-- ============================================================================
-- SCIFLOW MIGRATION 002
-- Wallet auth nonces + replay protection primitives
-- ============================================================================

CREATE TABLE IF NOT EXISTS wallet_auth_nonces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('evm', 'solana')),
  nonce TEXT NOT NULL,
  message TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(provider, wallet_address, nonce)
);

CREATE INDEX IF NOT EXISTS wallet_auth_nonces_lookup_idx
  ON wallet_auth_nonces (provider, wallet_address, nonce, used_at, expires_at);

-- Table is server-only (service role). We enable RLS and intentionally define
-- no policies so anon/authenticated keys cannot read or mutate challenges.
ALTER TABLE wallet_auth_nonces ENABLE ROW LEVEL SECURITY;

-- Optional helper for scheduled cleanup.
CREATE OR REPLACE FUNCTION cleanup_expired_wallet_auth_nonces()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM wallet_auth_nonces
  WHERE expires_at < NOW() - INTERVAL '1 day';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
