// src/lib/api.ts
export const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL || "";

// Prefix every path with /api
export function api(path: string) {
  return `${API_BASE}/api${path}`;
}

// Only include Authorization when we truly have a token
export function authHeaders(token?: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}
