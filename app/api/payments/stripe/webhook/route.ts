import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' })
  : null

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

async function markEscrowFunded(paymentIntent: Stripe.PaymentIntent) {
  const bountyId = paymentIntent.metadata.bounty_id
  const userId = paymentIntent.metadata.user_id

  if (!bountyId || !userId) return

  const supabase = createAdminClient()

  await supabase
    .from('escrows')
    .update({
      status: 'locked',
      locked_at: new Date().toISOString(),
      stripe_payment_intent_id: paymentIntent.id,
    })
    .eq('stripe_payment_intent_id', paymentIntent.id)

  await supabase
    .from('bounties')
    .update({
      state: 'bidding',
      funded_at: new Date().toISOString(),
      payment_method: 'stripe',
    })
    .eq('id', bountyId)

  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'payment_received',
    title: 'Bounty Funded Successfully',
    message: 'Escrow funds are secured and your bounty is now live for proposals.',
    data: { bounty_id: bountyId, payment_intent_id: paymentIntent.id },
  })

  await supabase.from('activity_logs').insert({
    user_id: userId,
    bounty_id: bountyId,
    action: 'payment_completed',
    details: {
      payment_method: 'stripe',
      payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      status: paymentIntent.status,
    },
  })
}

// POST /api/payments/stripe/webhook - Handle Stripe webhooks
export async function POST(request: NextRequest) {
  try {
    if (!stripe || !webhookSecret) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
    }

    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    switch (event.type) {
      case 'payment_intent.amount_capturable_updated': {
        await markEscrowFunded(event.data.object as Stripe.PaymentIntent)
        break
      }

      case 'payment_intent.succeeded': {
        // Keep this for compatibility in case capture happens immediately.
        await markEscrowFunded(event.data.object as Stripe.PaymentIntent)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const supabase = createAdminClient()

        await supabase
          .from('escrows')
          .update({ status: 'pending' })
          .eq('stripe_payment_intent_id', paymentIntent.id)

        if (paymentIntent.metadata.user_id) {
          await supabase.from('notifications').insert({
            user_id: paymentIntent.metadata.user_id,
            type: 'system',
            title: 'Payment Failed',
            message: 'Your payment authorization failed. Please retry funding.',
            data: { bounty_id: paymentIntent.metadata.bounty_id || null },
          })
        }
        break
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const supabase = createAdminClient()
        await supabase
          .from('escrows')
          .update({ status: 'refunded' })
          .eq('stripe_payment_intent_id', paymentIntent.id)
        break
      }

      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error in Stripe webhook:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
