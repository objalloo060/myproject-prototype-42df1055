import TradingChart from "@/components/TradingChart";
import TradePanel from "@/components/TradePanel";
import ActiveTrades from "@/components/ActiveTrades";
import { cryptoPairs } from "@/lib/cryptoPairs";
import type { TradeDirection, Trade } from "@/hooks/useTradeStore";

interface TradePageProps {
  symbol: string;
  price: number;
  balance: number;
  isDemo: boolean;
  trades: Trade[];
  onPriceUpdate: (p: number) => void;
  onTrade: (dir: TradeDirection, amount: number, duration: number) => void;
  onSymbolChange: (symbol: string) => void;
}

export default function TradePage({
  symbol, price, balance, isDemo, trades, onPriceUpdate, onTrade, onSymbolChange,
}: TradePageProps) {
  const currentPair = cryptoPairs.find((p) => p.symbol === symbol) || cryptoPairs[0];
  const priceColor = "text-success";

  return (
    <div className="animate-fade-in">
      <div className="mb-3">
        <label className="text-sm text-muted-foreground mb-1 block">Select Cryptocurrency</label>
        <select
          value={symbol}
          onChange={(e) => onSymbolChange(e.target.value)}
          className="w-full bg-input text-foreground px-4 py-3 rounded-lg outline-none focus:ring-1 focus:ring-primary"
        >
          {cryptoPairs.map((pair) => (
            <option key={pair.symbol} value={pair.symbol}>
              {pair.symbol} - {pair.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold">{symbol}</h3>
        <h3 className={`text-lg font-mono font-bold ${priceColor}`}>
          ${price.toFixed(price < 1 ? 4 : 2)}
        </h3>
      </div>

      <TradingChart symbol={symbol} basePrice={currentPair.basePrice} onPriceUpdate={onPriceUpdate} />

      <ActiveTrades trades={trades} />

      <TradePanel balance={balance} isDemo={isDemo} onTrade={onTrade} />
    </div>
  );
}
