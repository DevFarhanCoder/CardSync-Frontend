import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function RequireAuth({ children }: { children: JSX.Element }) {
  const { loading, isAuthed } = useAuth();
  const location = useLocation();

  if (loading) return null;                           // wait until we know
  if (!isAuthed) return <Navigate to="/signin" replace state={{ from: location }} />;
  return children;
}

export function RequireAnon({ children }: { children: JSX.Element }) {
  const { loading, isAuthed } = useAuth();
  if (loading) return null;                           // wait until we know
  if (isAuthed) return <Navigate to="/dashboard" replace />;
  return children;
}
