import crypto from 'crypto';

export interface ExchangeBalance {
  symbol: string;
  available: number;
  locked: number;
  total: number;
}

export interface BitsoCredentials {
  apiKey: string;
  apiSecret: string;
}

export class BitsoClient {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl = 'https://api.bitso.com';

  constructor(creds: BitsoCredentials) {
    this.apiKey = creds.apiKey;
    this.apiSecret = creds.apiSecret;
  }

  private generateSignature(nonce: string, method: string, path: string, body = ''): string {
    const message = `${nonce}${method}${path}${body}`;
    return crypto.createHmac('sha256', this.apiSecret).update(message).digest('hex');
  }

  private getHeaders(method: string, path: string, body = '') {
    const nonce = Date.now().toString();
    const signature = this.generateSignature(nonce, method, path, body);
    return {
      'Authorization': `Bitso ${this.apiKey}:${nonce}:${signature}`,
      'Content-Type': 'application/json',
    };
  }

  async getBalance(): Promise<ExchangeBalance[]> {
    const path = '/v3/balance/';
    const headers = this.getHeaders('GET', path);
    const res = await fetch(`${this.baseUrl}${path}`, { headers });
    const data = await res.json();

    if (!data.success) throw new Error(data.error?.message || 'Error al obtener balance de Bitso');

    return data.payload.balances
      .filter((b: any) => parseFloat(b.total) > 0)
      .map((b: any) => ({
        symbol: b.currency.toUpperCase(),
        available: parseFloat(b.available),
        locked: parseFloat(b.locked),
        total: parseFloat(b.total),
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

  async placeOrder(book: string, side: 'buy' | 'sell', type: 'market' | 'limit', amount: string, price?: string) {
    const path = '/v3/orders/';
    const body: any = { book, side, type, major: amount };
    if (type === 'limit' && price) body.price = price;

    const bodyStr = JSON.stringify(body);
    const headers = this.getHeaders('POST', path, bodyStr);

    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers,
      body: bodyStr,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error?.message || 'Error al colocar orden');
    return data.payload;
  }

  async getTicker(book: string) {
    const res = await fetch(`${this.baseUrl}/v3/ticker/?book=${book}`);
    const data = await res.json();
    if (!data.success) throw new Error('Error al obtener ticker');
    return data.payload;
  }
}
