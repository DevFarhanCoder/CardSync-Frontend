// src/lib/api.ts
const RAW_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API_BASE = RAW_BASE.replace(/\/+$/, "");

export const api = (path = "") =>
  `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;

export const getToken = () => localStorage.getItem("token") || "";

/** Back-compat helper for older code (Chat.tsx etc.) */
export const authHeaders = () => {
  const token = getToken();
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
};

async function request(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(api(path), { ...init, headers});

  // Avoid JSON.parse on HTML error pages
  const text = await res.text();
  const ctype = res.headers.get("content-type") || "";
  const body = ctype.includes("application/json") && text ? JSON.parse(text) : text || null;

  if (!res.ok) {
    const message =
      (body && (body.message || (body.error && body.error.message))) ||
      res.statusText ||
      "Request failed";
    throw new Error(`${res.status} ${message}`);
  }
  return body;
}

export const getJson = (path: string) => request(path, { method: "GET" });
export const postJson = (path: string, body: unknown) =>
  request(path, { method: "POST", body: JSON.stringify(body) });
export const putJson = (path: string, body: unknown) =>
  request(path, { method: "PUT", body: JSON.stringify(body) });
export const del = (path: string) => request(path, { method: "DELETE" });
