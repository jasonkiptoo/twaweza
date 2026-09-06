/**
 * Dashboard API Service
 * Handles requests for dashboard data, financial summaries, and contribution management
 * Base URL: /api/v1/credit-management
 */

import type {
  Contribution,
  GroupContribution,
} from "@/types/creditManagement";
import type { DashboardSummary } from "@/types/creditManagement";
import { api, authHeaders } from "./api";
import { adaptContributionList } from "@/utils/adapters";

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface UserSummaryResponse {
  userId?: string;
  groupId?: string;
  userContributions?: {
    total?: number;
    approved?: number;
    pending?: number;
  };
  loans?: {
    active?: number;
    totalActive?: number;
    dueForRepayment?: number;
  };
  contributionStatus?: string;
}

/**
 * Build the dashboard model from the backend's existing user summary route.
 * Group details remain available through groupApi and are not fabricated here.
 */
export async function getDashboardSummary(token: string): Promise<DashboardSummary> {
  const { data } = await api.get<UserSummaryResponse>("/auth/user-summary", {
    headers: authHeaders(token),
  });
  const contributions = data.userContributions ?? {};
  const loans = data.loans ?? {};
  return {
    user: { id: data.userId ?? "", name: "" },
    group: { id: data.groupId ?? "", name: "", currency: "KES" },
    financialPosition: {
      availableGroupFunds: 0,
      totalContributions: contributions.total ?? 0,
      outstandingLoanPrincipal: loans.totalActive ?? 0,
    },
    myContribution: {
      confirmedTotal: contributions.approved ?? 0,
      pendingTotal: contributions.pending ?? 0,
    },
    myLoans: {
      active: loans.active ?? 0,
      totalActive: loans.totalActive ?? 0,
      nextRepaymentAmount: loans.dueForRepayment,
    },
    contributions: {
      frequency: "none",
      amount: 0,
      periods: { required: 0, completed: 0 },
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Get the current user's contributions
 * Paginated list of personal contributions
 */
export async function getMyContributions(
  token: string,
  page = 1,
  pageSize = 20,
): Promise<{ results: Contribution[]; pagination: Pagination }> {
  const { data } = await api.get(
    "/contributions/my-contributions",
    {
      params: { page, limit: pageSize },
      headers: authHeaders(token),
    },
  );
  return adaptContributionList(data);
}

/**
 * Get all group contributions (admin only)
 * Returns contributions from all group members
 */
export async function getGroupContributions(
  token: string,
  page = 1,
  pageSize = 20,
): Promise<{ results: GroupContribution[]; pagination: Pagination }> {
  const { data } = await api.get(
    "/admin/contributions",
    {
      params: { page, limit: pageSize },
      headers: authHeaders(token),
    },
  );
  return adaptContributionList(data) as {
    results: GroupContribution[];
    pagination: Pagination;
  };
}

/**
 * Create a new contribution
 */
export async function createContribution(
  token: string,
  payload: {
    amount: number;
    method: "Mpesa" | "Bank" | "cash";
    reference?: string;
    phone?: string;
  },
): Promise<{ contribution: Contribution }> {
  const { data } = await api.post(
    "/contributions/add",
    payload,
    {
      headers: authHeaders(token),
    },
  );
  return data;
}

/**
 * Confirm/approve a pending contribution (admin only)
 */
export async function confirmContribution(
  token: string,
  contributionId: string,
): Promise<{ contribution: Contribution }> {
  const { data } = await api.put(
    `/admin/contributions/approve/${contributionId}`,
    undefined,
    {
      headers: authHeaders(token),
    },
  );
  return data;
}

/**
 * Reject a pending contribution (admin only)
 */
export async function rejectContribution(
  token: string,
  contributionId: string,
  reason?: string,
): Promise<{ contribution: Contribution }> {
  const { data } = await api.put(
    `/admin/contributions/reject/${contributionId}`,
    reason ? { reason } : undefined,
    {
      headers: authHeaders(token),
    },
  );
  return data;
}
