import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  getCreditLoan,
  getCreditSchedule,
} from "@/services/creditManagementApi";
import type { CreditLoan, CreditLoanSchedule } from "@/types/creditManagement";
import { getApiErrorMessage } from "@/utils/apiError";

export function useLoanDetails(loanId: string) {
  const token = useAuthStore((state) => state.token);
  const [loan, setLoan] = useState<CreditLoan>();
  const [schedule, setSchedule] = useState<CreditLoanSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  async function refresh() {
    if (!token || !loanId) return;
    setLoading(true);
    setError(undefined);
    try {
      const [currentLoan, currentSchedule] = await Promise.all([
        getCreditLoan(token, loanId),
        getCreditSchedule(token, loanId),
      ]);
      setLoan(currentLoan);
      setSchedule(currentSchedule);
    } catch (cause) {
      setError(getApiErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void refresh();
  }, [loanId, token]);
  return { loan, schedule, loading: Boolean(token) && loading, error, refresh };
}
