import { useState, useCallback } from "react";
import { Link2, Hash, Clock, Pickaxe, ChevronDown, ChevronUp } from "lucide-react";

interface Transaction {
  sender: string;
  recipient: string;
  amount: number;
}

interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  proof: number;
  previousHash: string;
  hash: string;
}

function sha256Hex(input: string): string {
  // Simple deterministic hash for demo purposes
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) - h + input.charCodeAt(i)) | 0;
  }
  const hex = Math.abs(h).toString(16).padStart(8, "0");
  return (hex + hex + hex + hex + hex + hex + hex + hex).slice(0, 64);
}

function createGenesisBlock(): Block {
  const data = JSON.stringify({ index: 1, proof: 100, previousHash: "0" });
  return {
    index: 1,
    timestamp: Date.now() - 600000,
    transactions: [],
    proof: 100,
    previousHash: "0".repeat(64),
    hash: sha256Hex(data),
  };
}

function mineBlock(chain: Block[], transactions: Transaction[]): Block {
  const prev = chain[chain.length - 1];
  const index = prev.index + 1;
  let proof = 0;
  while (true) {
    const guess = `${prev.proof}${proof}`;
    const h = sha256Hex(guess);
    if (h.startsWith("0000")) break;
    proof++;
    if (proof > 50000) break; // safety cap
  }
  const blockData = JSON.stringify({ index, proof, previousHash: prev.hash });
  return {
    index,
    timestamp: Date.now(),
    transactions,
    proof,
    previousHash: prev.hash,
    hash: sha256Hex(blockData),
  };
}

const randomAddr = () =>
  "0x" + Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

export default function BlockchainPage() {
  const [chain, setChain] = useState<Block[]>([createGenesisBlock()]);
  const [mining, setMining] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [pendingTx, setPendingTx] = useState<Transaction[]>([]);
  const [txSender, setTxSender] = useState("");
  const [txRecipient, setTxRecipient] = useState("");
  const [txAmount, setTxAmount] = useState("");

  const addTransaction = () => {
    const amount = parseFloat(txAmount);
    if (!txSender.trim() || !txRecipient.trim() || !amount || amount <= 0) return;
    setPendingTx((prev) => [...prev, { sender: txSender.trim(), recipient: txRecipient.trim(), amount }]);
    setTxSender("");
    setTxRecipient("");
    setTxAmount("");
  };

  const handleMine = useCallback(() => {
    setMining(true);
    // Add a mining reward tx
    const txs: Transaction[] = [
      ...pendingTx,
      { sender: "NETWORK", recipient: randomAddr(), amount: 1 },
    ];
    setTimeout(() => {
      setChain((prev) => [...prev, mineBlock(prev, txs)]);
      setPendingTx([]);
      setMining(false);
    }, 800);
  }, [pendingTx]);

  const inputClass =
    "w-full bg-input text-foreground px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-primary text-sm font-mono";

  return (
    <div className="animate-fade-in space-y-4">
      <h2 className="text-center text-lg font-bold">⛓️ Blockchain Explorer</h2>

      {/* Add Transaction */}
      <div className="bg-card p-4 rounded-lg space-y-3">
        <h3 className="font-semibold text-sm">New Transaction</h3>
        <input value={txSender} onChange={(e) => setTxSender(e.target.value)} placeholder="Sender address" className={inputClass} />
        <input value={txRecipient} onChange={(e) => setTxRecipient(e.target.value)} placeholder="Recipient address" className={inputClass} />
        <input type="number" value={txAmount} onChange={(e) => setTxAmount(e.target.value)} placeholder="Amount" className={inputClass} />
        <button onClick={addTransaction} className="w-full py-2 rounded-lg font-semibold text-sm bg-primary text-primary-foreground hover:brightness-110 transition-all">
          Add to Pending
        </button>
        {pendingTx.length > 0 && (
          <p className="text-xs text-muted-foreground">{pendingTx.length} pending transaction(s)</p>
        )}
      </div>

      {/* Mine Button */}
      <button
        onClick={handleMine}
        disabled={mining}
        className="w-full py-3 rounded-lg font-bold bg-warning text-warning-foreground flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
      >
        <Pickaxe size={18} className={mining ? "animate-spin" : ""} />
        {mining ? "Mining..." : "Mine New Block"}
      </button>

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
                    <p className="text-xs text-muted-foreground font-mono truncate">{block.hash.slice(0, 20)}...</p>
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
                          <span className="font-mono text-muted-foreground">{tx.sender.slice(0, 10)}</span>
                          <span className="text-primary mx-1">→</span>
                          <span className="font-mono text-muted-foreground">{tx.recipient.slice(0, 10)}</span>
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
