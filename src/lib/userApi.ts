// src/lib/userApi.ts

// Small, safe wrapper around fetch that works with or without a base API URL.
const API_BASE =
  (import.meta as any)?.env?.VITE_API_BASE ||
  (import.meta as any)?.env?.VITE_API_URL ||
  ""; // empty = same origin (Vercel/Netlify proxy or nginx)

function makeUrl(path: string): string {
  // allow absolute http(s) or same-origin absolute paths like "/api/users/me"
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return `${API_BASE}${path}`;
  // fall back to /api/<path>
  return `${API_BASE}/api/${path}`;
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
    body = init.form; // browser sets content-type with boundary
  }

  const res = await fetch(makeUrl(path), {
    method: init?.method || (init?.json || init?.form ? "POST" : "GET"),
    credentials: "include",
    headers: { ...headers, ...(init?.headers || {}) },
    body,
  });

  // Try to parse JSON; surface a readable error
  const text = await res.text();
  let data: any = undefined;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    // non-JSON; keep raw text
    data = text;
  }

  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `${res.status} ${res.statusText}`;
    throw new Error(message);
  }
  return data as T;
}

/* ---------- Types ---------- */

export type UserLite = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  about?: string;
  avatarUrl?: string;
  lastActive?: string | Date;
};

export type MeResponse = UserLite;

/* ---------- API calls ---------- */

/** Get current user (creates a stub if not present on the server). */
export async function getMe(): Promise<MeResponse> {
  return http<MeResponse>("/api/users/me");
}

/** Update current user fields. */
export async function saveMe(payload: {
  name?: string;
  phone?: string;
  about?: string;
}): Promise<MeResponse> {
  return http<MeResponse>("/api/users/me", {
    method: "PATCH",
    json: payload,
  });
}

/** Upload current user's avatar. Returns { url }. */
export async function uploadAvatar(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append("avatar", file);
  return http<{ url: string }>("/api/users/me/avatar", { form });
}

/** Fetch a public profile by id. */
export async function getUser(userId: string): Promise<UserLite> {
  return http<UserLite>(`/api/users/${encodeURIComponent(userId)}`);
}

/**
 * Open (or create) a direct chat with another user.
 * Backend route: POST /api/direct/open  -> { roomId: string }
 */
export async function openDirect(
  userId: string
): Promise<{ roomId: string }> {
  return http<{ roomId: string }>("/api/direct/open", {
    json: { userId },
  });
}
