// src/lib/api.ts
// If VITE_API_BASE_URL is set (e.g. local dev http://localhost:8080) use it.
// In Vercel, leave it UNSET so we use a relative "/api/..." and go through the proxy.
const RAW = (import.meta as any)?.env?.VITE_API_BASE_URL || "";
const BASE = RAW.replace(/\/$/, "");

export function api(path: string) {
  const p = path.startsWith("/api/") ? path : `/api${path.startsWith("/") ? path : `/${path}`}`;
  return BASE ? `${BASE}${p}` : p;
}
