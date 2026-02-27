import { useState } from "react";
import { Trash2, QrCode } from "lucide-react";
import QRCodeModal from "@/components/QRCodeModal";

interface SavedAddress {
  id: string;
  currency: string;
  chain: string;
  address: string;
  label: string;
}

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
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalCurrency, setModalCurrency] = useState("USDT");
  const [modalChain, setModalChain] = useState("ETH");
  const [modalAddress, setModalAddress] = useState("");
  const [modalLabel, setModalLabel] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [withdrawCurrency, setWithdrawCurrency] = useState("USDT");
  const [withdrawChain, setWithdrawChain] = useState("ETH");
  const [qrAddr, setQrAddr] = useState<SavedAddress | null>(null);

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

  const saveAddress = () => {
    if (!modalAddress.trim()) return;
    setSavedAddresses((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        currency: modalCurrency,
        chain: modalChain,
        address: modalAddress.trim(),
        label: modalLabel.trim() || `${modalCurrency} - ${modalChain}`,
      },
    ]);
    setModalAddress("");
    setModalLabel("");
    setShowAddModal(false);
  };

  const deleteAddress = (id: string) => {
    setSavedAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const filteredAddresses = savedAddresses.filter(
    (a) => a.currency === withdrawCurrency && a.chain === withdrawChain
  );

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
          {/* Saved Addresses */}
          <div className="bg-card p-5 rounded-lg space-y-3">
            <h3 className="font-semibold">Saved Wallet Addresses</h3>
            {savedAddresses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No saved addresses yet.</p>
            ) : (
              <div className="space-y-2">
                {savedAddresses.map((addr) => (
                  <div key={addr.id} className="flex items-center justify-between bg-secondary px-3 py-2 rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{addr.label}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {addr.currency} · {addr.chain} · {addr.address.slice(0, 12)}...
                      </p>
                    </div>
                    <button onClick={() => setQrAddr(addr)} className="text-primary ml-2 shrink-0">
                      <QrCode size={16} />
                    </button>
                    <button onClick={() => deleteAddress(addr.id)} className="text-destructive ml-2 shrink-0">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full py-3 rounded-lg font-semibold bg-primary text-primary-foreground transition-all hover:brightness-110"
            >
              + Add Wallet Address
            </button>
          </div>

          {/* Deposit */}
          <div className="bg-card p-5 rounded-lg space-y-3">
            <h3 className="font-semibold">Deposit</h3>
            <input type="number" value={depAmount} onChange={(e) => setDepAmount(e.target.value)} placeholder="Amount" className={inputClass} />
            <button onClick={handleDeposit} className="w-full py-3 rounded-lg font-semibold bg-primary text-primary-foreground transition-all hover:brightness-110">
              Deposit GBP
            </button>
          </div>

          {/* Withdraw */}
          <div className="bg-card p-5 rounded-lg space-y-3">
            <h3 className="font-semibold">Withdraw</h3>
            <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="Amount" className={inputClass} />
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
                  <select value={withdrawCurrency} onChange={(e) => setWithdrawCurrency(e.target.value)} className={selectClass}>
                    <option value="USDT">USDT (Tether)</option>
                    <option value="BTC">BTC (Bitcoin)</option>
                    <option value="ETH">ETH (Ethereum)</option>
                    <option value="USDC">USDC (USD Coin)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Network</label>
                  <select value={withdrawChain} onChange={(e) => setWithdrawChain(e.target.value)} className={selectClass}>
                    <option value="ETH">Ethereum (ERC20)</option>
                    <option value="TRX">Tron (TRC20)</option>
                    <option value="BSC">Binance Smart Chain (BEP20)</option>
                    <option value="POLYGON">Polygon</option>
                  </select>
                </div>
                {filteredAddresses.length > 0 && (
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Saved Addresses</label>
                    <select value={selectedAddress} onChange={(e) => setSelectedAddress(e.target.value)} className={selectClass}>
                      <option value="">Select saved address or enter new</option>
                      {filteredAddresses.map((a) => (
                        <option key={a.id} value={a.address}>
                          {a.label} — {a.address.slice(0, 12)}...
                        </option>
                      ))}
                    </select>
                  </div>
                )}
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

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/70 z-[200] flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-card border border-border rounded-2xl p-5 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg">Add Wallet Address</h3>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Cryptocurrency</label>
              <select value={modalCurrency} onChange={(e) => setModalCurrency(e.target.value)} className={selectClass}>
                <option value="USDT">USDT (Tether)</option>
                <option value="BTC">BTC (Bitcoin)</option>
                <option value="ETH">ETH (Ethereum)</option>
                <option value="USDC">USDC (USD Coin)</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Network</label>
              <select value={modalChain} onChange={(e) => setModalChain(e.target.value)} className={selectClass}>
                <option value="ETH">Ethereum (ERC20)</option>
                <option value="TRX">Tron (TRC20)</option>
                <option value="BSC">Binance Smart Chain (BEP20)</option>
                <option value="POLYGON">Polygon</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Wallet Address</label>
              <input value={modalAddress} onChange={(e) => setModalAddress(e.target.value)} placeholder="Enter wallet address" className={inputClass} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Label (Optional)</label>
              <input value={modalLabel} onChange={(e) => setModalLabel(e.target.value)} placeholder="e.g., My Bybit Wallet" className={inputClass} />
            </div>
            <div className="flex gap-3">
              <button onClick={saveAddress} className="flex-1 py-3 rounded-lg font-semibold bg-success text-success-foreground hover:brightness-110">
                Save
              </button>
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-lg font-semibold border border-border text-foreground hover:bg-accent">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {qrAddr && (
        <QRCodeModal
          open={!!qrAddr}
          onClose={() => setQrAddr(null)}
          address={qrAddr.address}
          currency={qrAddr.currency}
          chain={qrAddr.chain}
          label={qrAddr.label}
        />
      )}
    </div>
  );
}
