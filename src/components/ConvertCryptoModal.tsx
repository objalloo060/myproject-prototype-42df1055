import { useState, useMemo } from "react";
import { ArrowRightLeft } from "lucide-react";

interface ConvertCryptoModalProps {
  open: boolean;
  onClose: () => void;
  direction: "to" | "from";
  fiatBalance: number;
  cryptoBalance?: number;
  initialCurrency?: string;
  availableCurrencies: { symbol: string; label: string; price: number }[];
  onConvertTo: (fiatAmount: number, currency: string) => { cryptoAmount: number; success: boolean };
  onConvertFrom: (cryptoAmount: number, currency: string) => { fiatAmount: number; success: boolean };
  onBalanceChange: (delta: number) => void;
}

export default function ConvertCryptoModal({
  open,
  onClose,
  direction,
  fiatBalance,
  cryptoBalance = 0,
  initialCurrency = "BTC",
  availableCurrencies,
  onConvertTo,
  onConvertFrom,
  onBalanceChange,
}: ConvertCryptoModalProps) {
  const [currency, setCurrency] = useState(initialCurrency);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const selectedPrice = useMemo(
    () => availableCurrencies.find((c) => c.symbol === currency)?.price || 0,
    [currency, availableCurrencies]
  );

  const numAmount = parseFloat(amount) || 0;

  const preview =
    direction === "to"
      ? selectedPrice > 0 ? numAmount / selectedPrice : 0
      : numAmount * selectedPrice;

  if (!open) return null;

  const handleConvert = () => {
    if (numAmount <= 0) return;

    if (direction === "to") {
      if (numAmount > fiatBalance) {
        setMessage("Insufficient fiat balance");
        setTimeout(() => setMessage(""), 3000);
        return;
      }
      if (numAmount < 10) {
        setMessage("Minimum conversion is $10");
        setTimeout(() => setMessage(""), 3000);
        return;
      }
      const result = onConvertTo(numAmount, currency);
      if (result.success) {
        onBalanceChange(-numAmount);
        setMessage(`Converted $${numAmount.toFixed(2)} → ${result.cryptoAmount.toFixed(8)} ${currency}`);
        setAmount("");
        setTimeout(() => { setMessage(""); onClose(); }, 2000);
      }
    } else {
      if (numAmount > cryptoBalance) {
        setMessage("Insufficient crypto balance");
        setTimeout(() => setMessage(""), 3000);
        return;
      }
      const result = onConvertFrom(numAmount, currency);
      if (result.success) {
        onBalanceChange(result.fiatAmount);
        setMessage(`Converted ${numAmount.toFixed(8)} ${currency} → $${result.fiatAmount.toFixed(2)}`);
        setAmount("");
        setTimeout(() => { setMessage(""); onClose(); }, 2000);
      }
    }
  };

  const useMax = () => {
    if (direction === "to") {
      setAmount(fiatBalance.toFixed(2));
    } else {
      setAmount(cryptoBalance.toFixed(8));
    }
  };

  const inputClass = "w-full bg-input text-foreground px-4 py-3 rounded-lg outline-none focus:ring-1 focus:ring-primary font-mono";
  const selectClass = "w-full bg-input text-foreground px-4 py-3 rounded-lg outline-none appearance-none";

  return (
    <div className="fixed inset-0 bg-background/70 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl p-5 w-full max-w-sm space-y-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold text-lg flex items-center gap-2">
          <ArrowRightLeft size={18} className="text-primary" />
          {direction === "to" ? "Convert to Crypto" : "Convert to Fiat"}
        </h3>

        {message && (
          <div className="bg-success/10 border border-success/30 text-success px-3 py-2 rounded-lg text-sm text-center">
            {message}
          </div>
        )}

        {direction === "to" && (
          <p className="text-sm text-muted-foreground">
            Fiat Balance: <span className="text-foreground font-mono font-bold">${fiatBalance.toFixed(2)}</span>
          </p>
        )}
        {direction === "from" && (
          <p className="text-sm text-muted-foreground">
            {currency} Balance: <span className="text-foreground font-mono font-bold">{cryptoBalance.toFixed(8)}</span>
          </p>
        )}

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Cryptocurrency</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={selectClass}>
            {availableCurrencies.map((c) => (
              <option key={c.symbol} value={c.symbol}>
                {c.symbol} — {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm text-muted-foreground">
              {direction === "to" ? "Amount (USD)" : `Amount (${currency})`}
            </label>
            <button onClick={useMax} className="text-xs text-primary font-medium">MAX</button>
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className={inputClass}
          />
        </div>

        <div className="bg-secondary rounded-lg p-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Price</span>
            <span className="font-mono">${selectedPrice.toFixed(selectedPrice < 0.01 ? 8 : 2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">You receive</span>
            <span className="font-mono font-bold text-success">
              {direction === "to"
                ? `${preview.toFixed(8)} ${currency}`
                : `$${preview.toFixed(2)}`}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleConvert}
            className="flex-1 py-3 rounded-lg font-semibold bg-success text-success-foreground hover:brightness-110 transition-all"
          >
            Convert
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg font-semibold border border-border text-foreground hover:bg-accent transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
