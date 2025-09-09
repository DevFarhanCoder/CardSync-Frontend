import { authHeaders } from "@/lib/api";

export type UserLite = { id: string; name?: string; phone?: string; avatarUrl?: string | null; bio?: string | null; };
export type Group = { id: string; name: string; joinCode?: string; ownerId?: string; members?: UserLite[]; unreadCount?: number; lastMessageAt?: string; };

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}
async function post<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: authHeaders(), body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`${res.status} ${t || res.statusText}`);
  }
  return res.json();
}

export async function fetchAllGroups(): Promise<{ items: Group[] }> {
  return get<{ items: Group[] }>("/api/chat/groups");
}
export async function fetchGroupMembers(groupId: string): Promise<{ members: UserLite[] }> {
  return get<{ members: UserLite[] }>(`/api/chat/groups/${groupId}/members`);
}
export async function addMemberByPhone(groupId: string, phone: string) {
  return post<{ ok: boolean }>(`/api/chat/groups/${groupId}/members`, { phone });
}
export async function createGroup(name: string) {
  return post<{ group: Group }>(`/api/chat/groups`, { name });
}
export async function joinByCode(code: string) {
  return post<{ ok: boolean; id: string }>(`/api/chat/groups/join`, { code });
}
