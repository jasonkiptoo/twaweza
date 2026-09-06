/**
 * DEPRECATED: Legacy contribution API
 * These functions use the old endpoints (/contributions/..., /admin/contributions/...)
 * 
 * NEW: Use dashboardApi.ts functions instead:
 * - getMyContributions() from dashboardApi
 * - getGroupContributions() from dashboardApi
 * - createContribution() from dashboardApi
 * - confirmContribution() from dashboardApi
 * - rejectContribution() from dashboardApi
 * 
 * This file is kept for backward compatibility during migration.
 * The backend supports both legacy and new endpoints.
 */

import { api, authHeaders } from "./api";
import { adaptContributionList } from "@/utils/adapters";

export interface AddContributionPayload {
  amount: number;
  method: "Mpesa" | "Bank" | "cash";
  reference?: string;
  phone?: string;
}

/**
 * @deprecated Use dashboardApi.createContribution() instead
 * Creates a contribution using the legacy endpoint
 */
export async function addContribution(
  token: string,
  payload: AddContributionPayload,
) {
  const { data } = await api.post("/contributions/add", payload, {
    headers: authHeaders(token),
  });
  return data;
}

/**
 * @deprecated Use dashboardApi.getMyContributions() instead
 * Gets user contributions using the legacy endpoint
 */
export async function getMyContributions(token: string, page = 1, limit = 5) {
  const { data } = await api.get("/contributions/my-contributions", {
    params: { page, limit },
    headers: authHeaders(token),
  });
  return adaptContributionList(data);
}

/**
 * @deprecated Use dashboardApi.getGroupContributions() instead
 * Gets admin contributions using the legacy endpoint
 */
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

/**
 * @deprecated Use dashboardApi.confirmContribution() instead
 * Approves a contribution using the legacy endpoint
 */
export async function approveContribution(
  token: string,
  contributionId: string,
) {
  return api.put(`/admin/contributions/approve/${contributionId}`, undefined, {
    headers: authHeaders(token),
  });
}

/**
 * @deprecated Use dashboardApi.rejectContribution() instead
 * Rejects a contribution using the legacy endpoint
 */
export async function rejectContribution(
  token: string,
  contributionId: string,
) {
  return api.put(`/admin/contributions/reject/${contributionId}`, undefined, {
    headers: authHeaders(token),
  });
}
