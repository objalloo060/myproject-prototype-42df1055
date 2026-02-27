import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
};

// ── Rate Limiting ───────────────────────────────────────────────────────

interface RateEntry {
  count: number;
  resetAt: number;
}

const rateLimits: Record<string, Record<string, RateEntry>> = {};

function checkRateLimit(
  ip: string,
  action: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  if (!rateLimits[action]) rateLimits[action] = {};
  const entry = rateLimits[action][ip];

  if (!entry || now > entry.resetAt) {
    rateLimits[action][ip] = { count: 1, resetAt: now + windowMs };
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count };
}

// ── Input Validation ────────────────────────────────────────────────────

function sanitize(input: string): string {
  return input.replace(/[<>&"']/g, "").trim().slice(0, 100);
}

function validateAddress(addr: string): boolean {
  return typeof addr === "string" && addr.trim().length >= 1 && addr.trim().length <= 100 && /^[a-zA-Z0-9_\-.:]+$/.test(addr.trim());
}

function validateAmount(amount: unknown): { valid: boolean; value: number; error?: string } {
  const num = typeof amount === "number" ? amount : parseFloat(String(amount));
  if (isNaN(num)) return { valid: false, value: 0, error: "Amount must be a number" };
  if (num <= 0) return { valid: false, value: 0, error: "Amount must be positive" };
  if (num > 1_000_000) return { valid: false, value: 0, error: "Amount exceeds maximum (1,000,000)" };
  // Max 8 decimal places
  const rounded = Math.round(num * 1e8) / 1e8;
  return { valid: true, value: rounded };
}

// ── Blockchain logic ────────────────────────────────────────────────────

interface Transaction {
  sender: string;
  recipient: string;
  amount: number;
  transactionId: string;
  timestamp: number;
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
    chain.push({ index: 1, timestamp: Date.now(), transactions: [], proof: 100, previousHash: "1", hash });
  }
}

// Rate limit configs per action
const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  mine: { max: 10, windowMs: 60_000 },
  transaction: { max: 50, windowMs: 60_000 },
  chain: { max: 60, windowMs: 60_000 },
  pending: { max: 60, windowMs: 60_000 },
  validate: { max: 20, windowMs: 60_000 },
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ── Handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  await ensureGenesis();

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  if (!action || !["chain", "mine", "transaction", "pending", "validate"].includes(action)) {
    return jsonResponse({ error: "Unknown action. Use: chain, mine, transaction, pending, validate" }, 400);
  }

  // Rate limiting by IP (or fallback)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = RATE_LIMITS[action];
  const { allowed, remaining } = checkRateLimit(ip, action, limit.max, limit.windowMs);

  if (!allowed) {
    return jsonResponse({ error: "Rate limit exceeded. Try again later." }, 429);
  }

  try {
    // GET chain
    if (action === "chain") {
      return jsonResponse({ chain, length: chain.length });
    }

    // POST transaction
    if (action === "transaction") {
      if (req.method !== "POST") {
        return jsonResponse({ error: "POST required for transactions" }, 405);
      }

      let body: Record<string, unknown>;
      try {
        body = await req.json();
      } catch {
        return jsonResponse({ error: "Invalid JSON body" }, 400);
      }

      const { sender, recipient, amount } = body;

      if (typeof sender !== "string" || typeof recipient !== "string") {
        return jsonResponse({ error: "Sender and recipient must be strings" }, 400);
      }

      if (!validateAddress(sender)) {
        return jsonResponse({ error: "Invalid sender address. Use alphanumeric characters only (1-100 chars)." }, 400);
      }
      if (!validateAddress(recipient)) {
        return jsonResponse({ error: "Invalid recipient address. Use alphanumeric characters only (1-100 chars)." }, 400);
      }

      const amountCheck = validateAmount(amount);
      if (!amountCheck.valid) {
        return jsonResponse({ error: amountCheck.error }, 400);
      }

      // Cap pending pool
      if (pendingTransactions.length >= 100) {
        return jsonResponse({ error: "Transaction pool is full. Mine a block first." }, 429);
      }

      const tx: Transaction = {
        sender: sanitize(sender),
        recipient: sanitize(recipient),
        amount: amountCheck.value,
        transactionId: crypto.randomUUID(),
        timestamp: Date.now(),
      };

      pendingTransactions.push(tx);

      return jsonResponse({
        message: `Transaction will be added to Block ${chain[chain.length - 1].index + 1}`,
        transactionId: tx.transactionId,
        pending: pendingTransactions.length,
      });
    }

    // GET mine
    if (action === "mine") {
      const lastBlock = chain[chain.length - 1];
      const proof = await proofOfWork(lastBlock.proof);

      // Mining reward
      pendingTransactions.push({
        sender: "NETWORK",
        recipient: nodeId.slice(0, 16),
        amount: 1,
        transactionId: crypto.randomUUID(),
        timestamp: Date.now(),
      });

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

      return jsonResponse({ message: "New Block Mined", block: newBlock });
    }

    // GET pending
    if (action === "pending") {
      return jsonResponse({ pending: pendingTransactions, count: pendingTransactions.length });
    }

    // GET validate
    if (action === "validate") {
      let valid = true;
      for (let i = 1; i < chain.length; i++) {
        if (chain[i].previousHash !== chain[i - 1].hash) { valid = false; break; }
        if (!(await validProof(chain[i - 1].proof, chain[i].proof))) { valid = false; break; }
      }
      return jsonResponse({ valid, length: chain.length });
    }

    return jsonResponse({ error: "Unhandled action" }, 400);
  } catch (err) {
    console.error("Blockchain error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
