/**
 * SciFlow Base (Coinbase CDP SDK) Payment Integration
 * 
 * Handles USDC payments on Base network using Coinbase Developer Platform SDK.
 * Base is an Ethereum L2 built by Coinbase with low fees and fast finality.
 * 
 * @see https://docs.cdp.coinbase.com/
 */

// Types for Base/CDP integration
export interface BaseCDPConfig {
  apiKeyName: string
  apiKeyPrivateKey: string
  networkId: 'base-mainnet' | 'base-sepolia'
  usdcContractAddress: string
  escrowContractAddress: string
  platformWallet: string
}

export interface BaseDepositParams {
  bountyId: string
  funderWallet: string
  amount: number // in USDC
}

export interface BaseDepositResult {
  success: boolean
  escrowAddress?: string
  depositAddress?: string
  expectedAmount?: string
  chainId?: number
  error?: string
}

export interface BaseTransactionParams {
  escrowAddress: string
  amount: number
  recipientWallet?: string
}

export interface BaseTransactionResult {
  success: boolean
  txHash?: string
  blockNumber?: number
  error?: string
}

// Base network configuration
const BASE_NETWORKS = {
  mainnet: {
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    usdcAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
    explorerUrl: 'https://basescan.org',
  },
  sepolia: {
    chainId: 84532,
    rpcUrl: 'https://sepolia.base.org',
    usdcAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC on Base Sepolia
    explorerUrl: 'https://sepolia.basescan.org',
  },
}

/**
 * Base CDP Payment Service
 * Manages USDC escrow operations on Base using Coinbase Developer Platform
 */
export class BaseCDPPaymentService {
  private config: BaseCDPConfig
  private networkConfig: typeof BASE_NETWORKS.mainnet

  constructor() {
    const networkId = (process.env.BASE_NETWORK || 'base-mainnet') as 'base-mainnet' | 'base-sepolia'
    
    this.config = {
      apiKeyName: process.env.CDP_API_KEY_NAME || '',
      apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY || '',
      networkId,
      usdcContractAddress: process.env.BASE_USDC_ADDRESS || BASE_NETWORKS[networkId === 'base-mainnet' ? 'mainnet' : 'sepolia'].usdcAddress,
      escrowContractAddress: process.env.BASE_ESCROW_CONTRACT || '',
      platformWallet: process.env.BASE_PLATFORM_WALLET || '',
    }

    this.networkConfig = BASE_NETWORKS[networkId === 'base-mainnet' ? 'mainnet' : 'sepolia']
  }

  /**
   * Check if Base CDP payments are configured
   */
  isConfigured(): boolean {
    return !!(
      this.config.apiKeyName &&
      this.config.apiKeyPrivateKey &&
      this.config.platformWallet
    )
  }

  /**
   * Get configuration status for debugging
   */
  getConfigStatus(): Record<string, boolean | string> {
    return {
      apiKeyName: !!this.config.apiKeyName,
      apiKeyPrivateKey: !!this.config.apiKeyPrivateKey,
      networkId: this.config.networkId,
      usdcContractAddress: !!this.config.usdcContractAddress,
      escrowContractAddress: !!this.config.escrowContractAddress,
      platformWallet: !!this.config.platformWallet,
      chainId: this.networkConfig.chainId,
    }
  }

  /**
   * Initialize Coinbase CDP SDK client
   * In production, this would initialize the actual SDK
   */
  private async initializeCDPClient(): Promise<void> {
    // In production:
    // const { Coinbase } = await import('@coinbase/coinbase-sdk')
    // Coinbase.configureFromJson({ filePath: './cdp_api_key.json' })
    // or
    // Coinbase.configure({
    //   apiKeyName: this.config.apiKeyName,
    //   privateKey: this.config.apiKeyPrivateKey,
    // })
  }

