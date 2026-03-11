import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { BitsoClient } from '@/lib/exchanges/bitso';

// ─── Crypto helpers ──────────────────────────────────────────────────────────

function decrypt(encryptedJson: string): string {
  const key = (process.env.ENCRYPTION_KEY || 'eelienx-dev-key-32chars-padded!!').slice(0, 32);
  const keyBuffer = Buffer.from(key, 'utf-8');
  const { iv, encrypted, authTag } = JSON.parse(encryptedJson);
  const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function loadConnections(): Record<string, any> {
  const filePath = path.join(process.cwd(), 'data', 'connections.json');
  if (!fs.existsSync(filePath)) return {};
  try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')); } catch { return {}; }
}

// ─── Book mapping ────────────────────────────────────────────────────────────

const SYMBOL_TO_BOOK: Record<string, string> = {
  BTC: 'btc_mxn',
  ETH: 'eth_mxn',
  SOL: 'sol_mxn',
  BNB: 'bnb_mxn',
  DOGE: 'doge_mxn',
  XRP: 'xrp_mxn',
  ADA: 'ada_mxn',
  AVAX: 'avax_mxn',
  MATIC: 'matic_mxn',
  USDT: 'usdt_mxn',
};

// ─── Route ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, exchange = 'bitso', symbol, amountMXN, amountCrypto } = body;

    // Load & decrypt credentials
    const connections = loadConnections();
    const conn = connections[exchange];

    if (!conn?.apiKey || !conn?.apiSecret) {
      return NextResponse.json({
        success: false,
        message: `No hay cuenta de ${exchange} conectada. Conéctala primero desde el chat.`,
      });
    }

    const apiKey = decrypt(conn.apiKey);
    const apiSecret = decrypt(conn.apiSecret);
    const client = new BitsoClient({ apiKey, apiSecret });

    // ── Balance ──────────────────────────────────────────────────────────────
    if (action === 'balance') {
      const balances = await client.getBalance();
      return NextResponse.json({ success: true, balances });
    }

    // ── Buy ──────────────────────────────────────────────────────────────────
    if (action === 'buy') {
      if (!symbol || !amountMXN) {
        return NextResponse.json({ success: false, message: 'Se requiere symbol y amountMXN' });
      }

      const book = SYMBOL_TO_BOOK[symbol.toUpperCase()];
      if (!book) {
        return NextResponse.json({ success: false, message: `No soportamos ${symbol} en Bitso todavía` });
      }

      // Get current price in MXN
      const ticker = await client.getTicker(book);
      const priceMXN = parseFloat(ticker.last);
      const cryptoAmount = (amountMXN / priceMXN).toFixed(8);

      // Place market buy order
      const order = await client.placeOrder(book, 'buy', 'market', cryptoAmount);

      return NextResponse.json({
        success: true,
        order,
        summary: {
          symbol: symbol.toUpperCase(),
          amountMXN,
          priceMXN,
          cryptoBought: parseFloat(cryptoAmount),
          book,
        },
      });
    }

    // ── Sell ─────────────────────────────────────────────────────────────────
    if (action === 'sell') {
      if (!symbol || !amountCrypto) {
        return NextResponse.json({ success: false, message: 'Se requiere symbol y amountCrypto' });
      }

      const book = SYMBOL_TO_BOOK[symbol.toUpperCase()];
      if (!book) {
        return NextResponse.json({ success: false, message: `No soportamos ${symbol} en Bitso todavía` });
      }

      const ticker = await client.getTicker(book);
      const priceMXN = parseFloat(ticker.last);
      const order = await client.placeOrder(book, 'sell', 'market', amountCrypto.toString());

      return NextResponse.json({
        success: true,
        order,
        summary: {
          symbol: symbol.toUpperCase(),
          amountCrypto,
          priceMXN,
          mxnReceived: (amountCrypto * priceMXN).toFixed(2),
          book,
        },
      });
    }

    return NextResponse.json({ success: false, message: `Acción desconocida: ${action}` });
  } catch (err: any) {
    console.error('agent-action error:', err);
    return NextResponse.json({ success: false, message: err.message || 'Error interno' });
  }
}
