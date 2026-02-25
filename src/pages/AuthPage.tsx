import { useState } from "react";
import { TrendingUp } from "lucide-react";

interface AuthPageProps {
  onLogin: (username: string) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) onLogin(username.trim());
  };

  const inputClass = "w-full bg-input text-foreground px-4 py-3 rounded-lg outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
          <TrendingUp className="text-primary-foreground" size={24} />
        </div>
        <h1 className="text-2xl font-bold">ProTrade</h1>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className={inputClass}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className={inputClass}
        />
        <button
          type="submit"
          className="w-full py-3.5 rounded-lg font-bold bg-primary text-primary-foreground transition-all hover:brightness-110 animate-pulse-glow"
        >
          Login / Register
        </button>
      </form>

      <p className="text-muted-foreground text-sm mt-6">Demo account included • No KYC required</p>
    </div>
  );
}
