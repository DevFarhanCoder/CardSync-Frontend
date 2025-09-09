import { authHeaders } from "@/lib/api";

export type UserLite = {
  id: string;
  name?: string;
  phone?: string;
  avatarUrl?: string | null;
  bio?: string | null;
};

export type Group = {
  id: string;
  name: string;
  ownerId?: string;
  joinCode?: string;
  lastMessageText?: string | null;
  lastMessageAt?: string | null;
  members?: UserLite[]; // optional in list
};

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}
async function post<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`${res.status} ${t || res.statusText}`);
  }
  return res.json();
}

export const fetchAllGroups = () => get<{ items: Group[] }>("/api/chat/groups");
export const fetchGroupMembers = (id: string) =>
  get<{ ownerId: string; members: UserLite[] }>(`/api/chat/groups/${id}/members`);
export const addMemberByPhone = (id: string, phone: string) =>
  post<{ ok: boolean }>(`/api/chat/groups/${id}/members`, { phone });
export const createGroup = (name: string) =>
  post<{ group: Group }>(`/api/chat/groups`, { name });
export const joinByCode = (code: string) =>
  post<{ ok: boolean; id: string }>(`/api/chat/groups/join`, { code });
