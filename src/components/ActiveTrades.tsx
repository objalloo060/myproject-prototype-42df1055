import type { Trade } from "@/hooks/useTradeStore";
import { useEffect, useState } from "react";

interface ActiveTradesProps {
  trades: Trade[];
}

function TradeTimer({ trade }: { trade: Trade }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const update = () => {
      const elapsed = (Date.now() - trade.createdAt.getTime()) / 1000;
      setRemaining(Math.max(0, trade.duration - elapsed));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [trade]);

  return <span className="font-mono text-sm">{Math.ceil(remaining)}s</span>;
}

export default function ActiveTrades({ trades }: ActiveTradesProps) {
  const active = trades.filter((t) => t.status === "active");
  if (active.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      <h4 className="text-sm text-muted-foreground">Active Trades</h4>
      {active.map((trade) => (
        <div
          key={trade.id}
          className={`flex items-center justify-between bg-secondary px-3 py-2 rounded-lg border-l-2 ${
            trade.direction === "rise" ? "border-l-success" : "border-l-destructive"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={trade.direction === "rise" ? "text-success" : "text-destructive"}>
              {trade.direction === "rise" ? "▲" : "▼"}
            </span>
            <span className="text-sm font-medium">${trade.amount.toFixed(2)}</span>
          </div>
          <TradeTimer trade={trade} />
        </div>
      ))}
    </div>
  );
}
