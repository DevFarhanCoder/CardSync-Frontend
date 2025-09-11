import { apiFetch, getJSON } from "./http";

export type Me = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  about?: string;
  avatarUrl?: string;
  lastActive?: string;
};

export async function getMe() {
  return getJSON<Me>("/users/me");
}

export async function updateMe(input: Partial<Me>) {
  return getJSON<Me>("/users/me", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function uploadAvatar(file: File) {
  const fd = new FormData();
  fd.append("avatar", file);
  return getJSON<{ url: string }>("/users/me/avatar", {
    method: "POST",
    body: fd,
  });
}

export async function getUserPublic(id: string) {
  return getJSON<Me>(`/users/${id}`);
}
