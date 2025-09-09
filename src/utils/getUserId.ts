// src/utils/getUserId.ts
export type AnyUser =
  | { id?: string; _id?: string; userId?: string }
  | (Record<string, unknown> & {});

export function getUserId(u?: any): string {
  if (!u) return "";
  return (u.id || u._id || u.userId || "").toString();
}

