const BINANCE_REST = "https://api.binance.com/api/v3";
const BINANCE_WS = "wss://stream.binance.com:9443/ws";

/** Convert our pair format "BTC/USDT" to Binance format "BTCUSDT" */
export function toBinanceSymbol(symbol: string): string {
  return symbol.replace("/", "").replace("USDT/USD", "USDTUSD").toUpperCase();
}

export interface KlineData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export async function fetchKlines(
  symbol: string,
  interval = "1m",
  limit = 200
): Promise<KlineData[]> {
  const binanceSymbol = toBinanceSymbol(symbol);
  const url = `${BINANCE_REST}/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Binance API error: ${res.status}`);
  const data = await res.json();

  return data.map((c: any[]) => ({
    time: Math.floor(c[0] / 1000),
    open: parseFloat(c[1]),
    high: parseFloat(c[2]),
    low: parseFloat(c[3]),
    close: parseFloat(c[4]),
    volume: parseFloat(c[5]),
  }));
}

export interface Ticker24h {
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
}

export async function fetchTicker24h(symbol: string): Promise<Ticker24h> {
  const binanceSymbol = toBinanceSymbol(symbol);
  const url = `${BINANCE_REST}/ticker/24hr?symbol=${binanceSymbol}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Binance ticker error: ${res.status}`);
  const d = await res.json();
  return {
    price: parseFloat(d.lastPrice),
    change: parseFloat(d.priceChange),
    changePercent: parseFloat(d.priceChangePercent),
    high: parseFloat(d.highPrice),
    low: parseFloat(d.lowPrice),
    volume: parseFloat(d.volume),
  };
}

export function subscribeKline(
  symbol: string,
  interval: string,
  onUpdate: (kline: KlineData) => void
): () => void {
  const binanceSymbol = toBinanceSymbol(symbol).toLowerCase();
  const stream = `${binanceSymbol}@kline_${interval}`;
  const ws = new WebSocket(`${BINANCE_WS}/${stream}`);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.e === "kline") {
      const k = data.k;
      onUpdate({
        time: Math.floor(k.t / 1000),
        open: parseFloat(k.o),
        high: parseFloat(k.h),
        low: parseFloat(k.l),
        close: parseFloat(k.c),
        volume: parseFloat(k.v),
      });
    }
  };

  ws.onerror = (e) => console.error("Binance WS error:", e);

  return () => ws.close();
}
