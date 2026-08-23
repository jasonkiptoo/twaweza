import { api, authHeaders } from "./api";
import type { Activity } from "@/types/member";
import { adaptActivityResponse } from "@/utils/adapters";

export async function getGroupActivity(token: string, page = 1, limit = 5) {
  const { data } = await api.get("/activity/get-group-activity", {
    params: { page, limit },
    headers: authHeaders(token),
  });
  return adaptActivityResponse(data);
}

export type ActivityResult = Activity;
