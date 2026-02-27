import { useState, useEffect, useCallback } from "react";
import { Hash, Link2, Clock, Pickaxe, ChevronDown, ChevronUp, Send, ShieldCheck, Loader2 } from "lucide-react";


interface Transaction {
  sender: string;
  recipient: string;
  amount: number;
  transactionId?: string;
  timestamp?: number;
}

interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  proof: number;
  previousHash: string;
  hash: string;
}

export default function BlockchainPage() {
  const [chain, setChain] = useState<Block[]>([]);
  const [mining, setMining] = useState(false);
  const [validating, setValidating] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [chainValid, setChainValid] = useState<boolean | null>(null);
  const [txSender, setTxSender] = useState("");
  const [txRecipient, setTxRecipient] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchChain = useCallback(async () => {
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/blockchain?action=chain`,
        { headers: { apikey: anonKey, "Content-Type": "application/json" } }
      );
      const json = await res.json();
      if (json.chain) setChain(json.chain);
    } catch (e) {
      console.error("Failed to fetch chain", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPending = useCallback(async () => {
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/blockchain?action=pending`,
        { headers: { apikey: anonKey } }
      );
      const json = await res.json();
      setPendingCount(json.pending?.length ?? 0);
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchChain();
    fetchPending();
  }, [fetchChain, fetchPending]);

  const addTransaction = async () => {
    const amount = parseFloat(txAmount);
    if (!txSender.trim() || !txRecipient.trim() || !amount || amount <= 0) return;
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/blockchain?action=transaction`,
        {
          method: "POST",
          headers: { apikey: anonKey, "Content-Type": "application/json" },
          body: JSON.stringify({ sender: txSender.trim(), recipient: txRecipient.trim(), amount }),
        }
      );
      const json = await res.json();
      setPendingCount(json.pending ?? 0);
      setTxSender("");
      setTxRecipient("");
      setTxAmount("");
    } catch (e) {
      console.error("Failed to add transaction", e);
    }
  };

  const handleMine = async () => {
    setMining(true);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/blockchain?action=mine`,
        { headers: { apikey: anonKey } }
      );
      await res.json();
      await fetchChain();
      setPendingCount(0);
      setChainValid(null);
    } catch (e) {
      console.error("Mining failed", e);
    } finally {
      setMining(false);
    }
  };

  const handleValidate = async () => {
    setValidating(true);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/blockchain?action=validate`,
        { headers: { apikey: anonKey } }
      );
      const json = await res.json();
      setChainValid(json.valid);
    } catch (_) {
    } finally {
      setValidating(false);
    }
  };

  const inputClass =
    "w-full bg-input text-foreground px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-primary text-sm font-mono";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-4">
      <h2 className="text-center text-lg font-bold">⛓️ Blockchain Explorer</h2>
      <p className="text-center text-xs text-muted-foreground">
        Real SHA-256 hashing &amp; Proof-of-Work running on the backend
      </p>

      {/* Add Transaction */}
      <div className="bg-card p-4 rounded-lg space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Send size={14} className="text-primary" /> New Transaction
        </h3>
        <input value={txSender} onChange={(e) => setTxSender(e.target.value)} placeholder="Sender address" className={inputClass} />
        <input value={txRecipient} onChange={(e) => setTxRecipient(e.target.value)} placeholder="Recipient address" className={inputClass} />
        <input type="number" value={txAmount} onChange={(e) => setTxAmount(e.target.value)} placeholder="Amount" className={inputClass} />
        <button onClick={addTransaction} className="w-full py-2 rounded-lg font-semibold text-sm bg-primary text-primary-foreground hover:brightness-110 transition-all">
          Add to Pending
        </button>
        {pendingCount > 0 && (
          <p className="text-xs text-muted-foreground">{pendingCount} pending transaction(s)</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleMine}
          disabled={mining}
          className="flex-1 py-3 rounded-lg font-bold bg-warning text-warning-foreground flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
        >
          <Pickaxe size={18} className={mining ? "animate-spin" : ""} />
          {mining ? "Mining..." : "Mine Block"}
        </button>
        <button
          onClick={handleValidate}
          disabled={validating}
          className="flex-1 py-3 rounded-lg font-bold bg-secondary text-foreground flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50 border border-border"
        >
          <ShieldCheck size={18} />
          {validating ? "Checking..." : "Validate"}
        </button>
      </div>

      {chainValid !== null && (
        <div className={`text-center text-sm font-semibold py-2 rounded-lg ${chainValid ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
          {chainValid ? "✅ Chain is valid" : "❌ Chain integrity compromised"}
        </div>
      )}

      {/* Chain */}
      <div className="space-y-3">
        {[...chain].reverse().map((block) => {
          const isExpanded = expanded === block.index;
          return (
            <div key={block.index} className="bg-card rounded-lg overflow-hidden border border-border">
              <button
                onClick={() => setExpanded(isExpanded ? null : block.index)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold text-sm">#{block.index}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">Block #{block.index}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">{block.hash?.slice(0, 24)}…</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">
                    {block.transactions.length} tx
                  </span>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-2 border-t border-border pt-3">
                  <div className="flex items-center gap-2 text-xs">
                    <Hash size={12} className="text-primary shrink-0" />
                    <span className="text-muted-foreground">Hash:</span>
                    <span className="font-mono truncate">{block.hash}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Link2 size={12} className="text-primary shrink-0" />
                    <span className="text-muted-foreground">Prev:</span>
                    <span className="font-mono truncate">{block.previousHash}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Clock size={12} className="text-primary shrink-0" />
                    <span className="text-muted-foreground">Time:</span>
                    <span>{new Date(block.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">Proof:</span>{" "}
                    <span className="font-mono">{block.proof}</span>
                  </div>

                  {block.transactions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground">Transactions:</p>
                      {block.transactions.map((tx, i) => (
                        <div key={i} className="bg-secondary rounded-lg px-3 py-2 text-xs">
                          <span className="font-mono text-muted-foreground">{tx.sender.slice(0, 12)}</span>
                          <span className="text-primary mx-1">→</span>
                          <span className="font-mono text-muted-foreground">{tx.recipient.slice(0, 12)}</span>
                          <span className="text-success ml-2 font-semibold">{tx.amount} BTC</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
