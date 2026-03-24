import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

const TIER_PRICES: Record<string, string> = {
  premium: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium',
  pro: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
  }

  const { plan } = await req.json()
  if (!plan || !['premium', 'pro'].includes(plan)) {
    return NextResponse.json({ detail: 'Invalid plan' }, { status: 400 })
  }

  try {
    // Proxy to FastAPI backend (server-to-server — no CORS issue)
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const res = await fetch(`${backendUrl}/payment/create-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.accessToken}`,
      },
      body: JSON.stringify({ plan }),
    })

    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json({ detail: data.detail || 'Failed to create session' }, { status: res.status })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ detail: 'Server error' }, { status: 500 })
  }
}
