/**
 * SciFlow AgentKit Integration
 * 
 * The SciFlow AI agent has its own CDP Server Wallet on Base via AgentKit.
 * On-chain capabilities: check balance, send USDC, fund escrow, pay labs.
 * 
 * @see https://docs.cdp.coinbase.com/agent-kit/welcome
 */

let _agentAddress: string | null = null

export function getAgentWalletAddress(): string | null {
  return _agentAddress
}

/**
 * Get AgentKit Vercel AI SDK tools.
 * Uses dynamic import for ESM-only AgentKit packages.
 * Returns empty object if CDP keys not configured.
 */
export async function getAgentTools(): Promise<Record<string, unknown>> {
  const apiKeyName = process.env.CDP_API_KEY_NAME
  const apiKeyPrivateKey = process.env.CDP_API_KEY_PRIVATE_KEY

  if (!apiKeyName || !apiKeyPrivateKey) {
    return {}
  }

  try {
    const [{ CdpWalletProvider, AgentKit }, { getVercelAITools }] = await Promise.all([
      import('@coinbase/agentkit'),
      import('@coinbase/agentkit-vercel-ai-sdk'),
    ])

    const walletProvider = await CdpWalletProvider.configureWithWallet({
      apiKeyName,
      apiKeyPrivateKey: apiKeyPrivateKey.replace(/\\n/g, '\n'),
      networkId: 'base-mainnet',
      ...(process.env.AGENT_WALLET_DATA ? { cdpWalletData: process.env.AGENT_WALLET_DATA } : {}),
    })

    _agentAddress = await walletProvider.getAddress()

    const agentKit = await AgentKit.from({
      walletProvider,
      actionProviders: [],
    })

    return getVercelAITools(agentKit) as Record<string, unknown>
  } catch (err) {
    console.error('[AgentKit] Failed to initialize:', err)
    return {}
  }
}
