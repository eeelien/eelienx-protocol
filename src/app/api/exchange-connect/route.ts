import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { BitsoClient } from '@/lib/exchanges/bitso';
import { BinanceClient } from '@/lib/exchanges/binance';
import { BybitClient } from '@/lib/exchanges/bybit';
import { detectAndReadWallet } from '@/lib/coldwallet';

function encrypt(text: string): string {
  const key = (process.env.ENCRYPTION_KEY || 'eelienx-dev-key-32chars-padded!!').slice(0, 32);
  const keyBuffer = Buffer.from(key, 'utf-8');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return JSON.stringify({ iv: iv.toString('hex'), encrypted, authTag });
}

function saveConnection(exchange: string, data: object) {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const existing = loadConnections();
  existing[exchange] = { ...data, connectedAt: new Date().toISOString() };
  fs.writeFileSync(path.join(dataDir, 'connections.json'), JSON.stringify(existing), 'utf-8');
}

function loadConnections(): Record<string, any> {
  const filePath = path.join(process.cwd(), 'data', 'connections.json');
  if (!fs.existsSync(filePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return {};
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { exchange } = body;

    // Exchange connections (Bitso, Binance, Bybit)
    if (['bitso', 'binance', 'bybit'].includes(exchange)) {
      const { apiKey, apiSecret } = body;
      if (!apiKey || !apiSecret) {
        return NextResponse.json({ success: false, message: 'API Key y Secret son requeridos' });
      }

      // Validate keys against the real exchange API
      let valid = false;
      let balances: any[] = [];

      try {
        if (exchange === 'bitso') {
          const client = new BitsoClient({ apiKey, apiSecret });
          balances = await client.getBalance();
          valid = true;
        } else if (exchange === 'binance') {
          const client = new BinanceClient({ apiKey, apiSecret });
          balances = await client.getBalance();
          valid = true;
        } else if (exchange === 'bybit') {
          const client = new BybitClient({ apiKey, apiSecret });
          balances = await client.getBalance();
          valid = true;
        }
      } catch (err: any) {
        return NextResponse.json({ success: false, message: `Keys inválidas: ${err.message}` });
      }

      if (!valid) {
        return NextResponse.json({ success: false, message: 'No se pudo verificar con el exchange' });
      }

      // Save encrypted credentials
      saveConnection(exchange, {
        apiKey: encrypt(apiKey),
        apiSecret: encrypt(apiSecret),
        balanceSnapshot: balances,
      });

      return NextResponse.json({ success: true, exchange, balances });
    }

    // Cold wallet connections (Ledger, MetaMask)
    if (['ledger', 'metamask'].includes(exchange)) {
      const { address } = body;
      if (!address) {
        return NextResponse.json({ success: false, message: 'Dirección pública requerida' });
      }

      let balances: any[] = [];
      try {
        balances = await detectAndReadWallet(address);
      } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message });
      }

      saveConnection(exchange, { address, balanceSnapshot: balances });

      return NextResponse.json({ success: true, exchange, balances });
    }

    return NextResponse.json({ success: false, message: 'Exchange no soportado' });
  } catch (error) {
    console.error('Exchange connect error:', error);
    return NextResponse.json({ success: false, message: 'Error interno del servidor' });
  }
}

// GET - return current connections (without secrets)
export async function GET() {
  const connections = loadConnections();
  const safe = Object.entries(connections).reduce((acc, [key, val]) => {
    acc[key] = {
      connectedAt: val.connectedAt,
      balanceSnapshot: val.balanceSnapshot,
      address: val.address || null,
    };
    return acc;
  }, {} as Record<string, any>);
  return NextResponse.json({ connections: safe });
}
