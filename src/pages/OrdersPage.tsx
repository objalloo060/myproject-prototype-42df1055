import { useState } from "react";
import type { Trade } from "@/hooks/useTradeStore";

interface OrdersPageProps {
  trades: Trade[];
}

export default function OrdersPage({ trades }: OrdersPageProps) {
  const [filter, setFilter] = useState<"all" | "active">("all");

  const filtered = filter === "active" ? trades.filter((t) => t.status === "active") : trades;

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold text-center mb-4">My Orders</h2>

      <div className="flex justify-center gap-2 mb-4">
        {(["active", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            {f === "active" ? "Active" : "All"}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-10">No orders yet</p>
        )}
        {filtered.map((trade) => (
          <div key={trade.id} className="bg-card p-4 rounded-lg flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className={trade.direction === "rise" ? "text-success" : "text-destructive"}>
                  {trade.direction === "rise" ? "▲" : "▼"}
                </span>
                <span className="font-medium">{trade.symbol}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  trade.status === "won" ? "bg-success/20 text-success" :
                  trade.status === "lost" ? "bg-destructive/20 text-destructive" :
                  "bg-primary/20 text-primary"
                }`}>
                  {trade.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Entry: ${trade.entryPrice.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono font-semibold">${trade.amount.toFixed(2)}</p>
              {trade.profit !== undefined && (
                <p className={`text-sm font-mono ${trade.profit >= 0 ? "text-success" : "text-destructive"}`}>
                  {trade.profit >= 0 ? "+" : ""}${trade.profit.toFixed(2)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
