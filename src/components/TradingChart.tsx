import { useEffect, useRef } from "react";
import { createChart, type IChartApi, type ISeriesApi } from "lightweight-charts";

interface TradingChartProps {
  basePrice?: number;
  onPriceUpdate?: (price: number) => void;
}

function generateCandlestickData(basePrice: number) {
  const data = [];
  let time = Math.floor(Date.now() / 1000) - 200 * 60;
  let close = basePrice + Math.random() * (basePrice * 0.02);

  for (let i = 0; i < 200; i++) {
    const open = close;
    const change = (Math.random() - 0.48) * (basePrice * 0.003);
    close = open + change;
    const high = Math.max(open, close) + Math.random() * (basePrice * 0.0015);
    const low = Math.min(open, close) - Math.random() * (basePrice * 0.0015);
    data.push({ time: time as any, open, high, low, close });
    time += 60;
  }
  return data;
}

export default function TradingChart({ basePrice = 67000, onPriceUpdate }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

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
      timeScale: { borderColor: "#232b4a" },
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

    const data = generateCandlestickData(basePrice);
    series.setData(data);
    chart.timeScale().fitContent();

    if (onPriceUpdate && data.length > 0) {
      onPriceUpdate(data[data.length - 1].close);
    }

    let lastData = data[data.length - 1];
    const interval = setInterval(() => {
      const open = lastData.close;
      const change = (Math.random() - 0.48) * (basePrice * 0.0012);
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * (basePrice * 0.0006);
      const low = Math.min(open, close) - Math.random() * (basePrice * 0.0006);
      const newBar = {
        time: (lastData.time as number + 60) as any,
        open, high, low, close,
      };
      series.update(newBar);
      lastData = newBar;
      onPriceUpdate?.(close);
    }, 2000);

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [basePrice]);

  return <div ref={containerRef} className="rounded-lg overflow-hidden" />;
}
