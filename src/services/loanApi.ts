import { api, authHeaders } from "./api";
import type { CreditLoan } from "@/types/creditManagement";
import { getArrayResponse } from "./api";

export async function getActiveLegacyLoans(
  token: string,
): Promise<CreditLoan[]> {
  const { data } = await api.get("/loans/user-active-loans", {
    headers: authHeaders(token),
  });
  return getArrayResponse<CreditLoan>(data, ["results", "loans", "data"]).map(
    (loan) => ({ ...loan, id: loan.id ?? loan._id ?? "" }),
  );
}

export async function getPendingLegacyLoans(
  token: string,
): Promise<CreditLoan[]> {
  const { data } = await api.get("/admin/loans/pending", {
    headers: authHeaders(token),
  });
  return getArrayResponse<CreditLoan>(data, ["results", "loans", "data"]).map(
    (loan) => ({ ...loan, id: loan.id ?? loan._id ?? "" }),
  );
}

export async function requestLegacyLoan(
  token: string,
  payload: { amount: number; duration: number },
) {
  const { data } = await api.post("/loans/request", payload, {
    headers: authHeaders(token),
  });
  return data;
}

export async function repayLegacyLoan(
  token: string,
  loanId: string,
  payload: { amount: number; method: string; reference?: string },
) {
  const { data } = await api.post(`/loans/${loanId}/repay`, payload, {
    headers: authHeaders(token),
  });
  return data;
}
