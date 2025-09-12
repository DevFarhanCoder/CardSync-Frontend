import React, { useState } from "react";
import { api } from "../../api/api";

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
      setErr(e?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1220] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl bg-gradient-to-b from-white/10 to-white/5 p-8 border border-white/10 shadow-xl">
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-white/10 grid place-items-center">
              <img src="/logo-192.png" alt="Instantlly" className="w-10 h-10 object-contain" />
            </div>
            <h1 className="text-white text-2xl font-semibold">Create your account</h1>
            <p className="text-white/60 text-sm">Start your free trial</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Full Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl bg-white/10 text-white placeholder-white/40 px-3 py-2 outline-none border border-white/10 focus:border-yellow-400/70"
                placeholder="Md. Farhaan"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl bg-white/10 text-white placeholder-white/40 px-3 py-2 outline-none border border-white/10 focus:border-yellow-400/70"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl bg-white/10 text-white placeholder-white/40 px-3 py-2 outline-none border border-white/10 focus:border-yellow-400/70"
                placeholder="min 6 characters"
              />
            </div>

            {err && <div className="text-sm text-red-300 bg-red-400/10 border border-red-400/30 rounded-lg px-3 py-2">{err}</div>}

            <button
              disabled={busy}
              className="w-full rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-2 transition disabled:opacity-60"
            >
              {busy ? "Creating..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-white/70 text-sm mt-5">
            Already have an account?{" "}
            <a href="/signin" className="text-yellow-300 hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
