import { useState, useCallback, useEffect } from "react";
import { cryptoPairs } from "@/lib/cryptoPairs";

export interface CryptoBalance {
  currency: string;
  label: string;
  amount: number;
  price: number;
  value: number;
}

const STORAGE_KEY = "cryptoBalances";

function loadBalances(): Record<string, number> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveBalances(balances: Record<string, number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(balances));
}

/** Get a simulated live price for a currency based on its base price */
function getLivePrice(symbol: string): number {
  const pair = cryptoPairs.find((p) => p.symbol.startsWith(symbol + "/"));
  if (!pair) return 0;
  // Small random fluctuation ±2%
  const change = (Math.random() - 0.5) * 0.04;
  return pair.basePrice * (1 + change);
}

export function useCryptoBalances(fiatBalance: number) {
  const [balances, setBalances] = useState<Record<string, number>>(loadBalances);

  useEffect(() => {
    saveBalances(balances);
  }, [balances]);

  /** All currencies available for conversion */
  const availableCurrencies = cryptoPairs.map((p) => ({
    symbol: p.symbol.split("/")[0],
    label: p.label,
    price: p.basePrice,
  }));

  /** Non-zero holdings */
  const holdings: CryptoBalance[] = Object.entries(balances)
    .filter(([, amt]) => amt > 0)
    .map(([currency, amount]) => {
      const pair = cryptoPairs.find((p) => p.symbol.startsWith(currency + "/"));
      return {
        currency,
        label: pair?.label || currency,
        amount,
        price: pair?.basePrice || 0,
        value: amount * (pair?.basePrice || 0),
      };
    });

  const totalCryptoValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const totalPortfolioValue = fiatBalance + totalCryptoValue;

  const convertToCrypto = useCallback(
    (fiatAmount: number, currency: string): { cryptoAmount: number; success: boolean } => {
      const price = getLivePrice(currency);
      if (price === 0 || fiatAmount <= 0) return { cryptoAmount: 0, success: false };
      const cryptoAmount = fiatAmount / price;
      setBalances((prev) => ({
        ...prev,
        [currency]: (prev[currency] || 0) + cryptoAmount,
      }));
      return { cryptoAmount, success: true };
    },
    []
  );

  const convertFromCrypto = useCallback(
    (cryptoAmount: number, currency: string): { fiatAmount: number; success: boolean } => {
      const current = balances[currency] || 0;
      if (cryptoAmount <= 0 || cryptoAmount > current) return { fiatAmount: 0, success: false };
      const price = getLivePrice(currency);
      const fiatAmount = cryptoAmount * price;
      setBalances((prev) => ({
        ...prev,
        [currency]: (prev[currency] || 0) - cryptoAmount,
      }));
      return { fiatAmount, success: true };
    },
    [balances]
  );

  const getPrice = useCallback((currency: string) => {
    const pair = cryptoPairs.find((p) => p.symbol.startsWith(currency + "/"));
    return pair?.basePrice || 0;
  }, []);

  return {
    balances,
    holdings,
    availableCurrencies,
    totalCryptoValue,
    totalPortfolioValue,
    convertToCrypto,
    convertFromCrypto,
    getPrice,
  };
}
