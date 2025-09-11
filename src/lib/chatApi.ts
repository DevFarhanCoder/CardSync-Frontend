// src/lib/chatApi.ts
// Chat/Groups API client used by GroupRightPanel and the Groups page.

import { http } from "@/lib/http";
export type { UserLite } from "@/lib/userApi";

export type Group = {
  id: string;
  name: string;
  joinCode?: string;
  ownerId: string;
  avatarUrl?: string;
  description?: string;
  membersCount?: number;
};

/* ------------------------------ Groups list ------------------------------ */

export async function listGroups(): Promise<Group[]> {
  return http<Group[]>("/chat/groups");
}

// alias to match existing imports in Chat.tsx
export async function fetchAllGroups(): Promise<Group[]> {
  return listGroups();
}

export async function createGroup(name: string): Promise<Group> {
  return http<Group>("/chat/groups", { method: "POST", json: { name } });
}

export async function joinGroup(code: string): Promise<Group> {
  return http<Group>("/chat/groups/join", { method: "POST", json: { code } });
}

// alias to match JoinGroupModal.tsx
export async function joinByCode(code: string): Promise<Group> {
  return joinGroup(code);
}

export async function leaveGroup(groupId: string): Promise<{ ok: true }> {
  return http<{ ok: true }>(
    `/chat/groups/${encodeURIComponent(groupId)}/leave`,
    { method: "POST" }
  );
}

/* ------------------------------ Group detail ----------------------------- */

export type GroupMembersResponse = {
  viewerId: string;
  viewerIsOwner: boolean;
  ownerId: string;
  admins: string[];
  members: import("@/lib/userApi").UserLite[];
  joinCode?: string;
  name?: string;
  description?: string;
};

// used by GroupRightPanel to populate the side panel
export async function fetchGroupMembers(
  groupId: string
): Promise<GroupMembersResponse> {
  return http<GroupMembersResponse>(
    `/chat/groups/${encodeURIComponent(groupId)}/members`
  );
}

// admins/owners can update name / description
export async function updateSettings(
  groupId: string,
  payload: Partial<Pick<Group, "name" | "description">>
): Promise<Group> {
  return http<Group>(`/chat/groups/${encodeURIComponent(groupId)}`, {
    method: "PATCH",
    json: payload,
  });
}

// upload group avatar/photo
export async function uploadGroupPhoto(
  groupId: string,
  file: File
): Promise<{ url: string }> {
  const form = new FormData();
  form.append("photo", file);
  return http<{ url: string }>(
    `/chat/groups/${encodeURIComponent(groupId)}/photo`,
    { form }
  );
}

/* ----------------------------- Member actions ---------------------------- */

export async function removeMember(
  groupId: string,
  userId: string
): Promise<{ ok: true }> {
  return http<{ ok: true }>(
    `/chat/groups/${encodeURIComponent(groupId)}/members/remove`,
    { method: "POST", json: { userId } }
  );
}

export async function toggleAdmin(
  groupId: string,
  userId: string
): Promise<{ isAdmin: boolean }> {
  return http<{ isAdmin: boolean }>(
    `/chat/groups/${encodeURIComponent(groupId)}/members/toggle-admin`,
    { method: "POST", json: { userId } }
  );
}

export async function addMemberByPhone(
  groupId: string,
  phone: string
): Promise<import("@/lib/userApi").UserLite> {
  return http<import("@/lib/userApi").UserLite>(
    `/chat/groups/${encodeURIComponent(groupId)}/members/add-by-phone`,
    { method: "POST", json: { phone } }
  );
}

export async function addMembersBulk(
  groupId: string,
  phones: string[]
): Promise<{ added: import("@/lib/userApi").UserLite[]; skipped?: string[] }> {
  return http<{ added: import("@/lib/userApi").UserLite[]; skipped?: string[] }>(
    `/chat/groups/${encodeURIComponent(groupId)}/members/bulk`,
    { method: "POST", json: { phones } }
  );
}

/* ---------------------------- Contacts (optional) ------------------------ */

export async function syncContacts(accessToken: string): Promise<{ imported: number }> {
  return http<{ imported: number }>(`/contacts/sync`, {
    method: "POST",
    json: { accessToken },
  });
}

/* ------------------------ Convenience re-exports ------------------------- */
export { updateSettings as updateGroupSettings };
