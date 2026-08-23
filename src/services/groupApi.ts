import { api, authHeaders } from "./api";
import type { GroupDetails } from "@/types/member";

export async function getGroupDetails(token: string): Promise<GroupDetails> {
  const { data } = await api.get<{ success?: boolean; group?: GroupDetails }>(
    "/groups/get-group-details",
    { headers: authHeaders(token) },
  );
  const group = data.group;
  if (!group)
    throw new Error("The group response did not include group details.");
  return { ...group, id: group.id ?? group._id ?? "" };
}
