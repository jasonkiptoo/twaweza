/**
 * Dashboard API Service
 * Handles requests for dashboard data, financial summaries, and contribution management
 * Base URL: /api/v1/credit-management
 */

import type {
    Contribution as CreditContribution,
    GroupContribution as CreditGroupContribution,
    DashboardSummary,
} from "@/types/creditManagement";
import type { Contribution } from "@/types/member";
import { adaptContributionList } from "@/utils/adapters";
import { api, authHeaders } from "./api";

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
  contributions?: {
    frequency?: DashboardSummary["contributions"]["frequency"];
    amount?: number;
    progress?: number;
    periods?: { required?: number; completed?: number };
    qualifyingPeriods?: number;
  };
  contributionProgress?: {
    required?: boolean;
    qualifyingPeriods?: number;
    requiredPeriods?: number;
    completedPeriods?: number;
    progress?: number;
  };
  contributionPolicy?: {
    minimumFrequency?: DashboardSummary["contributions"]["frequency"];
    minimumAmount?: number;
    minimumPeriods?: number;
  };
}

/**
 * Build the dashboard model from the backend's existing user summary route.
 * Group details remain available through groupApi and are not fabricated here.
 */
export async function getDashboardSummary(
  token: string,
): Promise<DashboardSummary> {
  const { data } = await api.get<UserSummaryResponse>("/auth/user-summary", {
    headers: authHeaders(token),
  });
  const contributions = data.userContributions ?? {};
  const loans = data.loans ?? {};
  const contributionProgress = data.contributionProgress ?? {};
  const contributionDetails = data.contributions ?? {};
  const contributionPolicy = data.contributionPolicy ?? {};
  const requiredPeriods =
    contributionDetails.periods?.required ??
    contributionProgress.requiredPeriods ??
    contributionPolicy.minimumPeriods;
  const completedPeriods =
    contributionDetails.periods?.completed ??
    contributionProgress.completedPeriods ??
    contributionProgress.qualifyingPeriods ??
    contributionDetails.qualifyingPeriods;
  const hasPeriodProgress =
    requiredPeriods !== undefined && completedPeriods !== undefined;
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
      frequency:
        contributionDetails.frequency ??
        contributionPolicy.minimumFrequency ??
        "none",
      amount:
        contributionDetails.amount ?? contributionPolicy.minimumAmount ?? 0,
      progress:
        contributionDetails.progress ?? contributionProgress.progress,
      periods: hasPeriodProgress
        ? { required: requiredPeriods!, completed: completedPeriods! }
        : undefined,
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
  const { data } = await api.get("/contributions/my-contributions", {
    params: { page, limit: pageSize },
    headers: authHeaders(token),
  });
  return adaptContributionList(data) as unknown as {
    results: Contribution[];
    pagination: Pagination;
  };
}

/**
 * Get all group contributions (admin only)
 * Returns contributions from all group members
 */
export async function getGroupContributions(
  token: string,
  page = 1,
  pageSize = 20,
): Promise<{ results: CreditGroupContribution[]; pagination: Pagination }> {
  const { data } = await api.get("/admin/contributions", {
    params: { page, limit: pageSize },
    headers: authHeaders(token),
  });
  return adaptContributionList(data) as unknown as {
    results: CreditGroupContribution[];
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
): Promise<{ contribution: CreditContribution }> {
  const { data } = await api.post("/contributions/add", payload, {
    headers: authHeaders(token),
  });
  return data;
}

/**
 * Confirm/approve a pending contribution (admin only)
 */
export async function confirmContribution(
  token: string,
  contributionId: string,
): Promise<{ contribution: CreditContribution }> {
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
): Promise<{ contribution: CreditContribution }> {
  const { data } = await api.put(
    `/admin/contributions/reject/${contributionId}`,
    reason ? { reason } : undefined,
    {
      headers: authHeaders(token),
    },
  );
  return data;
}
