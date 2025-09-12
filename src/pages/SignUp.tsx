import React, { useState } from "react";
import { api } from "../lib/api";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await api.register({ name, email, password });
      window.location.href = "/dashboard";
    } catch (e: any) {
      setErr(e?.message?.startsWith("502") ? "Error 502" : e?.message || "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 p-8 bg-white/5 shadow-xl">
        <div className="mx-auto mb-6 w-16 h-16 rounded-full grid place-items-center bg-yellow-500/15">
          <img src="/logo-192.png" alt="Instantlly" className="w-10 h-10 object-contain" />
        </div>
        <h2 className="text-xl font-semibold text-center">Create Your Account</h2>
        <p className="text-sm text-white/60 text-center mb-6">Start your free trial</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Full Name</label>
            <input
              className="w-full rounded-lg bg-white/10 px-3 py-2 outline-none"
              value={name} onChange={e => setName(e.target.value)} required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              className="w-full rounded-lg bg-white/10 px-3 py-2 outline-none"
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              className="w-full rounded-lg bg-white/10 px-3 py-2 outline-none"
              type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required
            />
          </div>

          {err && <div className="text-xs text-red-400 rounded-md px-3 py-2 bg-red-400/10">{err}</div>}

          <button
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg py-2 disabled:opacity-50"
            disabled={busy}
          >
            {busy ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Already have an account? <a href="/signin" className="text-yellow-400 hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}