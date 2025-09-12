import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../api/api";

type User = { id: string; email: string; name?: string };

type AuthCtx = {
  user: User | null;
  loading: boolean;
  isAuthed: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const me = await api.me();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (email: string, password: string) => {
    await api.login({ email, password });
    await refresh();
  };

  const register = async (name: string, email: string, password: string) => {
    await api.register({ name, email, password });
    await refresh();
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const value: AuthCtx = {
    user,
    loading,
    isAuthed: !!user,
    login,
    register,
    logout,
    refresh,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
