import { authHeaders } from "@/lib/api";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(path, { headers: { ...(await authHeaders()) } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}
async function post<T>(path: string, body?: any): Promise<T> {
  const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json", ...(await authHeaders()) }, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}
async function patch<T>(path: string, body?: any): Promise<T> {
  const res = await fetch(path, { method: "PATCH", headers: { "Content-Type": "application/json", ...(await authHeaders()) }, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

export const fetchMe = () => get<{ id: string; name: string; email: string; phone: string; bio: string; avatarUrl: string | null }>("/api/users/me");
export const updateMe = (data: { name?: string; phone?: string; bio?: string }) => patch<{ ok: boolean }>("/api/users/me", data);
export const uploadAvatar = async (file: File) => {
  const fd = new FormData(); fd.append("avatar", file);
  const res = await fetch("/api/users/me/avatar", { method: "POST", headers: { ...(await authHeaders()) }, body: fd });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json() as Promise<{ ok: boolean; avatarUrl: string }>;
};

export const openDirect = (userId: string) => post<{ id: string }>("/api/dm/open", { userId });
export const listDMs = () => get<{ items: Array<{ id: string; participants: string[]; lastMessageText: string | null; lastMessageAt: string | null }> }>("/api/dm");
