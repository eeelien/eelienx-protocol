import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { encrypt, decrypt } from '@/lib/crypto';
import { getSession } from '@/lib/session';
import { BitsoClient } from '@/lib/exchanges/bitso';
import { BinanceClient } from '@/lib/exchanges/binance';
import { BybitClient } from '@/lib/exchanges/bybit';
import { detectAndReadWallet } from '@/lib/coldwallet';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });

    const body = await req.json();
    const { exchange } = body;
    const masterKey = Buffer.from(session.masterKey, 'hex');

    if (['bitso', 'binance', 'bybit'].includes(exchange)) {
      const { apiKey, apiSecret } = body;
      if (!apiKey || !apiSecret) return NextResponse.json({ success: false, message: 'API Key y Secret requeridos' });

      let balances: any[] = [];
      try {
        if (exchange === 'bitso') {
          const client = new BitsoClient({ apiKey, apiSecret });
          balances = await client.getBalance();
        } else if (exchange === 'binance') {
          const client = new BinanceClient({ apiKey, apiSecret });
          balances = await client.getBalance();
        } else if (exchange === 'bybit') {
          const client = new BybitClient({ apiKey, apiSecret });
          balances = await client.getBalance();
        }
      } catch (err: any) {
        return NextResponse.json({ success: false, message: `Keys inválidas: ${err.message}` });
      }

      // Cifrar con llave personal del usuario
      const { error } = await supabaseAdmin.from('connections').upsert({
        user_id: session.userId,
        exchange,
        encrypted_api_key: encrypt(apiKey, masterKey),
        encrypted_api_secret: encrypt(apiSecret, masterKey),
        balance_snapshot: balances,
        connected_at: new Date().toISOString(),
      }, { onConflict: 'user_id,exchange' });

      if (error) throw new Error(error.message);
      return NextResponse.json({ success: true, exchange, balances });
    }

    if (['ledger', 'metamask'].includes(exchange)) {
      const { address } = body;
      if (!address) return NextResponse.json({ success: false, message: 'Dirección requerida' });

      let balances: any[] = [];
      try { balances = await detectAndReadWallet(address); } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message });
      }

      await supabaseAdmin.from('connections').upsert({
        user_id: session.userId,
        exchange,
        encrypted_api_key: encrypt(address, masterKey),
        encrypted_api_secret: encrypt('wallet', masterKey),
        balance_snapshot: balances,
        connected_at: new Date().toISOString(),
      }, { onConflict: 'user_id,exchange' });

      return NextResponse.json({ success: true, exchange, balances });
    }

    return NextResponse.json({ success: false, message: 'Exchange no soportado' });
  } catch (err: any) {
    console.error('exchange-connect error:', err);
    return NextResponse.json({ success: false, message: err.message || 'Error interno' });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ connections: {} });

  const { data } = await supabaseAdmin
    .from('connections')
    .select('exchange, balance_snapshot, connected_at')
    .eq('user_id', session.userId);

  const connections = (data || []).reduce((acc, row) => {
    acc[row.exchange] = {
      connectedAt: row.connected_at,
      balanceSnapshot: row.balance_snapshot,
    };
    return acc;
  }, {} as Record<string, any>);

  return NextResponse.json({ connections });
}
