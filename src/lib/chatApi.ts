import { authHeaders } from "@/lib/api";

export type UserLite = {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  avatarUrl?: string | null;
  bio?: string | null;
  isAdmin?: boolean;
};

export type Group = {
  id: string;
  name: string;
  ownerId?: string;
  joinCode?: string;
  lastMessageText?: string | null;
  lastMessageAt?: string | null;
  photoUrl?: string | null;
};

async function get<T>(path: string): Promise<T> {
  const res = await fetch(path, { headers: { ...(await authHeaders()) } });
  if (!res.ok) {
    let t = "";
    try { t = await res.text(); } catch {}
    throw new Error(`${res.status} ${t || res.statusText}`);
  }
  return res.json();
}

async function post<T>(path: string, body?: any): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let t = "";
    try { t = await res.text(); } catch {}
    throw new Error(`${res.status} ${t || res.statusText}`);
  }
  return res.json();
}

async function patch<T>(path: string, body?: any): Promise<T> {
  const res = await fetch(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let t = "";
    try { t = await res.text(); } catch {}
    throw new Error(`${res.status} ${t || res.statusText}`);
  }
  return res.json();
}

export const fetchAllGroups = () => get<{ items: Group[] }>("/api/chat/groups");
export const fetchGroupMembers = (id: string) =>
  get<{
      viewerId(viewerId: any): unknown;
      viewerIsOwner: any; ownerId: string; admins: string[]; members: UserLite[]; joinCode: string; name: string; description: string; photoUrl: string | null 
}>(`/api/chat/groups/${id}/members`);
export const addMemberByPhone = (id: string, phone: string) =>
  post<{ ok: boolean }>(`/api/chat/groups/${id}/members`, { phone });
export const addMembersBulk = (id: string, phones: string[]) =>
  post<{ ok: boolean; added: number }>(`/api/chat/groups/${id}/members/bulk`, { phones });
export const createGroup = (name: string) =>
  post<{ group: Group }>(`/api/chat/groups`, { name });
export const joinByCode = (code: string) =>
  post<{ ok: boolean; id: string }>(`/api/chat/groups/join`, { code });
export const removeMember = (id: string, userId: string) =>
  post<{ ok: boolean }>(`/api/chat/groups/${id}/members/remove`, { userId });
export const toggleAdmin = (id: string, userId: string, makeAdmin: boolean) =>
  post<{ ok: boolean }>(`/api/chat/groups/${id}/admins`, { userId, action: makeAdmin ? "add" : "remove" });
export const updateSettings = (id: string, data: { name?: string; description?: string }) =>
  patch<{ ok: boolean }>(`/api/chat/groups/${id}/settings`, data);
export const uploadGroupPhoto = async (id: string, file: File) => {
  const fd = new FormData();
  fd.append("photo", file);
  const res = await fetch(`/api/chat/groups/${id}/photo`, {
    method: "POST",
    headers: { ...(await authHeaders()) },
    body: fd,
  });
  if (!res.ok) {
    let t = "";
    try { t = await res.text(); } catch {}
    throw new Error(`${res.status} ${t || res.statusText}`);
  }
  return res.json() as Promise<{ ok: boolean; photoUrl: string }>;
};

export const syncContacts = (contacts: Array<{ email?: string; phone?: string; name?: string }>) =>
  post<{ matches: Array<{ userId: string; email: string; name: string; phone?: string }> }>(`/api/contacts/sync`, { contacts });


export const leaveGroup = (id: string) =>
  post<{ ok: boolean }>(`/api/chat/groups/${id}/leave`);
