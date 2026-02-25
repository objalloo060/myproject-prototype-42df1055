import { useEffect, useRef } from "react";
import { createChart, type IChartApi, type ISeriesApi } from "lightweight-charts";

interface TradingChartProps {
  onPriceUpdate?: (price: number) => void;
}

function generateCandlestickData() {
  const data = [];
  let time = Math.floor(Date.now() / 1000) - 200 * 60;
  let close = 67000 + Math.random() * 1000;

  for (let i = 0; i < 200; i++) {
    const open = close;
    const change = (Math.random() - 0.48) * 200;
    close = open + change;
    const high = Math.max(open, close) + Math.random() * 100;
    const low = Math.min(open, close) - Math.random() * 100;
    data.push({ time: time as any, open, high, low, close });
    time += 60;
  }
  return data;
}

export default function TradingChart({ onPriceUpdate }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 300,
      layout: {
        background: { color: "transparent" },
        textColor: "hsl(228, 15%, 55%)",
        fontFamily: "Inter",
      },
      grid: {
        vertLines: { color: "hsl(228, 30%, 14%)" },
        horzLines: { color: "hsl(228, 30%, 14%)" },
      },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: "hsl(228, 30%, 18%)" },
      timeScale: { borderColor: "hsl(228, 30%, 18%)" },
    });

    chartRef.current = chart;

    const series = chart.addCandlestickSeries({
      upColor: "hsl(160, 100%, 38%)",
      downColor: "hsl(0, 100%, 65%)",
      borderUpColor: "hsl(160, 100%, 38%)",
      borderDownColor: "hsl(0, 100%, 65%)",
      wickUpColor: "hsl(160, 100%, 38%)",
      wickDownColor: "hsl(0, 100%, 65%)",
    });

    seriesRef.current = series;
    const data = generateCandlestickData();
    series.setData(data);
    chart.timeScale().fitContent();

    if (onPriceUpdate && data.length > 0) {
      onPriceUpdate(data[data.length - 1].close);
    }

    // Simulate live updates
    let lastData = data[data.length - 1];
    const interval = setInterval(() => {
      const open = lastData.close;
      const change = (Math.random() - 0.48) * 80;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * 40;
      const low = Math.min(open, close) - Math.random() * 40;
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
  }, []);

  return <div ref={containerRef} className="rounded-lg overflow-hidden" />;
}
