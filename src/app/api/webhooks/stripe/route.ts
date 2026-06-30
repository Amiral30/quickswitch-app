import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-06-24.dahlia',
})

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  // En mode dev sans webhook secret, on skip la vérification
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event: Stripe.Event

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } else {
      // Mode dev : parsing simple (ne pas utiliser en prod)
      event = JSON.parse(body) as Stripe.Event
    }
  } catch (err: any) {
    console.error('Webhook signature error:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // ── Traitement des événements ──────────────────────────────────────

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.supabase_uid
    const subscriptionId = session.subscription as string

    if (userId) {
      // Passer l'utilisateur en PRO
      await supabaseAdmin
        .from('profiles')
        .update({
          tier: 'PRO',
          stripe_subscription_id: subscriptionId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      console.log(`✅ User ${userId} upgraded to PRO`)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string

    // Retrouver l'utilisateur par son stripe_customer_id
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (profile) {
      // Révoquer le mode PRO
      await supabaseAdmin
        .from('profiles')
        .update({
          tier: 'FREE',
          stripe_subscription_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      console.log(`⬇️ User ${profile.id} downgraded to FREE`)
    }
  }

  return NextResponse.json({ received: true })
}
