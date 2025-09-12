// src/components/ProtectedRoute.tsx
import React, { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { api } from "../api/api"; // ✅ correct relative path

export default function ProtectedRoute() {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .me()
      .then(() => { if (!cancelled) setOk(true); })
      .catch(() => { if (!cancelled) setOk(false); });

    return () => { cancelled = true; };
  }, []);

  if (ok === true) return <Outlet />;
  if (ok === false) return <Navigate to="/signin" replace />;
  return <div className="text-white p-6">Loading...</div>;
}
