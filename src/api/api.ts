// src/api/api.ts
// Single, self-contained client used everywhere (no other files required)

export const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, "") || "";

// Generic requester that sends/receives cookies for auth
async function request(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${msg || res.statusText}`);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : {};
}

// Export a neat namespace so you can call api.me(), api.login(), etc.
export const api = {
  // auth
  register: (body: { name?: string; email: string; password: string }) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  logout: () => request("/auth/logout", { method: "POST" }),

  // user
  me: () => request("/users/me"),

  // chat
  groups: () => request("/chat/groups"),
};

export type Api = typeof api;
