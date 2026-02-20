import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { z } from 'zod'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' })
  : null

const createStripeFundingSchema = z.object({
  bounty_id: z.string().uuid(),
  currency: z.string().optional(),
})

// POST /api/payments/stripe - Create payment intent for bounty funding
export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = createStripeFundingSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
    }

    const { bounty_id } = validationResult.data

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

    if (bounty.state !== 'ready_for_funding') {
      return NextResponse.json(
        { error: 'Bounty must be admin-approved and ready_for_funding before payment.' },
        { status: 400 }
      )
    }

    if (bounty.currency !== 'USD') {
      return NextResponse.json({ error: 'Stripe funding is only available for USD bounties.' }, { status: 400 })
    }

    const platformFeePercent = Number(process.env.PLATFORM_FEE_PERCENTAGE || '5')
    const baseAmount = Number(bounty.total_budget)
    const platformFee = (baseAmount * platformFeePercent) / 100
    const totalAmount = Number((baseAmount + platformFee).toFixed(2))

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: 'usd',
      capture_method: 'manual',
      metadata: {
        bounty_id: bounty.id,
        user_id: user.id,
        platform_fee: platformFee.toString(),
        original_amount: baseAmount.toString(),
      },
      description: `SciFlow Bounty: ${bounty.title}`,
    })

    const { error: escrowError } = await supabase.from('escrows').upsert({
      bounty_id: bounty.id,
      payment_method: 'stripe',
      stripe_payment_intent_id: paymentIntent.id,
      total_amount: totalAmount,
      currency: 'USD',
      status: 'pending',
    })

    if (escrowError) {
      await stripe.paymentIntents.cancel(paymentIntent.id)
      return NextResponse.json({ error: 'Failed to create escrow record' }, { status: 500 })
    }

    await supabase
      .from('bounties')
      .update({
        state: 'funding_escrow',
        payment_method: 'stripe',
      })
      .eq('id', bounty.id)

    await supabase.from('activity_logs').insert({
      user_id: user.id,
      bounty_id: bounty.id,
      action: 'payment_initiated',
      details: {
        payment_method: 'stripe',
        amount: totalAmount,
        payment_intent_id: paymentIntent.id,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalAmount,
      platformFee,
      note: 'Authorize the payment intent client-side; bounty goes live after capturable funds are confirmed.',
    })
  } catch (error) {
    console.error('Error in POST /api/payments/stripe:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/payments/stripe - Get payment status
export async function GET(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const paymentIntentId = searchParams.get('payment_intent_id')
    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Missing payment_intent_id' }, { status: 400 })
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    return NextResponse.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
    })
  } catch (error) {
    console.error('Error in GET /api/payments/stripe:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
