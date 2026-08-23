import { api, authHeaders } from "./api";
import type {
  CreditLoan,
  CreditLoanApplication,
  CreditLoanSchedule,
  CreditProduct,
  LoanDecision,
  PaymentMethod,
  PaginatedCredit,
} from "@/types/creditManagement";
import { normalizeEntityId } from "@/utils/ids";
import { normalizePagination } from "@/utils/pagination";

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
  const values = Array.isArray(record.results)
    ? record.results
    : Array.isArray(record[key])
      ? record[key]
      : [];
  return {
    results: values as T[],
    pagination: normalizePagination(record as never),
  };
}

export async function listCreditProducts(
  token: string,
  params: ListParams = {},
) {
  const { data } = await api.get("/credit-management/products", {
    params,
    headers: authHeaders(token),
  });
  return pageResult<CreditProduct>(data, "products");
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
    group: string;
    product: string;
    requestedAmount: number;
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
  const { data } = await api.post(
    `/credit-management/applications/${applicationId}/approve`,
    payload,
    { headers: authHeaders(token) },
  );
  return data;
}
export async function listCreditLoans(token: string, params: ListParams = {}) {
  const { data } = await api.get("/credit-management/loans", {
    params,
    headers: authHeaders(token),
  });
  const result = pageResult<CreditLoan>(data, "loans");
  return { ...result, results: result.results.map(normalizeEntityId) };
}
export async function getCreditLoan(token: string, loanId: string) {
  const { data } = await api.get(`/credit-management/loans/${loanId}`, {
    headers: authHeaders(token),
  });
  return normalizeEntityId((data as { loan?: CreditLoan }).loan ?? data);
}
export async function getCreditSchedule(
  token: string,
  loanId: string,
): Promise<CreditLoanSchedule[]> {
  const { data } = await api.get(
    `/credit-management/loans/${loanId}/schedule`,
    { headers: authHeaders(token) },
  );
  return Array.isArray((data as { schedule?: CreditLoanSchedule[] }).schedule)
    ? (data as { schedule: CreditLoanSchedule[] }).schedule
    : [];
}
export async function recordCreditPayment(
  token: string,
  loanId: string,
  payload: { amount: number; paymentMethod: PaymentMethod; reference?: string },
) {
  const { data } = await api.post(
    `/credit-management/loans/${loanId}/payments`,
    payload,
    { headers: authHeaders(token) },
  );
  return data;
}
export async function getPortfolio(token: string, params: ListParams = {}) {
  const { data } = await api.get("/credit-management/reports/portfolio", {
    params,
    headers: authHeaders(token),
  });
  const result = pageResult<CreditLoan>(data, "loans");
  return { ...result, results: result.results.map(normalizeEntityId) };
}
