import { normalizeContributionPaymentMethod } from "@/components/credit-management/PaymentMethodIcon";
import type { Pagination } from "@/types/api";
import type {
    Contribution,
    ContributionSettings,
    ContributionType,
    CreditLoan,
    CreditLoanApplication,
    CreditLoanSchedule,
    CreditProduct,
    CreditReconciliation,
    GroupContribution,
    GroupFinancialSummary,
    LoanDecision,
    PaginatedCredit,
    PaymentMethod,
} from "@/types/creditManagement";
import { normalizeEntityId } from "@/utils/ids";
import { normalizePagination } from "@/utils/pagination";
import { api, authHeaders } from "./api";

type ListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  memberId?: string;
  group?: string;
  active?: boolean;
};
function pageResult<T>(data: unknown, key: string): PaginatedCredit<T> {
  const record = (data && typeof data === "object" ? data : {}) as Record<
    string,
    unknown
  >;
  const nested =
    record.data && typeof record.data === "object"
      ? (record.data as Record<string, unknown>)
      : undefined;
  const values = Array.isArray(record.results)
    ? record.results
    : Array.isArray(record[key])
      ? record[key]
      : Array.isArray(nested?.results)
        ? nested.results
        : Array.isArray(nested?.[key])
          ? nested[key]
          : [];
  const paginationSource =
    record.pagination && typeof record.pagination === "object"
      ? record.pagination
      : nested?.pagination && typeof nested.pagination === "object"
        ? nested.pagination
        : record;
  return {
    results: values as T[],
    pagination: normalizePagination(paginationSource as never),
  };
}

function normalizeCreditLoan(loan: CreditLoan) {
  return normalizeEntityId({
    ...loan,
    principalAmount:
      loan.principalAmount ??
      (loan as CreditLoan & { principal?: number }).principal,
    interestAmount:
      loan.interestAmount ??
      (loan as CreditLoan & { interest?: number }).interest,
  });
}

export async function listCreditProducts(
  token: string,
  params: ListParams = {},
) {
  const { data } = await api.get("/credit-management/products", {
    params,
    headers: authHeaders(token),
  });
  const result = pageResult<CreditProduct>(data, "products");
  return { ...result, results: result.results.map(normalizeEntityId) };
}
export async function createCreditProduct(
  token: string,
  payload: Omit<CreditProduct, "id">,
) {
  const { data } = await api.post("/credit-management/products", payload, {
    headers: authHeaders(token),
  });
  return normalizeEntityId(data);
}

export async function updateCreditProduct(
  token: string,
  productId: string,
  payload: Partial<CreditProduct>,
) {
  const { data } = await api.put(
    `/credit-management/products/${productId}`,
    payload,
    {
      headers: authHeaders(token),
    },
  );
  return normalizeEntityId(data);
}

