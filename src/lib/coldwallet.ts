export interface ColdWalletBalance {
  symbol: string;
  address: string;
  balance: number;
  valueUSD: number;
  chain: string;
}

// Lee saldo de dirección pública de Bitcoin vía mempool.space (sin API key)
export async function getBitcoinBalance(address: string): Promise<ColdWalletBalance> {
  const res = await fetch(`https://mempool.space/api/address/${address}`);
  if (!res.ok) throw new Error('Dirección Bitcoin inválida o no encontrada');
  const data = await res.json();

  const satoshis = (data.chain_stats?.funded_txo_sum || 0) - (data.chain_stats?.spent_txo_sum || 0);
  const btcBalance = satoshis / 1e8;

  // Precio actual de BTC
  const priceRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
  const priceData = await priceRes.json();
  const btcPrice = priceData.bitcoin?.usd || 0;

  return {
    symbol: 'BTC',
    address,
    balance: btcBalance,
    valueUSD: btcBalance * btcPrice,
    chain: 'Bitcoin',
  };
}

// Lee saldo de dirección pública de Ethereum vía Etherscan (sin API key, límite bajo)
export async function getEthereumBalance(address: string): Promise<ColdWalletBalance[]> {
  const results: ColdWalletBalance[] = [];

  // ETH balance
  const ethRes = await fetch(
    `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest`
  );
  const ethData = await ethRes.json();
  if (ethData.status !== '1') throw new Error('Dirección Ethereum inválida');

  const ethBalance = parseInt(ethData.result) / 1e18;

  const priceRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
  const priceData = await priceRes.json();
  const ethPrice = priceData.ethereum?.usd || 0;

  results.push({
    symbol: 'ETH',
    address,
    balance: ethBalance,
    valueUSD: ethBalance * ethPrice,
    chain: 'Ethereum',
  });

  return results;
}

// Detecta automáticamente el tipo de dirección y lee el saldo
export async function detectAndReadWallet(address: string): Promise<ColdWalletBalance[]> {
  // Bitcoin: empieza con 1, 3, o bc1
  if (address.match(/^(1|3|bc1)/i)) {
    const balance = await getBitcoinBalance(address);
    return [balance];
  }

  // Ethereum: empieza con 0x y tiene 42 chars
  if (address.match(/^0x[0-9a-fA-F]{40}$/)) {
    return getEthereumBalance(address);
  }

  throw new Error('Formato de dirección no reconocido. Soportamos Bitcoin (BTC) y Ethereum (ETH).');
}
