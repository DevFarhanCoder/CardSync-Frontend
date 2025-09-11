// src/lib/chatApi.ts
// Chat/Groups API client used by GroupRightPanel and the Groups list.

import { http } from "@/lib/http";
export type { UserLite } from "@/lib/userApi"; // re-export so panels can import the type from here

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

export async function createGroup(name: string): Promise<Group> {
  return http<Group>("/chat/groups", { method: "POST", json: { name } });
}

export async function joinGroup(code: string): Promise<Group> {
  return http<Group>("/chat/groups/join", { method: "POST", json: { code } });
}

// 🔹 Alias used by JoinGroupModal.tsx
export async function joinByCode(code: string): Promise<Group> {
  return joinGroup(code);
}

export async function leaveGroup(groupId: string): Promise<{ ok: true }> {
  return http<{ ok: true }>(`/chat/groups/${encodeURIComponent(groupId)}/leave`, {
    method: "POST",
  });
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

// used by GroupRightPanel to populate the side sheet
export async function fetchGroupMembers(groupId: string): Promise<GroupMembersResponse> {
  return http<GroupMembersResponse>(`/chat/groups/${encodeURIComponent(groupId)}/members`);
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

// remove a member from group
export async function removeMember(groupId: string, userId: string): Promise<{ ok: true }> {
  return http<{ ok: true }>(
    `/chat/groups/${encodeURIComponent(groupId)}/members/remove`,
    { method: "POST", json: { userId } }
  );
}

// toggle admin for a member
export async function toggleAdmin(
  groupId: string,
  userId: string
): Promise<{ isAdmin: boolean }> {
  return http<{ isAdmin: boolean }>(
    `/chat/groups/${encodeURIComponent(groupId)}/members/toggle-admin`,
    { method: "POST", json: { userId } }
  );
}

// add a member by phone
export async function addMemberByPhone(
  groupId: string,
  phone: string
): Promise<import("@/lib/userApi").UserLite> {
  return http<import("@/lib/userApi").UserLite>(
    `/chat/groups/${encodeURIComponent(groupId)}/members/add-by-phone`,
    { method: "POST", json: { phone } }
  );
}

// add multiple members by phone
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
/**
 * Some parts of the UI import `syncContacts` from chatApi. If your backend
 * exposes a contacts sync endpoint (e.g. Google People import), wire it here.
 * This implementation posts an OAuth access token to your server; adjust the
 * path/shape if your endpoint differs or remove from the UI if unused.
 */
export async function syncContacts(accessToken: string): Promise<{ imported: number }> {
  return http<{ imported: number }>(`/contacts/sync`, {
    method: "POST",
    json: { accessToken },
  });
}

/* ------------------------ Convenience re-exports ------------------------- */
// (Kept for compatibility with other files that may import these names)
export { updateSettings as updateGroupSettings };
