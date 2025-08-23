import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || "Invalid credentials");
        setLoading(false);
        return;
      }

      // Expect backend to return { token, user? }
      if (!data?.token) {
        setError("Login response missing token");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard/cards", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError("Could not reach server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] grid place-items-center">
      <form onSubmit={onSubmit} className="w-full max-w-md card p-8 space-y-4">
        <h2 className="text-2xl font-semibold text-center">Welcome Back</h2>

        <div>
          <label className="text-sm">Email</label>
          <input
            className="mt-1 w-full input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="text-sm">Password</label>
          <input
            className="mt-1 w-full input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        {error && (
          <div className="text-sm rounded-lg border border-red-500/40 bg-red-500/10 text-red-400 px-3 py-2">
            {error}
          </div>
        )}

        <button className="btn btn-gold w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </button>

        <div className="text-center text-sm text-[var(--subtle)]">
          No account? <Link to="/signup" className="underline">Create one</Link>
        </div>
      </form>
    </div>
  );
}
