// src/lib/userApi.ts

// -------- fetch helper --------
const API_BASE =
  (import.meta as any)?.env?.VITE_API_BASE ||
  (import.meta as any)?.env?.VITE_API_URL ||
  ""; // empty => same origin (proxied /api)

function makeUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;  // absolute
  if (path.startsWith("/")) return `${API_BASE}${path}`;
  return `${API_BASE}/api/${path}`;             // relative => /api/<path>
}

async function http<T = any>(
  path: string,
  init?: RequestInit & { json?: any; form?: FormData }
): Promise<T> {
  const headers: Record<string, string> = {};
  let body: BodyInit | undefined = init?.body;

  if (init?.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(init.json);
  } else if (init?.form instanceof FormData) {
    body = init.form; // browser sets boundary header
  }

  const res = await fetch(makeUrl(path), {
    method: init?.method || (init?.json || init?.form ? "POST" : "GET"),
    credentials: "include",
    headers: { ...headers, ...(init?.headers || {}) },
    body,
  });

  const raw = await res.text();
  let data: any = raw;
  try { data = raw ? JSON.parse(raw) : undefined; } catch {}

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return data as T;
}

// -------- Types --------
export type UserLite = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  about?: string;
  avatarUrl?: string;
  lastActive?: string | Date;
};

// Your code imports `type Me` from here:
export type Me = UserLite;

// -------- API calls --------

/** Get current user profile */
export async function getMe(): Promise<Me> {
  return http<Me>("/api/users/me");
}

/** Update current user profile (alias: saveMe) */
export async function updateMe(payload: {
  name?: string;
  phone?: string;
  about?: string;
}): Promise<Me> {
  return http<Me>("/api/users/me", { method: "PATCH", json: payload });
}

// keep backward-compat if somewhere `saveMe` was used
export const saveMe = updateMe;

/** Upload avatar for current user; returns { url } */
export async function uploadAvatar(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append("avatar", file);
  return http<{ url: string }>("/api/users/me/avatar", { form });
}

/** Public profile by id */
export async function getUser(userId: string): Promise<UserLite> {
  return http<UserLite>(`/api/users/${encodeURIComponent(userId)}`);
}

/** Open (or create) a direct chat with another user; returns { roomId } */
export async function openDirect(userId: string): Promise<{ roomId: string }> {
  return http<{ roomId: string }>("/api/direct/open", { json: { userId } });
}
