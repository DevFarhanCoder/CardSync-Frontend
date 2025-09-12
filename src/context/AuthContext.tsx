import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

type User = { id?: string; email?: string; name?: string } | null;

type AuthContextShape = {
  loading: boolean;
  isAuthed: boolean;
  token: string | null;
  user: User;
  signIn: (token: string, user?: User) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextShape | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User>(null);
  const initedRef = useRef(false);

  // Initialize ONCE from localStorage
  useEffect(() => {
    if (initedRef.current) return;
    initedRef.current = true;

    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    setToken(t);
    setUser(u ? JSON.parse(u) : null);
    setLoading(false);
  }, []);

  const signIn = (t: string, u?: User) => {
    setToken(t);
    localStorage.setItem("token", t);
    if (u) {
      setUser(u);
      localStorage.setItem("user", JSON.stringify(u));
    }
  };

  const signOut = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const value = useMemo<AuthContextShape>(() => ({
    loading,
    isAuthed: !!token,
    token,
    user,
    signIn,
    signOut,
  }), [loading, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
