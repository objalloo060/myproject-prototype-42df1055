export interface CryptoPair {
  symbol: string;
  label: string;
  basePrice: number;
}

export const cryptoPairs: CryptoPair[] = [
  { symbol: "BTC/USDT", label: "Bitcoin", basePrice: 60000 },
  { symbol: "ETH/USDT", label: "Ethereum", basePrice: 3000 },
  { symbol: "BNB/USDT", label: "Binance Coin", basePrice: 400 },
  { symbol: "SOL/USDT", label: "Solana", basePrice: 100 },
  { symbol: "XRP/USDT", label: "Ripple", basePrice: 0.5 },
  { symbol: "ADA/USDT", label: "Cardano", basePrice: 0.4 },
  { symbol: "DOGE/USDT", label: "Dogecoin", basePrice: 0.08 },
  { symbol: "DOT/USDT", label: "Polkadot", basePrice: 6 },
  { symbol: "MATIC/USDT", label: "Polygon", basePrice: 0.7 },
  { symbol: "AVAX/USDT", label: "Avalanche", basePrice: 35 },
  { symbol: "LINK/USDT", label: "Chainlink", basePrice: 14 },
  { symbol: "UNI/USDT", label: "Uniswap", basePrice: 6 },
  { symbol: "LTC/USDT", label: "Litecoin", basePrice: 85 },
  { symbol: "ATOM/USDT", label: "Cosmos", basePrice: 8 },
  { symbol: "ETC/USDT", label: "Ethereum Classic", basePrice: 20 },
  { symbol: "PAXG/USDT", label: "PAX Gold", basePrice: 2350 },
  { symbol: "XAUT/USDT", label: "Tether Gold", basePrice: 2340 },
  { symbol: "SHIB/USDT", label: "Shiba Inu", basePrice: 0.000009 },
  { symbol: "PEPE/USDT", label: "Pepe", basePrice: 0.0000007 },
];
