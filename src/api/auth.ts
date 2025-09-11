import { api } from "../lib/http";

export async function login(email: string, password: string) {
  const r = await api.post("/api/auth/login", { email, password }); // Set-Cookie comes back
  return r.data;
}

export async function logout() {
  await api.post("/api/auth/logout");
}

export async function me() {
  const r = await api.get("/api/users/me"); // cookie automatically included
  return r.data;
}
