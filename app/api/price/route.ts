import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const res = await fetch('https://api.bitso.com/api/v3/ticker/?book=eth_mxn', {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) throw new Error('Bitso error')
    const data = await res.json()
    const p = data.payload
    const last     = parseFloat(p.last)
    const change24 = parseFloat(p.change_24)
    const high     = parseFloat(p.high)
    const low      = parseFloat(p.low)
    const volume   = parseFloat(p.volume)

    return NextResponse.json({ last, change24, high, low, volume, ok: true })
  } catch {
    // Fallback: realistic simulated price
    const base  = 62450
    const noise = (Math.random() - 0.5) * 800
    const chg   = +((Math.random() - 0.45) * 5).toFixed(2)
    return NextResponse.json({ last: base + noise, change24: chg, high: base + 1200, low: base - 900, volume: 142, ok: false })
  }
}
