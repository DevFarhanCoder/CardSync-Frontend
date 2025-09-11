// src/lib/userApi.ts
// Typed API client for user/profile + direct chat

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
  return http<Me>("/users/me");
}

export async function updateMe(payload: {
  name?: string;
  phone?: string;
  about?: string;
}): Promise<Me> {
  return http<Me>("/users/me", { method: "PATCH", json: payload });
}

// optional alias used elsewhere
export const saveMe = updateMe;

export async function uploadAvatar(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append("avatar", file);
  // server returns { url: string }
  return http<{ url: string }>("/users/me/avatar", { form });
}

/* ------------------------------ Public user ----------------------------- */

export async function getUser(userId: string): Promise<UserLite> {
  return http<UserLite>(`/users/${encodeURIComponent(userId)}`);
}

// 🔹 Alias kept for compatibility with DirectChat.tsx and older code
export async function getUserPublic(userId: string): Promise<UserLite> {
  return getUser(userId);
}

/* --------------------------- Direct chat helpers ------------------------- */

export async function openDirect(userId: string): Promise<{ roomId: string }> {
  return http<{ roomId: string }>("/direct/open", { json: { userId } });
}
