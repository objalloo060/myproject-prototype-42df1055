import { useState } from "react";

interface WalletPageProps {
  balance: number;
  isDemo: boolean;
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => boolean;
}

export default function WalletPage({ balance, isDemo, onDeposit, onWithdraw }: WalletPageProps) {
  const [depAmount, setDepAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("bank");
  const [message, setMessage] = useState("");

  const handleDeposit = () => {
    const num = parseFloat(depAmount);
    if (!num || num <= 0) return;
    onDeposit(num);
    setDepAmount("");
    setMessage("Deposit successful!");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleWithdraw = () => {
    const num = parseFloat(withdrawAmount);
    if (!num || num <= 0) return;
    if (onWithdraw(num)) {
      setWithdrawAmount("");
      setMessage("Withdrawal submitted!");
    } else {
      setMessage("Insufficient balance");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const inputClass = "w-full bg-input text-foreground px-4 py-3 rounded-lg outline-none focus:ring-1 focus:ring-primary font-mono";
  const selectClass = "w-full bg-input text-foreground px-4 py-3 rounded-lg outline-none appearance-none";

  return (
    <div className="animate-fade-in space-y-4">
      {message && (
        <div className="bg-success text-success-foreground px-4 py-3 rounded-lg text-center font-medium animate-slide-down">
          {message}
        </div>
      )}

      <div className="bg-card p-5 rounded-lg">
        <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
        <h1 className="text-3xl font-bold font-mono">
          {isDemo ? `${balance.toFixed(2)} DEMO` : `$${balance.toFixed(2)}`}
        </h1>
      </div>

      {!isDemo && (
        <>
          <div className="bg-card p-5 rounded-lg space-y-3">
            <h3 className="font-semibold">Deposit</h3>
            <input
              type="number"
              value={depAmount}
              onChange={(e) => setDepAmount(e.target.value)}
              placeholder="Amount"
              className={inputClass}
            />
            <button onClick={handleDeposit} className="w-full py-3 rounded-lg font-semibold bg-primary text-primary-foreground transition-all hover:brightness-110">
              Deposit GBP
            </button>
          </div>

          <div className="bg-card p-5 rounded-lg space-y-3">
            <h3 className="font-semibold">Withdraw</h3>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Amount"
              className={inputClass}
            />
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Method</label>
              <select value={withdrawMethod} onChange={(e) => setWithdrawMethod(e.target.value)} className={selectClass}>
                <option value="bank">Bank Transfer</option>
                <option value="crypto">Crypto Exchange (Bybit)</option>
              </select>
            </div>
            {withdrawMethod === "crypto" && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Cryptocurrency</label>
                  <select className={selectClass}>
                    <option>USDT (Tether)</option>
                    <option>BTC (Bitcoin)</option>
                    <option>ETH (Ethereum)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Network</label>
                  <select className={selectClass}>
                    <option>Ethereum (ERC20)</option>
                    <option>Tron (TRC20)</option>
                    <option>BSC (BEP20)</option>
                  </select>
                </div>
              </div>
            )}
            <button onClick={handleWithdraw} className="w-full py-3 rounded-lg font-semibold bg-destructive text-destructive-foreground transition-all hover:brightness-110">
              Withdraw
            </button>
          </div>
        </>
      )}

      {isDemo && (
        <div className="bg-card p-5 rounded-lg text-center">
          <p className="text-muted-foreground">Switch to <span className="text-foreground font-semibold">Real</span> mode to deposit & withdraw.</p>
        </div>
      )}
    </div>
  );
}
