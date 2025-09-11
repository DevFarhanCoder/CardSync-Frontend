// src/lib/http.ts

/** Build a safe URL for our API:
 * - accepts absolute http(s) URLs
 * - if path starts with '/api/', use as-is (no double prefix)
 * - if path starts with '/', prefix with '/api'
 * - otherwise treat as relative segment and prefix '/api/'
 */
function buildUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/api/")) return path;
  if (path.startsWith("/")) return `/api${path}`;
  return `/api/${path}`;
}

/** Low-level fetch with Render cold-start retry (HTML splash / 502 / 503) */
async function fetchWithWarmup(url: string, init?: RequestInit) {
  let backoff = 800;
  for (let i = 0; i < 5; i++) {
    const res = await fetch(url, { credentials: "include", ...init });
    const ct = res.headers.get("content-type") || "";
    // success: JSON response
    if (res.ok && ct.includes("application/json")) return res;

    // Render waking up (HTML splash) or transient 502/503
    if (ct.includes("text/html") || res.status === 502 || res.status === 503) {
      await new Promise((r) => setTimeout(r, backoff));
      backoff = Math.min(backoff * 1.6, 6000);
      continue;
    }

    // propagate other errors
    throw res;
  }
  throw new Error("Backend is starting. Try again.");
}

/** Your existing API wrapper returning a Response */
export async function apiFetch(path: string, init?: RequestInit) {
  const url = buildUrl(path);
  return fetchWithWarmup(url, init);
}

/** Your existing helper that parses JSON */
export async function getJSON<T = any>(path: string, init?: RequestInit) {
  const res = await apiFetch(path, init);
  return (await res.json()) as T;
}

/** 🔹 New: Named `http` helper used by userApi.ts
 * Supports:
 *   http('/api/users/me')                       // GET
 *   http('/api/users/me', { json: {...} })     // POST (JSON body)
 *   http('/api/users/me', { method:'PATCH', json:{...} })
 *   http('/api/users/me/avatar', { form })     // POST multipart FormData
 */
export type HttpInit = RequestInit & { json?: any; form?: FormData };

export async function http<T = any>(path: string, init?: HttpInit): Promise<T> {
  const url = buildUrl(path);

  const headers: Record<string, string> = {};
  let body: BodyInit | undefined = init?.body;
  let method = init?.method;

  if (init?.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(init.json);
    method = method || "POST";
  } else if (init?.form instanceof FormData) {
    body = init.form; // browser sets boundary header
    method = method || "POST";
  } else if (!method) {
    method = body ? "POST" : "GET";
  }

  let res: Response;
  try {
    res = await fetchWithWarmup(url, {
      ...init,
      method,
      headers: { ...(init?.headers || {}), ...headers },
      body,
      credentials: "include",
    });
  } catch (e: any) {
    // if fetchWithWarmup threw a Response, convert to a readable error
    if (e instanceof Response) {
      const txt = await e.text();
      try {
        const j = txt ? JSON.parse(txt) : undefined;
        const msg = (j && (j.message || j.error)) || `${e.status} ${e.statusText}`;
        throw new Error(msg);
      } catch {
        throw new Error(`${e.status} ${e.statusText}`);
      }
    }
    throw e;
  }

  // parse JSON (or return raw text if not JSON)
  const raw = await res.text();
  try {
    return (raw ? JSON.parse(raw) : undefined) as T;
  } catch {
    return raw as unknown as T;
  }
}
