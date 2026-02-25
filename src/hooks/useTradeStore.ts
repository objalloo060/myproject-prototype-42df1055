import { useState, useCallback } from "react";

export type TradeDirection = "rise" | "fall";
export type TradeStatus = "active" | "won" | "lost" | "pending";

export interface Trade {
  id: string;
  symbol: string;
  direction: TradeDirection;
  amount: number;
  entryPrice: number;
  exitPrice?: number;
  status: TradeStatus;
  createdAt: Date;
  duration: number; // seconds
  profit?: number;
}

export interface TradeStore {
  isDemo: boolean;
  isLoggedIn: boolean;
  username: string;
  realBalance: number;
  demoBalance: number;
  balance: number;
  trades: Trade[];
  currentPrice: number;
  currentSymbol: string;
  setDemo: (v: boolean) => void;
  login: (username: string) => void;
  logout: () => void;
  deposit: (amount: number) => void;
  withdraw: (amount: number) => boolean;
  placeTrade: (direction: TradeDirection, amount: number, duration: number) => void;
  resolveTrade: (id: string, exitPrice: number) => void;
  setCurrentPrice: (p: number) => void;
  setCurrentSymbol: (s: string) => void;
}

export function useTradeStore(): TradeStore {
  const [isDemo, setIsDemo] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [realBalance, setRealBalance] = useState(0);
  const [demoBalance, setDemoBalance] = useState(10000);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [currentPrice, setCurrentPrice] = useState(67250);
  const [currentSymbol, setCurrentSymbol] = useState("BTC/USDT");

  const balance = isDemo ? demoBalance : realBalance;

  const setDemo = useCallback((v: boolean) => setIsDemo(v), []);

  const login = useCallback((u: string) => {
    setUsername(u);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUsername("");
  }, []);

  const deposit = useCallback((amount: number) => {
    setRealBalance((b) => b + amount);
  }, []);

  const withdraw = useCallback((amount: number): boolean => {
    if (amount > realBalance) return false;
    setRealBalance((b) => b - amount);
    return true;
  }, [realBalance]);

  const placeTrade = useCallback((direction: TradeDirection, amount: number, duration: number) => {
    const setter = isDemo ? setDemoBalance : setRealBalance;
    setter((b) => b - amount);
    const trade: Trade = {
      id: crypto.randomUUID(),
      symbol: currentSymbol,
      direction,
      amount,
      entryPrice: currentPrice,
      status: "active",
      createdAt: new Date(),
      duration,
    };
    setTrades((t) => [trade, ...t]);

    // Auto-resolve after duration
    setTimeout(() => {
      const won = Math.random() > 0.45; // slight edge
      const change = currentPrice * (Math.random() * 0.02);
      const exitPrice = direction === "rise"
        ? (won ? currentPrice + change : currentPrice - change)
        : (won ? currentPrice - change : currentPrice + change);
      
      setTrades((prev) =>
        prev.map((t) =>
          t.id === trade.id
            ? {
                ...t,
                status: won ? "won" : "lost",
                exitPrice,
                profit: won ? amount * 0.85 : -amount,
              }
            : t
        )
      );
      if (won) {
        setter((b) => b + amount + amount * 0.85);
      }
    }, duration * 1000);
  }, [isDemo, currentPrice, currentSymbol]);

  const resolveTrade = useCallback((id: string, exitPrice: number) => {
    setTrades((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exitPrice, status: "won" } : t))
    );
  }, []);

  return {
    isDemo, isLoggedIn, username,
    realBalance, demoBalance, balance,
    trades, currentPrice, currentSymbol,
    setDemo, login, logout, deposit, withdraw,
    placeTrade, resolveTrade, setCurrentPrice, setCurrentSymbol,
  };
}
