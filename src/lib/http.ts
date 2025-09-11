// src/lib/http.ts
// Single tiny HTTP client with cold-start retries and JSON/Form helpers.
import axios from "axios";

type HttpOptions =
  & Omit<RequestInit, "body">
  & {
      json?: unknown;
      form?: FormData;
    };

// Optional absolute API base (recommended when frontend is on Vercel and backend on Render).
// Example in your .env: VITE_API_BASE=https://cardsync-backend.onrender.com/api
const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) || "/api";

// Internal fetch that retries when Render is waking and serves HTML/502/503.
async function apiFetch(url: string, init?: RequestInit) {
  let backoff = 700;
  for (let i = 0; i < 5; i++) {
    const res = await fetch(url, { credentials: "include", ...init });

    // If backend returned HTML (Render wake or 404 page), retry a bit.
    const ct = res.headers.get("content-type") || "";
    const looksLikeHtml = ct.includes("text/html");
    if ((res.status === 502 || res.status === 503 || looksLikeHtml) && i < 4) {
      await new Promise(r => setTimeout(r, backoff));
      backoff = Math.min(backoff * 1.6, 6000);
      continue;
    }
    return res;
  }
  throw new Error("Backend is starting. Try again.");
}

/** Main helper:
 *  http<T>("/users/me")                         -> GET JSON
 *  http<T>("/users/me", { method: "PATCH", json: {...} })
 *  http<T>("/upload",   { form })               -> multipart
 */
export async function http<T = any>(path: string, opts: HttpOptions = {}): Promise<T> {
  const url =
    API_BASE.endsWith("/")
      ? `${API_BASE}${path.replace(/^\//, "")}`
      : `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(opts.headers || {});
  const init: RequestInit = { credentials: "include" };

  // Attach body & method in a way that never reverts method to GET
  if (opts.json !== undefined) {
    headers.set("content-type", "application/json");
    init.body = JSON.stringify(opts.json);
    init.method = opts.method ?? "POST";
  } else if (opts.form) {
    init.body = opts.form;           // browser sets correct multipart boundary
    init.method = opts.method ?? "POST";
  } else {
    init.method = opts.method ?? "GET";
  }

  // Finally, merge any remaining options (without clobbering our method/body)
  for (const [k, v] of Object.entries(opts)) {
    if (k === "json" || k === "form" || k === "method" || k === "headers") continue;
    init[k] = v;
  }
  init.headers = headers;

  const res = await apiFetch(url, init);

  // Parse JSON or throw a typed error
  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    if (ct.includes("application/json")) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`${res.status} ${JSON.stringify(err)}`);
    }
    throw new Error(`${res.status} ${res.statusText}`);
  }
  if (ct.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  // If backend returned empty or other types.
  return undefined as unknown as T;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  withCredentials: true, // REQUIRED for auth cookie
});
