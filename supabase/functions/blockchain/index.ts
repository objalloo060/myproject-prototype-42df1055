import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Blockchain logic ────────────────────────────────────────────────────

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

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hashBlock(block: Record<string, unknown>): Promise<string> {
  const ordered = JSON.stringify(block, Object.keys(block).sort());
  return sha256(ordered);
}

async function validProof(lastProof: number, proof: number): Promise<boolean> {
  const guess = `${lastProof}${proof}`;
  const h = await sha256(guess);
  return h.startsWith("0000");
}

async function proofOfWork(lastProof: number): Promise<number> {
  let proof = 0;
  while (!(await validProof(lastProof, proof))) {
    proof++;
    if (proof > 500_000) break; // safety cap for serverless
  }
  return proof;
}

// In-memory chain (persists across warm invocations)
const chain: Block[] = [];
let pendingTransactions: Transaction[] = [];
const nodeId = crypto.randomUUID().replace(/-/g, "");

async function ensureGenesis() {
  if (chain.length === 0) {
    const genesisData = { index: 1, proof: 100, previousHash: "1", timestamp: Date.now(), transactions: [] };
    const hash = await hashBlock(genesisData as unknown as Record<string, unknown>);
    chain.push({
      index: 1,
      timestamp: Date.now(),
      transactions: [],
      proof: 100,
      previousHash: "1",
      hash,
    });
  }
}

// ── Handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  await ensureGenesis();

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  try {
    // GET chain
    if (action === "chain") {
      return new Response(
        JSON.stringify({ chain, length: chain.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST transaction
    if (action === "transaction" && req.method === "POST") {
      const { sender, recipient, amount } = await req.json();
      if (!sender || !recipient || !amount) {
        return new Response(JSON.stringify({ error: "Missing values" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      pendingTransactions.push({ sender, recipient, amount });
      return new Response(
        JSON.stringify({
          message: `Transaction will be added to Block ${chain[chain.length - 1].index + 1}`,
          pending: pendingTransactions.length,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET mine
    if (action === "mine") {
      const lastBlock = chain[chain.length - 1];
      const proof = await proofOfWork(lastBlock.proof);

      // Mining reward
      pendingTransactions.push({ sender: "NETWORK", recipient: nodeId.slice(0, 16), amount: 1 });

      const blockData = {
        index: lastBlock.index + 1,
        timestamp: Date.now(),
        transactions: [...pendingTransactions],
        proof,
        previousHash: lastBlock.hash,
      };

      const hash = await hashBlock(blockData as unknown as Record<string, unknown>);

      const newBlock: Block = { ...blockData, hash };
      chain.push(newBlock);
      pendingTransactions = [];

      return new Response(
        JSON.stringify({
          message: "New Block Mined",
          block: newBlock,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET pending
    if (action === "pending") {
      return new Response(
        JSON.stringify({ pending: pendingTransactions }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET validate
    if (action === "validate") {
      let valid = true;
      for (let i = 1; i < chain.length; i++) {
        if (chain[i].previousHash !== chain[i - 1].hash) {
          valid = false;
          break;
        }
        if (!(await validProof(chain[i - 1].proof, chain[i].proof))) {
          valid = false;
          break;
        }
      }
      return new Response(
        JSON.stringify({ valid, length: chain.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action. Use: chain, mine, transaction, pending, validate" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
