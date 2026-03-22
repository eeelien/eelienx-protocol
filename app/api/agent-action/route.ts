import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { decrypt } from '@/lib/crypto';
import { getSession } from '@/lib/session';
import { BitsoClient } from '@/lib/exchanges/bitso';

const SYMBOL_TO_BOOK: Record<string, string> = {
  BTC: 'btc_mxn', ETH: 'eth_mxn', SOL: 'sol_mxn', BNB: 'bnb_mxn',
  DOGE: 'doge_mxn', XRP: 'xrp_mxn', ADA: 'ada_mxn', AVAX: 'avax_mxn',
  MATIC: 'matic_mxn', USDT: 'usdt_mxn',
};

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });

    const body = await req.json();
    const { action, exchange = 'bitso', symbol, amountMXN, amountCrypto } = body;
    const masterKey = Buffer.from(session.masterKey, 'hex');

    // Cargar credenciales del usuario desde Supabase
    const { data: conn } = await supabaseAdmin
      .from('connections')
      .select('encrypted_api_key, encrypted_api_secret')
      .eq('user_id', session.userId)
      .eq('exchange', exchange)
      .single();

    if (!conn) {
      return NextResponse.json({
        success: false,
        message: `No tienes ${exchange} conectado. Conéctalo primero.`,
      });
    }

    const apiKey = decrypt(conn.encrypted_api_key, masterKey);
    const apiSecret = decrypt(conn.encrypted_api_secret, masterKey);
    const client = new BitsoClient({ apiKey, apiSecret });

    if (action === 'balance') {
      const balances = await client.getBalance();
      return NextResponse.json({ success: true, balances });
    }

    if (action === 'buy') {
      if (!symbol || !amountMXN) return NextResponse.json({ success: false, message: 'Faltan symbol y amountMXN' });
      const book = SYMBOL_TO_BOOK[symbol.toUpperCase()];
      if (!book) return NextResponse.json({ success: false, message: `${symbol} no soportado en Bitso` });

      const ticker = await client.getTicker(book);
      const priceMXN = parseFloat(ticker.last);
      const cryptoAmount = (amountMXN / priceMXN).toFixed(8);
      const order = await client.placeOrder(book, 'buy', 'market', cryptoAmount);

      return NextResponse.json({
        success: true, order,
        summary: { symbol: symbol.toUpperCase(), amountMXN, priceMXN, cryptoBought: parseFloat(cryptoAmount), book },
      });
    }

    if (action === 'sell') {
      if (!symbol || !amountCrypto) return NextResponse.json({ success: false, message: 'Faltan symbol y amountCrypto' });
      const book = SYMBOL_TO_BOOK[symbol.toUpperCase()];
      if (!book) return NextResponse.json({ success: false, message: `${symbol} no soportado en Bitso` });

      const ticker = await client.getTicker(book);
      const priceMXN = parseFloat(ticker.last);
      const order = await client.placeOrder(book, 'sell', 'market', amountCrypto.toString());

      return NextResponse.json({
        success: true, order,
        summary: { symbol: symbol.toUpperCase(), amountCrypto, priceMXN, mxnReceived: (amountCrypto * priceMXN).toFixed(2) },
      });
    }

    return NextResponse.json({ success: false, message: `Acción desconocida: ${action}` });
  } catch (err: any) {
    console.error('agent-action error:', err);
    return NextResponse.json({ success: false, message: err.message || 'Error interno' });
  }
}
