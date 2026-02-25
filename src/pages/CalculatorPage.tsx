import { useState } from "react";

export default function CalculatorPage() {
  const [amount, setAmount] = useState("");
  const [percentage, setPercentage] = useState("");
  const [result, setResult] = useState<{ profit: number; total: number } | null>(null);
  const [error, setError] = useState("");

  const calculate = () => {
    const a = parseFloat(amount);
    const p = parseFloat(percentage);
    if (!a || a <= 0 || !p) {
      setError("Please enter valid values");
      setResult(null);
      return;
    }
    setError("");
    const profit = a * (p / 100);
    setResult({ profit, total: a + profit });
  };

  const inputClass = "w-full bg-input text-foreground px-4 py-3 rounded-lg outline-none focus:ring-1 focus:ring-primary font-mono";

  return (
    <div className="animate-fade-in">
      <div className="bg-card p-5 rounded-lg space-y-4">
        <h2 className="text-xl font-bold text-center">Profit Calculator</h2>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Trade Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter trade amount"
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Profit Percentage</label>
          <input
            type="number"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            placeholder="Enter profit %"
            className={inputClass}
          />
        </div>

        <button onClick={calculate} className="w-full py-3 rounded-lg font-semibold bg-primary text-primary-foreground transition-all hover:brightness-110">
          Calculate
        </button>

        {error && <p className="text-destructive text-sm text-center">{error}</p>}

        {result && (
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Profit</span>
              <span className="font-mono text-success font-semibold">+${result.profit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Return</span>
              <span className="font-mono font-bold">${result.total.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
