import { api } from "../lib/http";

export async function listGroups() {
  const r = await api.get("/api/chat/groups"); // 200 once cookie is set
  return r.data;
}

export async function updateGroup(id: string, patch: any) {
  const r = await api.patch(`/api/chat/groups/${id}`, patch);
  return r.data;
}
