import { api, authHeaders } from "./api";
import { adaptContributionList } from "@/utils/adapters";

export interface AddContributionPayload {
  amount: number;
  method: "Mpesa" | "Bank" | "cash";
  reference?: string;
  phone?: string;
}

export async function addContribution(
  token: string,
  payload: AddContributionPayload,
) {
  const { data } = await api.post("/contributions/add", payload, {
    headers: authHeaders(token),
  });
  return data;
}

export async function getMyContributions(token: string, page = 1, limit = 5) {
  const { data } = await api.get("/contributions/my-contributions", {
    params: { page, limit },
    headers: authHeaders(token),
  });
  return adaptContributionList(data);
}

export async function getAdminContributions(
  token: string,
  page = 1,
  limit = 20,
) {
  const { data } = await api.get("/admin/contributions", {
    params: { page, limit },
    headers: authHeaders(token),
  });
  return adaptContributionList(data);
}

export async function approveContribution(
  token: string,
  contributionId: string,
) {
  return api.put(`/admin/contributions/approve/${contributionId}`, undefined, {
    headers: authHeaders(token),
  });
}

export async function rejectContribution(
  token: string,
  contributionId: string,
) {
  return api.put(`/admin/contributions/reject/${contributionId}`, undefined, {
    headers: authHeaders(token),
  });
}
