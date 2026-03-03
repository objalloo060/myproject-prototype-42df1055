import { useEffect, useRef, useState } from "react";
import { createChart, type IChartApi } from "lightweight-charts";
import { fetchKlines, subscribeKline, type KlineData } from "@/lib/binanceApi";

interface TradingChartProps {
  symbol?: string;
  basePrice?: number;
  onPriceUpdate?: (price: number) => void;
}

const INTERVALS = ["1m", "5m", "15m", "1h", "4h", "1d"] as const;

function generateFallbackData(basePrice: number) {
  const data: KlineData[] = [];
  let time = Math.floor(Date.now() / 1000) - 200 * 60;
  let close = basePrice + Math.random() * (basePrice * 0.02);
  for (let i = 0; i < 200; i++) {
    const open = close;
    const change = (Math.random() - 0.48) * (basePrice * 0.003);
    close = open + change;
    const high = Math.max(open, close) + Math.random() * (basePrice * 0.0015);
    const low = Math.min(open, close) - Math.random() * (basePrice * 0.0015);
    data.push({ time, open, high, low, close, volume: Math.random() * 100 });
    time += 60;
  }
  return data;
}

export default function TradingChart({ symbol = "BTC/USDT", basePrice = 67000, onPriceUpdate }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [interval, setInterval_] = useState<string>("1m");
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 300,
      layout: {
        background: { color: "transparent" },
        textColor: "#7a7f96",
        fontFamily: "Inter",
      },
      grid: {
        vertLines: { color: "#1a2140" },
        horzLines: { color: "#1a2140" },
      },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: "#232b4a" },
      timeScale: { borderColor: "#232b4a", timeVisible: true },
    });
    chartRef.current = chart;

    const series = chart.addCandlestickSeries({
      upColor: "#00c261",
      downColor: "#ff4d4f",
      borderUpColor: "#00c261",
      borderDownColor: "#ff4d4f",
      wickUpColor: "#00c261",
      wickDownColor: "#ff4d4f",
    });

    let cleanupWs: (() => void) | null = null;
    let fallbackInterval: ReturnType<typeof globalThis.setInterval> | null = null;

    async function loadData() {
      try {
        const klines = await fetchKlines(symbol, interval, 200);
        series.setData(klines.map((k) => ({ time: k.time as any, open: k.open, high: k.high, low: k.low, close: k.close })));
        chart.timeScale().fitContent();
        if (klines.length > 0) onPriceUpdate?.(klines[klines.length - 1].close);
        setIsLive(true);

        cleanupWs = subscribeKline(symbol, interval, (kline) => {
          series.update({ time: kline.time as any, open: kline.open, high: kline.high, low: kline.low, close: kline.close });
          onPriceUpdate?.(kline.close);
        });
      } catch (err) {
        console.warn("Binance API unavailable, using simulated data:", err);
        setIsLive(false);
        const data = generateFallbackData(basePrice);
        series.setData(data.map((k) => ({ time: k.time as any, open: k.open, high: k.high, low: k.low, close: k.close })));
        chart.timeScale().fitContent();
        if (data.length > 0) onPriceUpdate?.(data[data.length - 1].close);

        let lastData = data[data.length - 1];
        fallbackInterval = globalThis.setInterval(() => {
          const open = lastData.close;
          const change = (Math.random() - 0.48) * (basePrice * 0.0012);
          const close = open + change;
          const high = Math.max(open, close) + Math.random() * (basePrice * 0.0006);
          const low = Math.min(open, close) - Math.random() * (basePrice * 0.0006);
          const newBar = { time: (lastData.time + 60) as any, open, high, low, close };
          series.update(newBar);
          lastData = { ...newBar, volume: 0 };
          onPriceUpdate?.(close);
        }, 2000);
      }
    }

    loadData();

    const handleResize = () => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cleanupWs?.();
      if (fallbackInterval) globalThis.clearInterval(fallbackInterval);
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [symbol, interval, basePrice]);

  return (
    <div>
      <div className="flex items-center gap-1 mb-2">
        {INTERVALS.map((iv) => (
          <button
            key={iv}
            onClick={() => setInterval_(iv)}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              interval === iv ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {iv}
          </button>
        ))}
        <span className={`ml-auto text-xs font-medium ${isLive ? "text-success" : "text-warning"}`}>
          {isLive ? "● LIVE" : "● SIMULATED"}
        </span>
      </div>
      <div ref={containerRef} className="rounded-lg overflow-hidden" />
    </div>
  );
}
