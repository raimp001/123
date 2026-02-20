/**
 * SciFlow Agent Wallet Setup
 *
 * Run ONCE to create the AI agent's CDP server wallet on Base.
 * It will print AGENT_WALLET_DATA — save it in Vercel env vars.
 *
 * Usage:
 *   node scripts/setup-agent-wallet.mjs
 *
 * Requires .env.local to have:
 *   CDP_API_KEY_NAME=...
 *   CDP_API_KEY_PRIVATE_KEY=...
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.local manually
const envPath = resolve(__dirname, '../.env.local')
const envLines = readFileSync(envPath, 'utf8').split('\n')
for (const line of envLines) {
  const [key, ...rest] = line.split('=')
  if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
}

const apiKeyName = process.env.CDP_API_KEY_NAME
const apiKeyPrivateKey = process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, '\n')

if (!apiKeyName || !apiKeyPrivateKey) {
  console.error('❌ Missing CDP_API_KEY_NAME or CDP_API_KEY_PRIVATE_KEY in .env.local')
  console.error('')
  console.error('Steps:')
  console.error('  1. Go to https://portal.cdp.coinbase.com → API Keys')
  console.error('  2. Create a key with Wallet permissions')
  console.error('  3. Add CDP_API_KEY_NAME and CDP_API_KEY_PRIVATE_KEY to .env.local')
  process.exit(1)
}

console.log('🔑 CDP API key found:', apiKeyName)
console.log('🌐 Creating agent wallet on Base mainnet...\n')

try {
  const { CdpWalletProvider } = await import('@coinbase/agentkit')

  const walletProvider = await CdpWalletProvider.configureWithWallet({
    apiKeyName,
    apiKeyPrivateKey,
    networkId: 'base-mainnet',
  })

  const address = await walletProvider.getAddress()
  const walletData = await walletProvider.exportWallet()
  const walletDataStr = JSON.stringify(walletData)

  console.log('✅ Agent wallet created!')
  console.log('━'.repeat(60))
  console.log('')
  console.log('📍 Wallet address:', address)
  console.log('')
  console.log('🔗 View on BaseScan:')
  console.log(`   https://basescan.org/address/${address}`)
  console.log('')
  console.log('━'.repeat(60))
  console.log('📋 Add this to Vercel environment variables:')
  console.log('')
  console.log('Key:   AGENT_WALLET_DATA')
  console.log('Value:', walletDataStr)
  console.log('')
  console.log('━'.repeat(60))
  console.log('💡 Run this command to add it to Vercel:')
  console.log('')
  console.log(`   printf '${walletDataStr.replace(/'/g, "'\\''")}' | vercel env add AGENT_WALLET_DATA production`)
  console.log('')
  console.log('⚠️  Fund the wallet with USDC on Base to enable payments:')
  console.log(`   Send USDC to: ${address}`)
  console.log('   Network: Base (chain ID 8453)')
  console.log('   Token: USDC (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)')

} catch (err) {
  console.error('❌ Failed to create wallet:', err.message)
  if (err.message.includes('Unauthorized') || err.message.includes('403')) {
    console.error('')
    console.error('Check that your CDP API key has Wallet:Create permissions')
  }
  process.exit(1)
}
