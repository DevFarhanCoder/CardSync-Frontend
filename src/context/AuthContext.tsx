// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type User = { id: string; name: string; email: string } | null;

type AuthCtx = {
  user: User;
  token: string | null;
  isAuthed: boolean;
  setSession: (token: string, user: NonNullable<User>) => void;
  clearSession: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (t && u) {
      setToken(t);
      try { setUser(JSON.parse(u)); } catch { setUser(null); }
    }
    // sync across tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === "token" || e.key === "user") {
        const nt = localStorage.getItem("token");
        const nu = localStorage.getItem("user");
        setToken(nt);
        setUser(nu ? JSON.parse(nu) : null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo<AuthCtx>(() => ({
    user,
    token,
    isAuthed: !!token && !!user,
    setSession: (t, u) => {
      localStorage.setItem("token", t);
      localStorage.setItem("user", JSON.stringify(u));
      setToken(t);
      setUser(u);
    },
    clearSession: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
    }
  }), [user, token]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
