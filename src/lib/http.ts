// Small fetch helper that (a) always hits /api/*, (b) retries Render cold starts,
// and (c) returns JSON or throws a readable error message.

export async function apiFetch(path: string, init?: RequestInit) {
  const url = `/api${path.startsWith("/") ? path : `/${path}`}`;

  // Always include cookies; rewrite keeps us same-origin on Vercel.
  const base: RequestInit = { credentials: "include" };

  let backoff = 800;
  for (let i = 0; i < 5; i++) {
    const res = await fetch(url, { ...base, ...init });
    const ct = res.headers.get("content-type") || "";

    // OK + JSON -> return; otherwise try to parse the JSON error if any.
    if (res.ok && ct.includes("application/json")) return res;

    // Render cold starts often return HTML/502/503 while waking.
    if (ct.includes("text/html") || res.status === 502 || res.status === 503) {
      await new Promise(r => setTimeout(r, backoff));
      backoff = Math.min(backoff * 1.6, 6000);
      continue;
    }

    try {
      const j = await res.json();
      throw new Error(`${res.status} ${JSON.stringify(j)}`);
    } catch {
      throw new Error(`${res.status} ${res.statusText}`);
    }
  }

  throw new Error("Backend is starting. Try again.");
}

export async function http<T = any>(
  path: string,
  opts?: {
    method?: string;
    json?: any;
    form?: FormData;
    signal?: AbortSignal;
  }
): Promise<T> {
  const init: RequestInit = { method: opts?.method || "GET", signal: opts?.signal };

  if (opts?.json) {
    init.method = init.method || "POST";
    init.headers = { ...(init.headers || {}), "content-type": "application/json" };
    init.body = JSON.stringify(opts.json);
  } else if (opts?.form) {
    init.method = init.method || "POST";
    init.body = opts.form; // browser sets boundary headers automatically
  }

  const res = await apiFetch(path, init);
  return res.json() as Promise<T>;
}
