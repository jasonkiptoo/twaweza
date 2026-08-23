import { create } from "zustand";
import type { CreditLoan } from "@/types/creditManagement";
import {
  getActiveLegacyLoans,
  repayLegacyLoan,
  requestLegacyLoan,
} from "@/services/loanApi";
import { getApiErrorMessage } from "@/utils/apiError";

interface LoanState {
  loans: CreditLoan[];
  loading: boolean;
  mutating: boolean;
  error?: string;
  fetchActive: (token: string) => Promise<void>;
  request: (
    token: string,
    payload: { amount: number; duration: number },
  ) => Promise<void>;
  repay: (
    token: string,
    loanId: string,
    payload: { amount: number; method: string; reference?: string },
  ) => Promise<void>;
}
export const useLoanStore = create<LoanState>((set) => ({
  loans: [],
  loading: false,
  mutating: false,
  fetchActive: async (token) => {
    set({ loading: true, error: undefined });
    try {
      set({ loans: await getActiveLegacyLoans(token), loading: false });
    } catch (error) {
      set({ loading: false, error: getApiErrorMessage(error) });
    }
  },
  request: async (token, payload) => {
    set({ mutating: true, error: undefined });
    try {
      await requestLegacyLoan(token, payload);
      await getActiveLegacyLoans(token).then((loans) => set({ loans }));
    } catch (error) {
      set({ error: getApiErrorMessage(error) });
      throw error;
    } finally {
      set({ mutating: false });
    }
  },
  repay: async (token, loanId, payload) => {
    set({ mutating: true, error: undefined });
    try {
      await repayLegacyLoan(token, loanId, payload);
      set({ loans: await getActiveLegacyLoans(token) });
    } catch (error) {
      set({ error: getApiErrorMessage(error) });
      throw error;
    } finally {
      set({ mutating: false });
    }
  },
}));
