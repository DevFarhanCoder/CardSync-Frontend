// src/pages/auth/SignIn.tsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const API = import.meta.env.VITE_API_BASE_URL;

export default function SignIn() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!email.trim() || !password) {
      setErr("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API}/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErr(data?.error || "Invalid credentials");
        return; // ⛔️ do not set session or navigate on error
      }

      // ✅ success: persist session via context so navbar updates instantly
      setSession(data.token, data.user);

      // 🔁 continue any saved intent from Pricing
      const state = (location.state as any) || {};
      const intent = state.intent;
      if (intent?.type === "checkout" && intent?.planId) {
        navigate(`/dashboard/billing?plan=${encodeURIComponent(intent.planId)}`, { replace: true });
        return;
      }
      if (intent?.type === "start-free") {
        navigate("/dashboard", { replace: true });
        return;
      }

      // 🎯 default: go to profile dashboard
      navigate("/", { replace: true });
    } catch (_e) {
      setErr("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-[var(--bg)]">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-semibold text-center">Welcome Back</h1>
        <p className="text-center text-[var(--subtle)] mt-1">Sign in to manage your cards</p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div>
            <label className="text-sm">Email</label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              className="mt-1 w-full rounded-xl bg-[var(--muted)] border border-[var(--border)] px-3 py-2"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm">Password</label>
            <div className="mt-1 relative">
              <input
                type={showPw ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                className="w-full rounded-xl bg-[var(--muted)] border border-[var(--border)] px-3 py-2 pr-20"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded-lg border border-[var(--border)] bg-[var(--muted)]"
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {err && (
            <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-3 py-2">
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-gold w-full disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="flex items-center justify-between mt-3">
          <Link to="/forgot-password" className="text-sm text-[var(--gold)]">
            Forgot password?
          </Link>
        </div>

        <p className="text-center text-sm text-[var(--subtle)] mt-4">
          No account? <Link to="/signup" className="text-[var(--gold)]">Create one</Link>
        </p>
      </div>
    </div>
  );
}
