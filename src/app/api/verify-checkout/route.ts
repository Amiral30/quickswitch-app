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

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('session_id')
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID manquant' }, { status: 400 })
    }

    // Récupérer la session Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status === 'paid') {
      const userId = session.metadata?.supabase_uid
      const subscriptionId = session.subscription as string

      if (userId) {
        // Valider l'upgrade instantanément en base (utile en dev local et comme garantie anti-fail webhook)
        await supabaseAdmin
          .from('profiles')
          .update({
            tier: 'PRO',
            stripe_subscription_id: subscriptionId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)

        return NextResponse.json({ success: true, tier: 'PRO' })
      }
    }

    return NextResponse.json({ success: false, status: session.payment_status })
  } catch (err: any) {
    console.error('Verify checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
