import { useState } from "react";
import { useTradeStore } from "@/hooks/useTradeStore";
import BottomNav from "@/components/BottomNav";
import ChatWidget from "@/components/ChatWidget";
import AuthPage from "@/pages/AuthPage";
import TradePage from "@/pages/TradePage";
import WalletPage from "@/pages/WalletPage";
import CalculatorPage from "@/pages/CalculatorPage";
import OrdersPage from "@/pages/OrdersPage";
import MarketsPage from "@/pages/MarketsPage";
import BlockchainPage from "@/pages/BlockchainPage";
import ProfilePage from "@/pages/ProfilePage";

type Page = "trade" | "markets" | "orders" | "wallet" | "blockchain" | "profile";

export default function Index() {
  const store = useTradeStore();
  const [page, setPage] = useState<Page>("trade");

  if (!store.isLoggedIn) {
    return <AuthPage onLogin={store.login} />;
  }

  const handleSelectPair = (symbol: string) => {
    store.setCurrentSymbol(symbol);
    setPage("trade");
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Mode toggle */}
      <div className="flex justify-center gap-2 pt-4 pb-2">
        <button
          onClick={() => store.setDemo(false)}
          className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
            !store.isDemo ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground border border-border"
          }`}
        >
          Real
        </button>
        <button
          onClick={() => store.setDemo(true)}
          className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
            store.isDemo ? "bg-warning text-warning-foreground" : "bg-secondary text-muted-foreground border border-border"
          }`}
        >
          Demo
        </button>
      </div>

      {/* Balance bar */}
      <div className="text-center mb-3">
        <span className="text-sm text-muted-foreground">Balance: </span>
        <span className="font-mono font-bold">
          {store.isDemo ? `${store.balance.toFixed(2)} DEMO` : `$${store.balance.toFixed(2)}`}
        </span>
      </div>

      <div className="px-4">
        {page === "trade" && (
          <TradePage
            symbol={store.currentSymbol}
            price={store.currentPrice}
            balance={store.balance}
            isDemo={store.isDemo}
            trades={store.trades}
            onPriceUpdate={store.setCurrentPrice}
            onTrade={store.placeTrade}
            onSymbolChange={handleSelectPair}
          />
        )}
        {page === "markets" && <MarketsPage onSelectPair={handleSelectPair} />}
        {page === "blockchain" && <BlockchainPage />}
        {page === "wallet" && (
          <WalletPage
            balance={store.balance}
            isDemo={store.isDemo}
            onDeposit={store.deposit}
            onWithdraw={store.withdraw}
          />
        )}
        {page === "orders" && <OrdersPage trades={store.trades} />}
        {page === "profile" && (
          <ProfilePage
            username={store.username}
            balance={store.balance}
            isDemo={store.isDemo}
            onLogout={store.logout}
          />
        )}
      </div>

      <BottomNav active={page} onNavigate={setPage} />
      <ChatWidget />
    </div>
  );
}