export async function listCreditApplications(
  token: string,
  params: ListParams = {},
) {
  const { data } = await api.get("/credit-management/applications", {
    params,
    headers: authHeaders(token),
  });
  const result = pageResult<CreditLoanApplication>(data, "applications");
  return { ...result, results: result.results.map(normalizeEntityId) };
}
export async function createCreditApplication(
  token: string,
  payload: {
    group?: string;
    product: string;
    requestedAmount: number;
    repaymentDurationMonths?: number;
    repaymentFrequency?: string;
    purpose: string;
    comments?: string;
  },
) {
  const { data } = await api.post("/credit-management/applications", payload, {
    headers: authHeaders(token),
  });
  return data as {
    eligible: boolean;
    application?: CreditLoanApplication;
    reasons?: string[];
  };
}
export async function decideCreditApplication(
  token: string,
  applicationId: string,
  payload: { decision: LoanDecision; note?: string },
) {
  console.log("[creditManagementApi] deciding application", {
    applicationId,
    decision: payload.decision,
  });
  const { data } = await api.post(
    `/credit-management/applications/${applicationId}/approve`,
    payload,
    { headers: authHeaders(token) },
  );
  console.log("[creditManagementApi] decision response", data);
  return data;
}
export async function listCreditLoans(token: string, params: ListParams = {}) {
  const { data } = await api.get("/credit-management/loans", {
    params,
    headers: authHeaders(token),
  });
  const result = pageResult<CreditLoan>(data, "loans");
  return { ...result, results: result.results.map(normalizeCreditLoan) };
}
export async function getCreditLoan(token: string, loanId: string) {
  const { data } = await api.get(`/credit-management/loans/${loanId}`, {
    headers: authHeaders(token),
  });
  return normalizeCreditLoan((data as { loan?: CreditLoan }).loan ?? data);
}
export async function getCreditSchedule(
  token: string,
  loanId: string,
): Promise<CreditLoanSchedule[]> {
  const { data } = await api.get(
    `/credit-management/loans/${loanId}/schedule`,
    { headers: authHeaders(token) },
  );
  if (Array.isArray(data))
    return (data as CreditLoanSchedule[]).map(normalizeEntityId);
  const record = (data && typeof data === "object" ? data : {}) as Record<
    string,
    unknown
  >;
  const nested =
    record.data && typeof record.data === "object"
      ? (record.data as Record<string, unknown>)
      : undefined;
  const schedule =
    record.schedule ?? record.results ?? nested?.schedule ?? nested?.results;
  return Array.isArray(schedule)
    ? (schedule as CreditLoanSchedule[]).map(normalizeEntityId)
    : [];
}
export async function recordCreditPayment(
  token: string,
  loanId: string,
  payload: {
    amount: number;
    paymentMethod: PaymentMethod;
    reference?: string;
    idempotencyKey: string;
  },
) {
  const { data } = await api.post(
    `/credit-management/loans/${loanId}/payments`,
    payload,
    {
      headers: {
        ...authHeaders(token),
        "Idempotency-Key": payload.idempotencyKey,
      },
    },
  );
  return normalizeCreditLoan((data as { loan?: CreditLoan }).loan ?? data);
}
export async function getPortfolio(token: string, params: ListParams = {}) {
  const { data } = await api.get("/credit-management/reports/portfolio", {
    params,
    headers: authHeaders(token),
  });
  const result = pageResult<CreditLoan>(data, "loans");
  return { ...result, results: result.results.map(normalizeEntityId) };
}

export async function getGroupFinancialSummary(
  token: string,
): Promise<GroupFinancialSummary> {
  const { data } = await api.get("/credit-management/group/financial-summary", {
    headers: authHeaders(token),
  });
  return data as GroupFinancialSummary;
}

export async function reconcileCreditLoan(token: string, loanId: string) {
  const { data } = await api.get(
    `/credit-management/loans/${loanId}/reconciliation`,
    { headers: authHeaders(token) },
  );
  return data as CreditReconciliation;
}

function contributionPageResult<T>(data: unknown): {
  results: T[];
  pagination: Pagination;
} {
  const record = (data && typeof data === "object" ? data : {}) as {
    results?: unknown[];
    pagination?: {
      page?: number;
      pageSize?: number;
      total?: number;
      totalPages?: number;
    };
  };
  return {
    results: (record.results ?? []) as T[],
    pagination: normalizePagination({
      page: record.pagination?.page,
      pageSize: record.pagination?.pageSize,
      totalElements: record.pagination?.total,
      totalPages: record.pagination?.totalPages,
    }),
  };
}

export async function getContributionSettings(
  token: string,
): Promise<ContributionSettings> {
  const { data } = await api.get("/credit-management/contributions/settings", {
    headers: authHeaders(token),
  });
  const settings = (data as { settings: ContributionSettings }).settings;
  return {
    ...settings,
    allowedMethods: (settings.allowedMethods ?? []).flatMap((method) => {
      const normalized = normalizeContributionPaymentMethod(method);
      return normalized ? [normalized] : [];
    }),
  };
}

export async function updateContributionSettings(
  token: string,
  payload: Partial<ContributionSettings>,
): Promise<ContributionSettings> {
  const { data } = await api.put(
    "/credit-management/contributions/settings",
    payload,
    {
      headers: authHeaders(token),
    },
  );
  const settings = (data as { settings: ContributionSettings }).settings;
  return {
    ...settings,
    allowedMethods: (settings.allowedMethods ?? []).flatMap((method) => {
      const normalized = normalizeContributionPaymentMethod(method);
      return normalized ? [normalized] : [];
    }),
  };
}

