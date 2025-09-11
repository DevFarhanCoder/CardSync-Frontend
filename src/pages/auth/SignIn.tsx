// src/pages/auth/SignIn.tsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data?.message || "Invalid credentials");
        return;
      }
      if (data?.token) signIn(data.token, data.user);
      const redirect = (location.state as any)?.from?.pathname || "/dashboard";
      navigate(redirect, { replace: true });
    } catch {
      setErr("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b1220] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-yellow-500 mx-auto mb-4" />
        <h1 className="text-center text-xl font-semibold mb-1">Welcome back</h1>
        <p className="text-center text-sm text-white/60 mb-6">Sign in to manage your cards & analytics.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-yellow-400/50"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-yellow-400/50"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {err && <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{err}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl px-4 py-3 font-medium bg-yellow-500 text-black hover:bg-yellow-600 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <div className="text-center text-sm text-white/70">
            No account? <Link className="text-yellow-400 hover:text-yellow-300" to="/signup">Create one</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
