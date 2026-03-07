import crypto from 'crypto';
import { ExchangeBalance } from './bitso';

export interface BybitCredentials {
  apiKey: string;
  apiSecret: string;
}

export class BybitClient {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl = 'https://api.bybit.com';

  constructor(creds: BybitCredentials) {
    this.apiKey = creds.apiKey;
    this.apiSecret = creds.apiSecret;
  }

  private sign(timestamp: string, params: string): string {
    const message = `${timestamp}${this.apiKey}5000${params}`;
    return crypto.createHmac('sha256', this.apiSecret).update(message).digest('hex');
  }

  private getHeaders(timestamp: string, params: string) {
    return {
      'X-BAPI-API-KEY': this.apiKey,
      'X-BAPI-TIMESTAMP': timestamp,
      'X-BAPI-RECV-WINDOW': '5000',
      'X-BAPI-SIGN': this.sign(timestamp, params),
    };
  }

  async getBalance(): Promise<ExchangeBalance[]> {
    const timestamp = Date.now().toString();
    const params = 'accountType=UNIFIED';
    const url = `${this.baseUrl}/v5/account/wallet-balance?${params}`;

    const res = await fetch(url, { headers: this.getHeaders(timestamp, params) });
    const data = await res.json();

    if (data.retCode !== 0) throw new Error(data.retMsg || 'Error al obtener balance de Bybit');

    const coins = data.result?.list?.[0]?.coin || [];
    return coins
      .filter((c: any) => parseFloat(c.walletBalance) > 0)
      .map((c: any) => ({
        symbol: c.coin,
        available: parseFloat(c.availableToWithdraw || c.walletBalance),
        locked: parseFloat(c.locked || 0),
        total: parseFloat(c.walletBalance),
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

  async placeOrder(symbol: string, side: 'Buy' | 'Sell', orderType: 'Market' | 'Limit', qty: string, price?: string) {
    const timestamp = Date.now().toString();
    const body: any = { category: 'spot', symbol, side, orderType, qty };
    if (orderType === 'Limit' && price) body.price = price;

    const bodyStr = JSON.stringify(body);
    const headers = {
      ...this.getHeaders(timestamp, bodyStr),
      'Content-Type': 'application/json',
    };

    const res = await fetch(`${this.baseUrl}/v5/order/create`, {
      method: 'POST',
      headers,
      body: bodyStr,
    });
    const data = await res.json();
    if (data.retCode !== 0) throw new Error(data.retMsg || 'Error al colocar orden');
    return data.result;
  }
}
