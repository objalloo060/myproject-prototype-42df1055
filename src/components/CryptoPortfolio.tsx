import { ArrowRightLeft, TrendingUp } from "lucide-react";
import type { CryptoBalance } from "@/hooks/useCryptoBalances";

interface CryptoPortfolioProps {
  holdings: CryptoBalance[];
  totalCryptoValue: number;
  totalPortfolioValue: number;
  fiatBalance: number;
  onConvertTo: () => void;
  onConvertFrom: (currency: string) => void;
}

export default function CryptoPortfolio({
  holdings,
  totalCryptoValue,
  totalPortfolioValue,
  fiatBalance,
  onConvertTo,
  onConvertFrom,
}: CryptoPortfolioProps) {
  return (
    <div className="space-y-3">
      {/* Portfolio Summary */}
      <div className="bg-card p-5 rounded-lg space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <TrendingUp size={16} className="text-primary" /> Portfolio Overview
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-secondary rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Fiat</p>
            <p className="font-bold font-mono text-sm">${fiatBalance.toFixed(2)}</p>
          </div>
          <div className="bg-secondary rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Crypto</p>
            <p className="font-bold font-mono text-sm text-success">${totalCryptoValue.toFixed(2)}</p>
          </div>
          <div className="bg-secondary rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-bold font-mono text-sm">${totalPortfolioValue.toFixed(2)}</p>
          </div>
        </div>
        <button
          onClick={onConvertTo}
          className="w-full py-3 rounded-lg font-semibold bg-primary text-primary-foreground transition-all hover:brightness-110 flex items-center justify-center gap-2"
        >
          <ArrowRightLeft size={16} /> Convert to Crypto
        </button>
      </div>

      {/* Holdings */}
      {holdings.length > 0 && (
        <div className="bg-card p-5 rounded-lg space-y-3">
          <h3 className="font-semibold">Crypto Holdings</h3>
          <div className="space-y-2">
            {holdings.map((h) => (
              <div key={h.currency} className="bg-secondary px-4 py-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold">{h.currency}</p>
                    <p className="text-xs text-muted-foreground">${h.price.toFixed(h.price < 0.01 ? 8 : 2)} per unit</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold font-mono text-success">{h.amount.toFixed(8)}</p>
                    <p className="text-xs text-muted-foreground">≈ ${h.value.toFixed(2)}</p>
                  </div>
                </div>
                <button
                  onClick={() => onConvertFrom(h.currency)}
                  className="w-full py-2 rounded-lg text-sm font-medium border border-primary text-primary hover:bg-primary/10 transition-colors"
                >
                  Convert to Fiat
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
