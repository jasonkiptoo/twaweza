import type { GroupDetails } from "@/types/member";
import { api, authHeaders } from "./api";

export async function getGroupDetails(token: string): Promise<GroupDetails> {
  const { data } = await api.get<
    (GroupDetails & { group?: GroupDetails }) | { group?: GroupDetails }
  >("/auth/group-details", { headers: authHeaders(token) });
  const group = data.group ?? ("id" in data ? data : undefined);
  if (!group)
    throw new Error("The group response did not include group details.");
  return { ...group, id: group.id ?? group._id ?? "" };
}

export type BankAccount = NonNullable<GroupDetails["banks"]>[number];

export async function getBankInformation(
  token: string,
): Promise<BankAccount[]> {
  const { data } = await api.get<{ banks: BankAccount[] }>(
    "/groups/bank-information",
    { headers: authHeaders(token) },
  );
  return data.banks ?? [];
}

export async function updateBankInformation(
  token: string,
  banks: BankAccount[],
): Promise<BankAccount[]> {
  const { data } = await api.put<{ banks: BankAccount[] }>(
    "/groups/bank-information",
    { banks },
    { headers: authHeaders(token) },
  );
  return data.banks ?? [];
}
