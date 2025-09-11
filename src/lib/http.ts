export async function apiFetch(path: string, init?: RequestInit) {
  const url = `/api${path.startsWith("/") ? path : `/${path}`}`;
  let backoff = 800;
  for (let i = 0; i < 5; i++) {
    const res = await fetch(url, { credentials: "include", ...init });
    const ct = res.headers.get("content-type") || "";
    if (res.ok && ct.includes("application/json")) return res;

    // Render cold start returns HTML/502/503 while waking
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

export async function getJSON<T = any>(path: string, init?: RequestInit) {
  return (await apiFetch(path, init)).json() as Promise<T>;
}
