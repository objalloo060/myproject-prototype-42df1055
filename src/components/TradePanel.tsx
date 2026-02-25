import { useState } from "react";
import type { TradeDirection } from "@/hooks/useTradeStore";

interface TradePanelProps {
  balance: number;
  isDemo: boolean;
  onTrade: (direction: TradeDirection, amount: number, duration: number) => void;
}

const durations = [
  { label: "30s", value: 30 },
  { label: "1m", value: 60 },
  { label: "5m", value: 300 },
];

export default function TradePanel({ balance, isDemo, onTrade }: TradePanelProps) {
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState(60);
  const [error, setError] = useState("");

  const handleTrade = (direction: TradeDirection) => {
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      setError("Enter a valid amount");
      return;
    }
    if (num > balance) {
      setError("Insufficient balance");
      return;
    }
    setError("");
    onTrade(direction, num, duration);
    setAmount("");
  };

  return (
    <div className="space-y-3 mt-4">
      <div className="flex gap-2">
        {durations.map((d) => (
          <button
            key={d.value}
            onClick={() => setDuration(d.value)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              duration === d.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="w-full bg-input text-foreground px-4 py-3 rounded-lg outline-none focus:ring-1 focus:ring-primary font-mono"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
          {isDemo ? "DEMO" : "USD"}
        </span>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={() => handleTrade("rise")}
          className="flex-1 py-3.5 rounded-lg font-bold text-success-foreground bg-success transition-all hover:brightness-110 active:scale-[0.98]"
        >
          ▲ Buy Rise
        </button>
        <button
          onClick={() => handleTrade("fall")}
          className="flex-1 py-3.5 rounded-lg font-bold text-destructive-foreground bg-destructive transition-all hover:brightness-110 active:scale-[0.98]"
        >
          ▼ Buy Fall
        </button>
      </div>
    </div>
  );
}
