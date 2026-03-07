import crypto from 'crypto';
import { ExchangeBalance } from './bitso';

export interface BinanceCredentials {
  apiKey: string;
  apiSecret: string;
}

export class BinanceClient {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl = 'https://api.binance.com';

  constructor(creds: BinanceCredentials) {
    this.apiKey = creds.apiKey;
    this.apiSecret = creds.apiSecret;
  }

  private sign(queryString: string): string {
    return crypto.createHmac('sha256', this.apiSecret).update(queryString).digest('hex');
  }

  private getHeaders() {
    return { 'X-MBX-APIKEY': this.apiKey };
  }

  async getBalance(): Promise<ExchangeBalance[]> {
    const timestamp = Date.now();
    const query = `timestamp=${timestamp}`;
    const signature = this.sign(query);
    const url = `${this.baseUrl}/api/v3/account?${query}&signature=${signature}`;

    const res = await fetch(url, { headers: this.getHeaders() });
    const data = await res.json();

    if (data.code && data.code < 0) throw new Error(data.msg || 'Error al obtener balance de Binance');

    return data.balances
      .filter((b: any) => parseFloat(b.free) + parseFloat(b.locked) > 0)
      .map((b: any) => ({
        symbol: b.asset,
        available: parseFloat(b.free),
        locked: parseFloat(b.locked),
        total: parseFloat(b.free) + parseFloat(b.locked),
      }));
  }

  async validateKeys(): Promise<boolean> {
    try {
      await this.getBalance();
      return true;
    } catch {
      return false;
    }
  }

  async placeOrder(symbol: string, side: 'BUY' | 'SELL', type: 'MARKET' | 'LIMIT', quantity: string, price?: string) {
    const timestamp = Date.now();
    let query = `symbol=${symbol}&side=${side}&type=${type}&quantity=${quantity}&timestamp=${timestamp}`;
    if (type === 'LIMIT' && price) query += `&price=${price}&timeInForce=GTC`;

    const signature = this.sign(query);
    const url = `${this.baseUrl}/api/v3/order?${query}&signature=${signature}`;

    const res = await fetch(url, { method: 'POST', headers: this.getHeaders() });
    const data = await res.json();
    if (data.code && data.code < 0) throw new Error(data.msg || 'Error al colocar orden');
    return data;
  }

  async getTicker(symbol: string) {
    const res = await fetch(`${this.baseUrl}/api/v3/ticker/24hr?symbol=${symbol}`);
    return res.json();
  }
}
