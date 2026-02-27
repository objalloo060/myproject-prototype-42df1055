import { useState, useMemo } from "react";
import { Copy, LogOut, Download, User, Shield, Hash } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ProfilePageProps {
  username: string;
  balance: number;
  isDemo: boolean;
  onLogout: () => void;
}

function generateUID(username: string): string {
  const stored = localStorage.getItem("protradeUID");
  if (stored) return stored;

  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  const ts = Date.now().toString(36).toUpperCase();
  const uid = `UID-${random}${ts}`.substring(0, 16);
  localStorage.setItem("protradeUID", uid);
  return uid;
}

export default function ProfilePage({ username, balance, isDemo, onLogout }: ProfilePageProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const uid = useMemo(() => generateUID(username), [username]);

  const copyUID = async () => {
    try {
      await navigator.clipboard.writeText(uid);
      toast({ title: "UID copied to clipboard" });
    } catch {
      const ta = document.createElement("textarea");
      ta.value = uid;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      toast({ title: "UID copied to clipboard" });
    }
  };

  const exportData = () => {
    const data = {
      uid,
      username,
      balance,
      mode: isDemo ? "demo" : "real",
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `protrade_${uid}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Data exported" });
  };

  const handleSignOut = () => {
    localStorage.removeItem("protradeUID");
    onLogout();
    toast({ title: "Signed out successfully" });
  };

  return (
    <div className="animate-fade-in space-y-4">
      {/* Avatar & Name */}
      <div className="bg-card p-6 rounded-lg flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="text-primary" size={32} />
        </div>
        <h2 className="text-xl font-bold">{username}</h2>
        <span className="text-xs text-muted-foreground">
          {isDemo ? "Demo Account" : "Real Account"}
        </span>
      </div>

      {/* UID */}
      <div className="bg-card p-5 rounded-lg space-y-2">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Hash size={14} />
          <span>User ID</span>
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 font-mono text-sm bg-secondary px-3 py-2 rounded-lg truncate">
            {uid}
          </code>
          <button
            onClick={copyUID}
            className="shrink-0 p-2 rounded-lg bg-secondary text-foreground hover:bg-accent transition-colors"
          >
            <Copy size={16} />
          </button>
        </div>
      </div>

      {/* Balance */}
      <div className="bg-card p-5 rounded-lg">
        <p className="text-sm text-muted-foreground mb-1">Balance</p>
        <p className="text-2xl font-bold font-mono">
          {isDemo ? `${balance.toFixed(2)} DEMO` : `$${balance.toFixed(2)}`}
        </p>
      </div>

      {/* Security Info */}
      <div className="bg-card p-5 rounded-lg space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Shield size={14} />
          <span>Account Security</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Status</span>
          <span className="text-success font-medium">Active</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Mode</span>
          <span className="font-medium">{isDemo ? "Demo" : "Real"}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={exportData}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold bg-secondary text-foreground hover:bg-accent transition-colors"
        >
          <Download size={18} />
          Export Account Data
        </button>

        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold bg-destructive/15 text-destructive hover:bg-destructive/25 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        ) : (
          <div className="bg-card border border-destructive/30 p-4 rounded-lg space-y-3">
            <p className="text-sm text-center">Are you sure you want to sign out?</p>
            <div className="flex gap-3">
              <button
                onClick={handleSignOut}
                className="flex-1 py-3 rounded-lg font-semibold bg-destructive text-destructive-foreground hover:brightness-110"
              >
                Yes, Sign Out
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-lg font-semibold border border-border text-foreground hover:bg-accent"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
