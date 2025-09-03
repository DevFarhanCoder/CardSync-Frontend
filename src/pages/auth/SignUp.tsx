// src/pages/auth/SignUp.tsx
import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

/* -------- API base: use VITE_API_BASE_URL if set, else relative (for Vite proxy/Vercel) -------- */
const RAW = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined;
const BASE = (RAW ?? "").replace(/\/$/, "");
const apiUrl = (path: string) => {
  const p = path.startsWith("/") ? path : `/${path}`;
  return BASE ? `${BASE}${p}` : p;
};

export default function SignUp() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => name.trim().length > 1 && /\S+@\S+\.\S+/.test(email) && password.length >= 6 && !loading,
    [name, email, password, loading]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setErr(null);
    setLoading(true);

    try {
      // 🔁 endpoint fixed: register (not signup)
      const res = await fetch(apiUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await res.json() : {};

      if (!res.ok) {
        const msg =
          (data as any)?.message ||
          (data as any)?.error ||
          (res.status === 409 ? "Email already in use" : `Error ${res.status}`);
        setErr(msg);
        return;
      }

      // Optionally auto-login if your API returns token on register; if not, redirect to /signin
      const token = (data as any)?.token as string | undefined;
      if (token) localStorage.setItem("token", token);
      if ((data as any)?.user) localStorage.setItem("user", JSON.stringify((data as any).user));

      navigate(token ? "/dashboard/cards" : "/signin", { replace: true });
    } catch {
      setErr("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b1220] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold">Create Your Account</h1>
          <p className="text-white/60 text-sm">Start your free trial</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Full Name</label>
            <input
              type="text"
              placeholder="John Carter"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-yellow-400/50"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-yellow-400/50"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-yellow-400/50"
            />
            <p className="mt-1 text-xs text-white/50">At least 6 characters.</p>
          </div>

          {err && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full rounded-xl px-4 py-3 font-medium transition
              ${canSubmit
                ? "bg-yellow-500 text-black hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500/30"
                : "bg-white/10 text-white/50 cursor-not-allowed"}`}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/70">
          Already have an account?{" "}
          <Link to="/signin" className="text-yellow-400 hover:text-yellow-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