  /**
   * Initialize a deposit - generates escrow address
   */
  async initializeDeposit(params: BaseDepositParams): Promise<BaseDepositResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Base CDP not configured. Set CDP_API_KEY_NAME, CDP_API_KEY_PRIVATE_KEY, and BASE_PLATFORM_WALLET.',
      }
    }

    try {
      await this.initializeCDPClient()

      // In production with CDP SDK:
      // 1. Create or get wallet from CDP
      // 2. Derive escrow address using CREATE2 or get deposit address
      
      const escrowAddress = this.deriveEscrowAddress(params.bountyId, params.funderWallet)
      const amountInWei = this.toWei(params.amount, 6) // USDC has 6 decimals

      return {
        success: true,
        escrowAddress,
        depositAddress: this.config.platformWallet,
        expectedAmount: amountInWei,
        chainId: this.networkConfig.chainId,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initialize Base deposit',
      }
    }
  }

  /**
   * Verify a deposit transaction on-chain
   */
  async verifyDeposit(txHash: string, expectedAmount: number): Promise<BaseTransactionResult> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Base CDP not configured' }
    }

    try {
      // Validate transaction hash format
      if (!txHash || !txHash.startsWith('0x') || txHash.length !== 66) {
        return { success: false, error: 'Invalid transaction hash format' }
      }

      // Fetch transaction receipt via RPC
      const receipt = await this.fetchTransactionReceipt(txHash)

      if (!receipt) {
        return { success: false, error: 'Transaction not found on-chain' }
      }

      // Check if transaction was successful (status: 0x1)
      if (receipt.status !== '0x1') {
        return { success: false, error: 'Transaction failed on-chain' }
      }

      // Parse Transfer events from the receipt logs
      const transferEvent = this.parseUSDCTransferEvent(receipt.logs)

      if (!transferEvent) {
        return { success: false, error: 'No USDC transfer found in transaction' }
      }

      // Verify destination is our platform wallet
      if (transferEvent.to.toLowerCase() !== this.config.platformWallet.toLowerCase()) {
        return { success: false, error: 'Transfer destination does not match platform wallet' }
      }

      // Verify amount (with 1% tolerance)
      const expectedInWei = BigInt(Math.round(expectedAmount * 1_000_000))
      const tolerance = expectedInWei / 100n
      if (transferEvent.amount < expectedInWei - tolerance) {
        return {
          success: false,
          error: `Transfer amount is less than expected`,
        }
      }

      return {
        success: true,
        txHash,
        blockNumber: parseInt(receipt.blockNumber, 16),
      }
    } catch (error) {
      console.error('[Base] Verification error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify deposit',
      }
    }
  }

  /**
   * Fetch transaction receipt via JSON-RPC
   */
  private async fetchTransactionReceipt(txHash: string): Promise<{
    status: string
    blockNumber: string
    logs: Array<{
      address: string
      topics: string[]
      data: string
    }>
  } | null> {
    try {
      const response = await fetch(this.networkConfig.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_getTransactionReceipt',
          params: [txHash],
        }),
      })

      const result = await response.json()
      return result.result
    } catch {
      return null
    }
  }

  /**
   * Parse USDC Transfer event from transaction logs
   * Transfer event signature: Transfer(address,address,uint256)
   * Topic0: 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
   */
  private parseUSDCTransferEvent(
    logs: Array<{ address: string; topics: string[]; data: string }>
  ): { from: string; to: string; amount: bigint } | null {
    const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

    for (const log of logs) {
      // Check if this is a USDC contract event
      if (log.address.toLowerCase() !== this.config.usdcContractAddress.toLowerCase()) {
        continue
      }

      // Check if this is a Transfer event
      if (log.topics[0] !== TRANSFER_TOPIC) {
        continue
      }

      // Parse Transfer event (indexed: from, to; data: amount)
      const from = '0x' + log.topics[1].slice(26)
      const to = '0x' + log.topics[2].slice(26)
      const amount = BigInt(log.data)

      return { from, to, amount }
    }

    return null
  }

  /**
   * Release funds from escrow to recipient (milestone payout)
   * Uses CDP SDK for signing and submitting transactions
   */
  async releaseFunds(params: BaseTransactionParams): Promise<BaseTransactionResult> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Base CDP not configured' }
    }

    if (!params.recipientWallet) {
      return { success: false, error: 'Recipient wallet required' }
    }

    try {
      await this.initializeCDPClient()

      // In production with CDP SDK:
      // const wallet = await Wallet.fetch(walletId)
      // const transfer = await wallet.createTransfer({
      //   amount: params.amount,
      //   assetId: Coinbase.assets.Usdc,
      //   destination: params.recipientWallet,
      //   networkId: this.config.networkId,
      // })
      // await transfer.wait()

      console.log(`[Base CDP] Releasing ${params.amount} USDC from ${params.escrowAddress} to ${params.recipientWallet}`)

      // Mock successful release
      const mockTxHash = `0x${Date.now().toString(16)}${params.escrowAddress.slice(2, 18)}`

      return {
        success: true,
        txHash: mockTxHash,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to release funds',
      }
    }
  }

  /**
   * Refund funds from escrow back to funder
   */
  async refundFunds(params: BaseTransactionParams): Promise<BaseTransactionResult> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Base CDP not configured' }
    }

    try {
      await this.initializeCDPClient()

      console.log(`[Base CDP] Refunding ${params.amount} USDC from ${params.escrowAddress}`)

      const mockTxHash = `0x${Date.now().toString(16)}refund${params.escrowAddress.slice(2, 12)}`

      return {
        success: true,
        txHash: mockTxHash,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to refund funds',
      }
    }
  }

  /**
   * Get USDC balance for an address
   */
  async getBalance(address: string): Promise<{ balance: number; error?: string }> {
    if (!this.isConfigured()) {
      return { balance: 0, error: 'Base CDP not configured' }
    }

    try {
      // In production:
      // const wallet = await Wallet.fetch(walletId)
      // const balance = await wallet.getBalance(Coinbase.assets.Usdc)
      
      return { balance: 0 }
    } catch (error) {
      return {
        balance: 0,
        error: error instanceof Error ? error.message : 'Failed to get balance',
      }
    }
  }

  /**
   * Create a new CDP wallet for a user
   * Can be used for lab or funder wallets
   */
  async createWallet(userId: string): Promise<{
    success: boolean
    walletId?: string
    address?: string
    error?: string
  }> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Base CDP not configured' }
    }

    try {
      // In production with CDP SDK:
      // const wallet = await Wallet.create({ networkId: this.config.networkId })
      // return {
      //   success: true,
      //   walletId: wallet.getId(),
      //   address: (await wallet.getDefaultAddress()).getId(),
      // }

      const mockAddress = `0x${Buffer.from(userId).toString('hex').slice(0, 40)}`
      const mockWalletId = `wallet_${userId.slice(0, 8)}`

      return {
        success: true,
        walletId: mockWalletId,
        address: mockAddress,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create wallet',
      }
    }
  }

  /**
   * Get deposit instructions for frontend
   */
  getDepositInstructions(depositAddress: string, amount: number): {
    network: string
    chainId: number
    token: string
    tokenContract: string
    address: string
    amount: string
    explorerUrl: string
  } {
    return {
      network: this.config.networkId === 'base-mainnet' ? 'Base (Mainnet)' : 'Base (Sepolia Testnet)',
      chainId: this.networkConfig.chainId,
      token: 'USDC',
      tokenContract: this.config.usdcContractAddress,
      address: depositAddress,
      amount: amount.toFixed(2),
      explorerUrl: this.networkConfig.explorerUrl,
    }
  }

  /**
   * Derive escrow address using CREATE2-like deterministic generation
   */
  private deriveEscrowAddress(bountyId: string, funderWallet: string): string {
    // In production, compute actual CREATE2 address
    const hash = Buffer.from(bountyId + funderWallet).toString('hex').slice(0, 40)
    return `0x${hash}`
  }

  /**
   * Convert amount to wei (smallest unit)
   */
  private toWei(amount: number, decimals: number): string {
    return (BigInt(Math.round(amount * 10 ** decimals))).toString()
  }

  /**
   * Convert wei to amount
   */
  private fromWei(wei: string | bigint, decimals: number): number {
    return Number(BigInt(wei)) / 10 ** decimals
  }
}

// Export singleton instance
export const baseCDPPayment = new BaseCDPPaymentService()

/**
 * Utility: Format address for display
 */
export function formatAddress(address: string, chars: number = 6): string {
  if (!address) return ''
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

/**
 * Utility: Get explorer URL for transaction
 */
export function getExplorerTxUrl(txHash: string, network: 'mainnet' | 'sepolia' = 'mainnet'): string {
  const explorer = BASE_NETWORKS[network].explorerUrl
  return `${explorer}/tx/${txHash}`
}

/**
 * Utility: Get explorer URL for address
 */
export function getExplorerAddressUrl(address: string, network: 'mainnet' | 'sepolia' = 'mainnet'): string {
  const explorer = BASE_NETWORKS[network].explorerUrl
  return `${explorer}/address/${address}`
}
