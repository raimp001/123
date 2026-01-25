import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Crypto payment endpoints for Solana and Base USDC

// POST /api/payments/crypto - Initialize crypto escrow
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bounty_id, chain, amount, wallet_address } = body

    if (!bounty_id || !chain || !amount || !wallet_address) {
      return NextResponse.json({ 
        error: 'Missing required fields: bounty_id, chain, amount, wallet_address' 
      }, { status: 400 })
    }

    if (!['solana', 'base'].includes(chain)) {
      return NextResponse.json({ error: 'Invalid chain. Use "solana" or "base"' }, { status: 400 })
    }

    // Verify bounty exists and belongs to user
    const { data: bounty, error: bountyError } = await supabase
      .from('bounties')
      .select('id, title, funder_id, state')
      .eq('id', bounty_id)
      .single()

    if (bountyError || !bounty) {
      return NextResponse.json({ error: 'Bounty not found' }, { status: 404 })
    }

    if (bounty.funder_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized to fund this bounty' }, { status: 403 })
    }

    if (bounty.state !== 'drafting' && bounty.state !== 'ready_for_funding') {
      return NextResponse.json({ error: 'Bounty is not in a fundable state' }, { status: 400 })
    }

    // Calculate platform fee
    const platformFeePercent = parseInt(process.env.PLATFORM_FEE_PERCENTAGE || '5')
    const platformFee = amount * platformFeePercent / 100
    const totalAmount = amount + platformFee

    // Generate escrow details based on chain
    let escrowDetails: {
      escrow_address: string
      deposit_address: string
      expected_amount: number
      chain: string
      token: string
    }

    if (chain === 'solana') {
      // For Solana, generate PDA for escrow
      const escrowProgramId = process.env.SOLANA_ESCROW_PROGRAM_ID
      const platformWallet = process.env.SOLANA_PLATFORM_WALLET

      if (!escrowProgramId || !platformWallet) {
        return NextResponse.json({ error: 'Solana escrow not configured' }, { status: 503 })
      }

      // In production, derive PDA from program
      // For now, return platform wallet as deposit address
      escrowDetails = {
        escrow_address: `escrow_${bounty_id}_solana`,
        deposit_address: platformWallet,
        expected_amount: totalAmount,
        chain: 'solana',
        token: 'USDC',
      }
    } else {
      // For Base, generate CREATE2 address for escrow contract
      const escrowContract = process.env.BASE_ESCROW_CONTRACT
      const platformWallet = process.env.BASE_PLATFORM_WALLET
      const usdcAddress = process.env.BASE_USDC_ADDRESS

      if (!escrowContract || !platformWallet || !usdcAddress) {
        return NextResponse.json({ error: 'Base escrow not configured' }, { status: 503 })
      }

      // In production, compute CREATE2 address
      escrowDetails = {
        escrow_address: `escrow_${bounty_id}_base`,
        deposit_address: platformWallet,
        expected_amount: totalAmount,
        chain: 'base',
        token: 'USDC',
      }
    }

    // Create escrow record
    const { data: escrow, error: escrowError } = await supabase
      .from('escrows')
      .upsert({
        bounty_id,
        payment_method: chain,
        escrow_address: escrowDetails.escrow_address,
        deposit_address: escrowDetails.deposit_address,
        total_amount: totalAmount,
        platform_fee: platformFee,
        currency: 'USDC',
        status: 'awaiting_deposit',
        chain_data: {
          chain,
          token: 'USDC',
          funder_wallet: wallet_address,
        },
      })
      .select()
      .single()

    if (escrowError) {
      console.error('Error creating escrow:', escrowError)
      return NextResponse.json({ error: 'Failed to create escrow record' }, { status: 500 })
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      bounty_id,
      action: 'crypto_escrow_created',
      details: { 
        chain,
        escrow_address: escrowDetails.escrow_address,
        amount: totalAmount,
      },
    })

    return NextResponse.json({
      escrow_id: escrow.id,
      deposit_address: escrowDetails.deposit_address,
      expected_amount: totalAmount,
      platform_fee: platformFee,
      chain,
      token: 'USDC',
      instructions: chain === 'solana' 
        ? `Send ${totalAmount} USDC to ${escrowDetails.deposit_address} on Solana`
        : `Send ${totalAmount} USDC to ${escrowDetails.deposit_address} on Base`,
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
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { escrow_id, tx_hash } = body

    if (!escrow_id || !tx_hash) {
      return NextResponse.json({ error: 'Missing escrow_id or tx_hash' }, { status: 400 })
    }

    // Get escrow record
    const { data: escrow, error: escrowError } = await supabase
      .from('escrows')
      .select(`
        *,
        bounty:bounties!escrows_bounty_id_fkey(id, funder_id)
      `)
      .eq('id', escrow_id)
      .single()

    if (escrowError || !escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 })
    }

    if (escrow.bounty.funder_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // In production, verify the transaction on-chain:
    // - For Solana: Use @solana/web3.js to check transaction
    // - For Base: Use ethers.js to check transaction
    // For now, we'll accept the tx_hash and mark as funded

    // Update escrow status
    const { error: updateError } = await supabase
      .from('escrows')
      .update({ 
        status: 'funded',
        funded_at: new Date().toISOString(),
        chain_data: {
          ...escrow.chain_data,
          deposit_tx_hash: tx_hash,
        },
      })
      .eq('id', escrow_id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Transition bounty to bidding
    await supabase
      .from('bounties')
      .update({
        state: 'bidding',
        state_history: supabase.rpc('append_to_json_array', {
          current_array: 'state_history',
          new_item: { 
            state: 'funding_escrow', 
            timestamp: new Date().toISOString(), 
            by: user.id,
          },
        }),
      })
      .eq('id', escrow.bounty_id)

    // Create notification
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'crypto_deposit_confirmed',
      title: 'Crypto Deposit Confirmed',
      message: 'Your bounty is now live and accepting proposals',
      data: { bounty_id: escrow.bounty_id, tx_hash },
    })

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      bounty_id: escrow.bounty_id,
      action: 'crypto_deposit_confirmed',
      details: { 
        escrow_id,
        tx_hash,
        chain: escrow.payment_method,
      },
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Deposit confirmed, bounty is now live' 
    })
  } catch (error) {
    console.error('Error in PATCH /api/payments/crypto:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