export async function listContributionTypes(
  token: string,
): Promise<ContributionType[]> {
  const { data } = await api.get("/credit-management/contribution-types", {
    headers: authHeaders(token),
  });
  return (data as { results: ContributionType[] }).results ?? [];
}

export async function createContributionType(
  token: string,
  payload: Omit<ContributionType, "id">,
): Promise<ContributionType> {
  const { data } = await api.post(
    "/credit-management/contribution-types",
    payload,
    {
      headers: authHeaders(token),
    },
  );
  return (data as { contributionType: ContributionType }).contributionType;
}

export async function updateContributionType(
  token: string,
  typeId: string,
  payload: Partial<ContributionType>,
): Promise<ContributionType> {
  const { data } = await api.put(
    `/credit-management/contribution-types/${typeId}`,
    payload,
    {
      headers: authHeaders(token),
    },
  );
  return (data as { contributionType: ContributionType }).contributionType;
}

export async function deleteContributionType(
  token: string,
  typeId: string,
): Promise<void> {
  await api.delete(`/credit-management/contribution-types/${typeId}`, {
    headers: authHeaders(token),
  });
}

export async function createCreditContribution(
  token: string,
  payload: {
    amount: number;
    method: "mpesa" | "bank" | "cash";
    reference?: string;
    contributionType?: string;
    idempotencyKey?: string;
  },
): Promise<Contribution> {
  const { data } = await api.post("/credit-management/contributions", payload, {
    headers: {
      ...authHeaders(token),
      ...(payload.idempotencyKey
        ? { "Idempotency-Key": payload.idempotencyKey }
        : {}),
    },
  });
  return (data as { contribution: Contribution }).contribution;
}

export async function listMyContributions(
  token: string,
  page = 1,
  pageSize = 20,
): Promise<{ results: Contribution[]; pagination: Pagination }> {
  const { data } = await api.get("/credit-management/contributions/mine", {
    params: { page, pageSize },
    headers: authHeaders(token),
  });
  return contributionPageResult<Contribution>(data);
}

export async function listGroupCreditContributions(
  token: string,
  page = 1,
  pageSize = 20,
): Promise<{ results: GroupContribution[]; pagination: Pagination }> {
  const { data } = await api.get("/credit-management/contributions/group", {
    params: { page, pageSize },
    headers: authHeaders(token),
  });
  return contributionPageResult<GroupContribution>(data);
}

export async function confirmCreditContribution(
  token: string,
  contributionId: string,
): Promise<Contribution> {
  const { data } = await api.put(
    `/credit-management/contributions/${contributionId}/confirm`,
    undefined,
    { headers: authHeaders(token) },
  );
  return (data as { contribution: Contribution }).contribution;
}

export async function rejectCreditContribution(
  token: string,
  contributionId: string,
  reason?: string,
): Promise<Contribution> {
  const { data } = await api.put(
    `/credit-management/contributions/${contributionId}/reject`,
    reason ? { reason } : undefined,
    { headers: authHeaders(token) },
  );
  return (data as { contribution: Contribution }).contribution;
}

export const creditManagementApi = {
  listProducts: listCreditProducts,
  createProduct: createCreditProduct,
  updateProduct: updateCreditProduct,
  listApplications: listCreditApplications,
  submitApplication: createCreditApplication,
  approveApplication: decideCreditApplication,
  listLoans: listCreditLoans,
  getLoanById: getCreditLoan,
  getLoanSchedule: getCreditSchedule,
  recordPayment: recordCreditPayment,
  reconcileLoan: reconcileCreditLoan,
  portfolioReport: getPortfolio,
  getGroupFinancialSummary,
  getContributionSettings,
  updateContributionSettings,
  listContributionTypes,
  createContributionType,
  updateContributionType,
  deleteContributionType,
  createCreditContribution,
  listMyContributions,
  listGroupCreditContributions,
  confirmCreditContribution,
  rejectCreditContribution,
};
