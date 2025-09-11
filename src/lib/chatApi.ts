// src/lib/chatApi.ts
// Minimal chat API wrapper used by Groups UI

import { http } from "@/lib/http";

export type Group = {
  id: string;
  name: string;
  joinCode?: string;
  ownerId: string;
  avatarUrl?: string;
  description?: string;
  membersCount?: number;
};

export async function listGroups(): Promise<Group[]> {
  return http<Group[]>("/chat/groups");
}

export async function createGroup(name: string): Promise<Group> {
  return http<Group>("/chat/groups", { method: "POST", json: { name } });
}

export async function joinGroup(code: string): Promise<Group> {
  return http<Group>("/chat/groups/join", { method: "POST", json: { code } });
}

export async function leaveGroup(groupId: string): Promise<{ ok: true }> {
  return http<{ ok: true }>(`/chat/groups/${encodeURIComponent(groupId)}/leave`, {
    method: "POST"
  });
}

export async function updateGroupSettings(
  groupId: string,
  payload: Partial<Pick<Group, "name" | "description">>
): Promise<Group> {
  return http<Group>(`/chat/groups/${encodeURIComponent(groupId)}`, {
    method: "PATCH",
    json: payload
  });
}

export async function uploadGroupPhoto(
  groupId: string,
  file: File
): Promise<{ url: string }> {
  const form = new FormData();
  form.append("photo", file);
  return http<{ url: string }>(`/chat/groups/${encodeURIComponent(groupId)}/photo`, {
    form
  });
}
