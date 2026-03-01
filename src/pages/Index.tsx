import { useState, useEffect } from "react";
import { useTradeStore } from "@/hooks/useTradeStore";
import BottomNav from "@/components/BottomNav";
import ChatWidget from "@/components/ChatWidget";
import AuthPage from "@/pages/AuthPage";
import TradePage from "@/pages/TradePage";
import WalletPage from "@/pages/WalletPage";
import CalculatorPage from "@/pages/CalculatorPage";
import OrdersPage from "@/pages/OrdersPage";
import MarketsPage from "@/pages/MarketsPage";
import ProfilePage from "@/pages/ProfilePage";
import BlockchainPage from "@/pages/BlockchainPage";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

type Page = "trade" | "markets" | "orders" | "wallet" | "profile" | "blockchain";

export default function Index() {
  const store = useTradeStore();
  const [page, setPage] = useState<Page>("trade");
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ username: string; uid: string } | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        // Fetch profile after session change
        setTimeout(() => {
          supabase
            .from("profiles")
            .select("username, uid")
            .eq("user_id", session.user.id)
            .single()
            .then(({ data }) => {
              if (data) setProfile(data);
            });
        }, 0);
      } else {
        setProfile(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session?.user) {
        supabase
          .from("profiles")
          .select("username, uid")
          .eq("user_id", session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setProfile(data);
          });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  const username = profile?.username || session.user.user_metadata?.username || "User";

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

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
            username={username}
            balance={store.balance}
            isDemo={store.isDemo}
            onLogout={handleLogout}
          />
        )}
        {page === "blockchain" && <BlockchainPage />}
      </div>

      <BottomNav active={page} onNavigate={setPage} />
      <ChatWidget />
    </div>
  );
}
