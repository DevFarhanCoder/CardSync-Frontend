import { api } from "../lib/http";

export async function getOverview() {
  const r = await api.get("/api/analytics/overview"); // note the /api prefix
  return r.data;
}
