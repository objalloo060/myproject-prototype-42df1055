import { useEffect, useState } from "react";
import { cryptoPairs } from "@/lib/cryptoPairs";

interface MarketsPageProps {
  onSelectPair: (symbol: string) => void;
}

interface MarketRow {
  symbol: string;
  label: string;
  price: number;
  change: number;
}

export default function MarketsPage({ onSelectPair }: MarketsPageProps) {
  const [markets, setMarkets] = useState<MarketRow[]>([]);

  useEffect(() => {
    // Simulate market data with random fluctuations
    const initial = cryptoPairs.map((p) => ({
      symbol: p.symbol,
      label: p.label,
      price: p.basePrice * (1 + (Math.random() - 0.5) * 0.04),
      change: (Math.random() - 0.45) * 6,
    }));
    setMarkets(initial);

    const interval = setInterval(() => {
      setMarkets((prev) =>
        prev.map((m) => ({
          ...m,
          price: m.price * (1 + (Math.random() - 0.5) * 0.002),
          change: m.change + (Math.random() - 0.5) * 0.3,
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold text-center mb-4">Markets</h2>

      <div className="space-y-2">
        {markets.map((m) => (
          <button
            key={m.symbol}
            onClick={() => onSelectPair(m.symbol)}
            className="w-full bg-card p-4 rounded-lg flex justify-between items-center hover:bg-accent transition-colors text-left"
          >
            <div>
              <p className="font-semibold">{m.symbol}</p>
              <p className="text-sm text-muted-foreground">{m.label}</p>
            </div>
            <div className="text-right">
              <p className="font-mono font-semibold">
                ${m.price.toFixed(m.price < 1 ? 4 : 2)}
              </p>
              <p
                className={`text-sm font-mono ${
                  m.change >= 0 ? "text-success" : "text-destructive"
                }`}
              >
                {m.change >= 0 ? "+" : ""}
                {m.change.toFixed(2)}%
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
