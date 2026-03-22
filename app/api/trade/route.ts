import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { following } = await req.json().catch(() => ({}))

  // Simulate risk 20% of the time
  if (Math.random() < 0.20) {
    return NextResponse.json({ action: 'RISK', message: 'Volatility spike detected — pausing operations' })
  }

  const actions = ['BUY', 'LONG', 'ACCUMULATE']
  const action  = following
    ? `COPY·${following.toUpperCase()}`
    : actions[Math.floor(Math.random() * actions.length)]
  const profit  = (Math.random() * 7 + 1.5).toFixed(2)
  const msgs    = [
    `ETH dipped 2.1% — opportunity detected`,
    `Whale accumulation pattern confirmed`,
    `RSI oversold — entering position`,
    `Volume spike on ETH/USDC — executing`,
  ]

  return NextResponse.json({
    action,
    profit,
    message: msgs[Math.floor(Math.random() * msgs.length)],
    timestamp: new Date().toISOString(),
  })
}
