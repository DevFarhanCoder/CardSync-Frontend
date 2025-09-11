// src/lib/userApi.ts
// Small typed API client for user/profile + direct chat

import { http } from "@/lib/http";

export type UserLite = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  about?: string;
  avatarUrl?: string;
  lastActive?: string | Date;
};

export type Me = UserLite;

/* ----------------------------- Me / Profile ----------------------------- */

export async function getMe(): Promise<Me> {
  return http<Me>("/api/users/me");
}

export async function updateMe(payload: {
  name?: string;
  phone?: string;
  about?: string;
}): Promise<Me> {
  return http<Me>("/api/users/me", { method: "PATCH", json: payload });
}

// optional alias used elsewhere
export const saveMe = updateMe;

export async function uploadAvatar(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append("avatar", file);
  // server returns { url: string }
  return http<{ url: string }>("/api/users/me/avatar", { form });
}

/* ------------------------------ Public user ----------------------------- */

export async function getUser(userId: string): Promise<UserLite> {
  return http<UserLite>(`/api/users/${encodeURIComponent(userId)}`);
}

// 🔹 Alias kept for compatibility with DirectChat.tsx
export async function getUserPublic(userId: string): Promise<UserLite> {
  return getUser(userId);
}

/* --------------------------- Direct chat helpers ------------------------- */

export async function openDirect(
  userId: string
): Promise<{ roomId: string }> {
  return http<{ roomId: string }>("/api/direct/open", { json: { userId } });
}
