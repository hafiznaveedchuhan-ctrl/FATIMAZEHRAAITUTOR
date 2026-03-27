import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16' as any,
  })
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
  }

  const { session_id } = await req.json()
  if (!session_id) {
    return NextResponse.json({ detail: 'Missing session_id' }, { status: 400 })
  }

  try {
    // Verify with Stripe that checkout was paid
    const session = await getStripe().checkout.sessions.retrieve(session_id)
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ detail: 'Payment not completed' }, { status: 400 })
    }

    const plan = session.metadata?.plan
    if (!plan) {
      return NextResponse.json({ detail: 'No plan in session metadata' }, { status: 400 })
    }

    // Tell backend to upgrade this user's tier
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const res = await fetch(`${backendUrl}/payment/activate-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.accessToken}`,
      },
      body: JSON.stringify({ plan, stripe_session_id: session_id }),
    })

    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json({ detail: data.detail || 'Failed to activate plan' }, { status: res.status })
    }

    return NextResponse.json({ plan, status: 'activated' })
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || 'Stripe error' }, { status: 500 })
  }
}
