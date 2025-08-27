// src/pages/SignIn.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

/* -------------------- inline icons (no extra deps) -------------------- */
const MailIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <path strokeWidth="1.5" d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z" />
    <path strokeWidth="1.5" d="m3.5 7 7.3 5.1a2 2 0 0 0 2.4 0L20.5 7" />
  </svg>
);
const LockIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <rect x="4" y="10" width="16" height="10" rx="2" strokeWidth="1.5" />
    <path strokeWidth="1.5" d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);
const EyeIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <path strokeWidth="1.5" d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
  </svg>
);
const EyeOffIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <path strokeWidth="1.5" d="M3 3l18 18" />
    <path strokeWidth="1.5" d="M10.6 10.6A3 3 0 0 0 12 15c3.5 0 6.5-3 8-5-.6-.7-1.3-1.5-2.2-2.2M6.3 6.3C4.4 7.7 3 9.5 3 12c.6.7 1.3 1.5 2.2 2.2M9 5.5c1-.3 2-.5 3-.5 6.5 0 10 6 10 6a17.6 17.6 0 0 1-2.5 2.9" />
  </svg>
);
const Spinner = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" className={p.className}>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
  </svg>
);

/* -------------------- API base helper -------------------- */
/** If VITE_API_BASE_URL exists, use it. Otherwise hit relative path (for Vercel rewrite). */
const RAW = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined;
const BASE = (RAW ?? "").replace(/\/$/, "");
const apiUrl = (path: string) => {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (BASE) return `${BASE}${p}`;
  return p; // relative to current origin
};

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(() => localStorage.getItem("remember_email") || "");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(!!localStorage.getItem("remember_email"));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(
    () => /\S+@\S+\.\S+/.test(email) && password.length >= 6 && !loading,
    [email, password, loading]
  );

  useEffect(() => {
    document.title = "Sign in • CardSync";
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setLoading(true);

    try {
      // IMPORTANT: backend is mounted at /api
      const res = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // If you're using cookie-based auth, uncomment the next line and ensure CORS allows credentials:
        // credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const ct = res.headers.get("content-type") || "";
      const payload = ct.includes("application/json") ? await res.json() : {};

      if (!res.ok) {
        if (res.status === 405) {
          setError("Login endpoint does not accept POST (405). Check backend route or Vercel rewrite.");
        } else {
          setError((payload as any)?.message || `Error ${res.status}`);
        }
        return;
      }

      const token = (payload as any)?.token as string | undefined;
      if (!token) {
        setError("Login response missing token");
        return;
      }

      localStorage.setItem("token", token);
      if ((payload as any)?.user) {
        localStorage.setItem("user", JSON.stringify((payload as any).user));
      }

      if (remember) localStorage.setItem("remember_email", email);
      else localStorage.removeItem("remember_email");

      navigate("/dashboard/cards", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError("Could not reach server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-[#0b0f14] text-white">
      {/* background flair */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-yellow-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="mx-auto grid min-h-[100svh] max-w-7xl place-items-center px-4">
        <form
          onSubmit={onSubmit}
          className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] backdrop-blur"
        >
          <div className="absolute -inset-px rounded-2xl ring-1 ring-white/10 pointer-events-none" />

          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 shadow-lg" />
            <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
            <p className="mt-1 text-sm text-white/60">Sign in to manage your cards and analytics.</p>
          </div>

          <label className="block text-sm text-white/80">Email</label>
          <div className="mt-1 relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
              <MailIcon className="h-4 w-4" />
            </span>
            <input
              autoFocus
              className="mt-0 w-full rounded-xl border border-white/10 bg-[#0d1218] pl-10 pr-3 py-2.5 outline-none transition focus:border-yellow-500/60 focus:ring-2 focus:ring-yellow-500/20"
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm text-white/80">Password</label>
            <div className="mt-1 relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                <LockIcon className="h-4 w-4" />
              </span>
              <input
                className="mt-0 w-full rounded-xl border border-white/10 bg-[#0d1218] pl-10 pr-10 py-2.5 outline-none transition focus:border-yellow-500/60 focus:ring-2 focus:ring-yellow-500/20"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <label className="flex select-none items-center gap-2 text-sm text-white/70">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-transparent text-yellow-500 focus:ring-yellow-500/30"
              />
              Remember me
            </label>
            <Link to="/forgot" className="text-sm text-yellow-400 hover:text-yellow-300">
              Forgot password?
            </Link>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className={`mt-4 w-full rounded-xl px-4 py-2.5 font-medium transition
              ${canSubmit
                ? "bg-yellow-500 text-black hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500/30"
                : "bg-white/10 text-white/50 cursor-not-allowed"
              }`}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Spinner className="h-5 w-5 animate-spin" /> Signing in…
              </span>
            ) : (
              "Sign In"
            )}
          </button>

          <div className="my-5 flex items-center gap-3 text-xs text-white/40">
            <div className="h-px flex-1 bg-white/10" />
            <span>or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="text-center text-sm text-white/70">
            No account?{" "}
            <Link to="/signup" className="text-yellow-400 hover:text-yellow-300">
              Create one
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
