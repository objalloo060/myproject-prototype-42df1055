import TradingChart from "@/components/TradingChart";
import TradePanel from "@/components/TradePanel";
import ActiveTrades from "@/components/ActiveTrades";
import type { TradeDirection, Trade } from "@/hooks/useTradeStore";

interface TradePageProps {
  symbol: string;
  price: number;
  balance: number;
  isDemo: boolean;
  trades: Trade[];
  onPriceUpdate: (p: number) => void;
  onTrade: (dir: TradeDirection, amount: number, duration: number) => void;
}

export default function TradePage({
  symbol, price, balance, isDemo, trades, onPriceUpdate, onTrade,
}: TradePageProps) {
  const priceColor = "text-success";

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold">{symbol}</h3>
        <h3 className={`text-lg font-mono font-bold ${priceColor}`}>
          ${price.toFixed(2)}
        </h3>
      </div>

      <TradingChart onPriceUpdate={onPriceUpdate} />

      <ActiveTrades trades={trades} />

      <TradePanel balance={balance} isDemo={isDemo} onTrade={onTrade} />
    </div>
  );
}
