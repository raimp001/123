import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { solanaPayment } from '@/lib/payments/solana'
import { baseCDPPayment, getExplorerTxUrl } from '@/lib/payments/base-cdp'

const createCryptoEscrowSchema = z.object({
  bounty_id: z.string().uuid(),
  chain: z.enum(['solana', 'base']),
  wallet_address: z.string().min(20),
})

const confirmCryptoEscrowSchema = z.object({
  escrow_id: z.string().uuid(),
  tx_hash: z.string().min(16),
})

function getPaymentMethod(chain: 'solana' | 'base') {
  return chain === 'solana' ? 'solana_usdc' : 'base_usdc'
}

function isBountyFundable(state: string) {
  return state === 'ready_for_funding' || state === 'funding_escrow'
}

// GET /api/payments/crypto/status - Check payment service status
export async function GET() {
  return NextResponse.json({
    solana: {
      configured: solanaPayment.isConfigured(),
      status: solanaPayment.getConfigStatus(),
    },
    base: {
      configured: baseCDPPayment.isConfigured(),
      status: baseCDPPayment.getConfigStatus(),
    },
    supported_chains: ['solana', 'base'],
    token: 'USDC',
  })
}

// POST /api/payments/crypto - Initialize crypto escrow
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = createCryptoEscrowSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
    }

    const { bounty_id, chain, wallet_address } = validationResult.data

    const { data: bounty, error: bountyError } = await supabase
      .from('bounties')
      .select('id, title, funder_id, state, total_budget, currency')
      .eq('id', bounty_id)
      .single()

    if (bountyError || !bounty) {
      return NextResponse.json({ error: 'Bounty not found' }, { status: 404 })
    }

    if (bounty.funder_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized to fund this bounty' }, { status: 403 })
    }

    if (!isBountyFundable(bounty.state)) {
      return NextResponse.json({ error: 'Bounty is not in a fundable state' }, { status: 400 })
    }

    if (bounty.currency !== 'USDC') {
      return NextResponse.json({ error: 'Crypto funding requires bounty currency USDC' }, { status: 400 })
    }

    const platformFeePercent = Number(process.env.PLATFORM_FEE_PERCENTAGE || '5')
    const bountyAmount = Number(bounty.total_budget)
    const platformFee = (bountyAmount * platformFeePercent) / 100
    const totalAmount = Number((bountyAmount + platformFee).toFixed(6))

    let escrowAddress: string
    let instructions: Record<string, unknown>

    if (chain === 'solana') {
      const result = await solanaPayment.initializeDeposit({
        bountyId: bounty_id,
        funderWallet: wallet_address,
        amount: totalAmount,
      })

      if (!result.success || !result.escrowPDA || !result.depositAddress || !result.expectedAmount) {
        return NextResponse.json({ error: result.error || 'Unable to initialize Solana escrow' }, { status: 503 })
      }

      escrowAddress = result.escrowPDA
      instructions = solanaPayment.getDepositInstructions(result.depositAddress, result.expectedAmount)
    } else {
      const result = await baseCDPPayment.initializeDeposit({
        bountyId: bounty_id,
        funderWallet: wallet_address,
        amount: totalAmount,
      })

      if (!result.success || !result.escrowAddress || !result.depositAddress) {
        return NextResponse.json({ error: result.error || 'Unable to initialize Base escrow' }, { status: 503 })
      }

      escrowAddress = result.escrowAddress
      instructions = baseCDPPayment.getDepositInstructions(result.depositAddress, totalAmount)
    }

    const upsertPayload =
      chain === 'solana'
        ? {
            bounty_id,
            payment_method: getPaymentMethod(chain),
            total_amount: totalAmount,
            currency: 'USDC' as const,
            status: 'pending' as const,
            solana_escrow_pda: escrowAddress,
            base_contract_address: null,
          }
        : {
            bounty_id,
            payment_method: getPaymentMethod(chain),
            total_amount: totalAmount,
            currency: 'USDC' as const,
            status: 'pending' as const,
            solana_escrow_pda: null,
            base_contract_address: escrowAddress,
          }

    const { data: escrow, error: escrowError } = await supabase
      .from('escrows')
      .upsert(upsertPayload, { onConflict: 'bounty_id' })
      .select('*')
      .single()

    if (escrowError || !escrow) {
      return NextResponse.json({ error: 'Failed to create escrow record' }, { status: 500 })
    }

    await supabase
      .from('bounties')
      .update({
        payment_method: getPaymentMethod(chain),
        state: 'funding_escrow',
      })
      .eq('id', bounty_id)

    await supabase.from('activity_logs').insert({
      user_id: user.id,
      bounty_id,
      action: 'crypto_escrow_created',
      details: {
        chain,
        payment_method: getPaymentMethod(chain),
        escrow_address: escrowAddress,
        amount: totalAmount,
        platform_fee: platformFee,
      },
    })

    return NextResponse.json({
      escrow_id: escrow.id,
      escrow_address: escrowAddress,
      expected_amount: totalAmount,
      platform_fee: platformFee,
      chain,
      token: 'USDC',
      instructions,
      status: 'pending_deposit',
    })
  } catch (error) {
    console.error('Error in POST /api/payments/crypto:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/payments/crypto - Verify deposit and confirm escrow
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = confirmCryptoEscrowSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
    }

    const { escrow_id, tx_hash } = validationResult.data

    const { data: escrow, error: escrowError } = await supabase
      .from('escrows')
      .select(`
        *,
        bounty:bounties!escrows_bounty_id_fkey(id, funder_id, state)
      `)
      .eq('id', escrow_id)
      .single()

    if (escrowError || !escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 })
    }

    const escrowBounty = Array.isArray(escrow.bounty) ? escrow.bounty[0] : escrow.bounty
    if (!escrowBounty) {
      return NextResponse.json({ error: 'Linked bounty not found for escrow' }, { status: 404 })
    }

    if (escrowBounty.funder_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    if (escrow.status !== 'pending') {
      return NextResponse.json({ error: `Escrow is already ${escrow.status}` }, { status: 400 })
    }

    const chain = escrow.payment_method === 'solana_usdc' ? 'solana' : escrow.payment_method === 'base_usdc' ? 'base' : null
    if (!chain) {
      return NextResponse.json({ error: 'Escrow payment method is not crypto' }, { status: 400 })
    }

    const verificationResult =
      chain === 'solana'
        ? await solanaPayment.verifyDeposit(tx_hash, Number(escrow.total_amount))
        : await baseCDPPayment.verifyDeposit(tx_hash, Number(escrow.total_amount))

    if (!verificationResult.success) {
      return NextResponse.json(
        { error: verificationResult.error || 'Transaction verification failed' },
        { status: 400 }
      )
    }

    const explorerUrl =
      chain === 'base'
        ? getExplorerTxUrl(tx_hash, process.env.BASE_NETWORK === 'base-sepolia' ? 'sepolia' : 'mainnet')
        : `https://solscan.io/tx/${tx_hash}`

    const escrowUpdate =
      chain === 'solana'
        ? {
            status: 'locked' as const,
            locked_at: new Date().toISOString(),
            solana_transaction_signature: tx_hash,
          }
        : {
            status: 'locked' as const,
            locked_at: new Date().toISOString(),
            base_transaction_hash: tx_hash,
          }

    const { error: updateError } = await supabase
      .from('escrows')
      .update(escrowUpdate)
      .eq('id', escrow_id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    await supabase
      .from('bounties')
      .update({
        state: 'bidding',
        funded_at: new Date().toISOString(),
      })
      .eq('id', escrowBounty.id)

    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'payment_received',
      title: 'Crypto Deposit Confirmed',
      message: 'Your bounty is now live and accepting proposals.',
      data: {
        bounty_id: escrow.bounty_id,
        tx_hash,
        chain,
        explorer_url: explorerUrl,
      },
    })

    await supabase.from('activity_logs').insert({
      user_id: user.id,
      bounty_id: escrow.bounty_id,
      action: 'crypto_deposit_confirmed',
      details: {
        escrow_id,
        tx_hash,
        chain,
        explorer_url: explorerUrl,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Deposit confirmed. Bounty is now live.',
      tx_hash,
      explorer_url: explorerUrl,
    })
  } catch (error) {
    console.error('Error in PATCH /api/payments/crypto:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
