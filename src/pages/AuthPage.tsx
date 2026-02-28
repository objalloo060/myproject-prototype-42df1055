import { useState } from "react";
import { TrendingUp, Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type AuthView = "login" | "register" | "forgot";

export default function AuthPage() {
  const [view, setView] = useState<AuthView>("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Forgot state
  const [forgotEmail, setForgotEmail] = useState("");

  const inputClass =
    "w-full bg-input text-foreground px-4 py-3 rounded-lg outline-none focus:ring-1 focus:ring-primary border border-border text-sm";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    setLoading(false);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername || !regEmail || !regPassword || !regConfirm) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (regPassword !== regConfirm) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (regPassword.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    if (!acceptTerms) {
      toast({ title: "Please accept the terms", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: regEmail,
      password: regPassword,
      options: {
        data: { username: regUsername },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email to confirm your account" });
      setView("login");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password reset email sent" });
      setView("login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
          <TrendingUp className="text-primary-foreground" size={24} />
        </div>
        <h1 className="text-2xl font-bold">ProTrade</h1>
      </div>

      <div className="w-full max-w-sm">
        {/* LOGIN */}
        {view === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">Welcome Back</h2>
              <p className="text-sm text-muted-foreground">Sign in to access your account</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@email.com"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass} pl-10 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setView("forgot")}
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-lg font-bold bg-primary text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button type="button" onClick={() => setView("register")} className="text-primary hover:underline">
                Create Account
              </button>
            </p>

            <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Lock size={12} /> Your UID is permanently assigned to your email
            </p>
          </form>
        )}

        {/* REGISTER */}
        {view === "register" && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">Create Account</h2>
              <p className="text-sm text-muted-foreground">Join us and start trading</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="Username"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="you@email.com"
                  className={`${inputClass} pl-10`}
                />
              </div>
              <p className="text-xs text-warning">⚠️ Your UID will be permanently assigned to this email</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass} pl-10 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass} pl-10 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="bg-card p-3 rounded-lg text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Password Requirements:</p>
              <ul className="space-y-0.5 list-disc list-inside">
                <li>At least 8 characters</li>
                <li>One uppercase letter</li>
                <li>One lowercase letter</li>
                <li>One number</li>
                <li>One special character (!@#$%^&*)</li>
              </ul>
            </div>

            <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 accent-primary"
              />
              I agree to the Terms of Service and Privacy Policy
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-lg font-bold bg-primary text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button type="button" onClick={() => setView("login")} className="text-primary hover:underline">
                Sign In
              </button>
            </p>

            <p className="text-center text-xs text-warning flex items-center justify-center gap-1">
              ⚠️ Your UID cannot be changed once assigned to your email
            </p>
          </form>
        )}

        {/* FORGOT PASSWORD */}
        {view === "forgot" && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">Reset Password</h2>
              <p className="text-sm text-muted-foreground">Enter your email to receive a reset link</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="you@email.com"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-lg font-bold bg-primary text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <p className="text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <button type="button" onClick={() => setView("login")} className="text-primary hover:underline">
                Sign In
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
