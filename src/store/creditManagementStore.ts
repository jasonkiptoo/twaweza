import {
    createCreditApplication,
    createCreditProduct,
    decideCreditApplication,
    getCreditLoan,
    getCreditSchedule,
    getPortfolio,
    listCreditApplications,
    listCreditLoans,
    listCreditProducts,
    recordCreditPayment,
} from "@/services/creditManagementApi";
import type { Pagination } from "@/types/api";
import type {
    CreditLoan,
    CreditLoanApplication,
    CreditLoanSchedule,
    CreditProduct,
    PaymentMethod,
} from "@/types/creditManagement";
import { getApiErrorMessage } from "@/utils/apiError";
import { defaultPagination, hasMore, mergePage } from "@/utils/pagination";
import { create } from "zustand";

interface CreditState {
  products: CreditProduct[];
  productsPagination: Pagination;
  productsLoading: boolean;
  productsError?: string;
  applications: CreditLoanApplication[];
  applicationsPagination: Pagination;
  applicationsLoading: boolean;
  applicationsError?: string;
  loans: CreditLoan[];
  loansPagination: Pagination;
  loansLoading: boolean;
  loansError?: string;
  portfolio: CreditLoan[];
  portfolioLoading: boolean;
  portfolioError?: string;
  schedule: CreditLoanSchedule[];
  loanDetails?: CreditLoan;
  loanDetailsLoading: boolean;
  loanDetailsError?: string;
  paymentLoading: boolean;
  creatingProduct: boolean;
  submittingApplication: boolean;
  decidingApplication: boolean;
  fetchProducts: (
    token: string,
    params?: {
      page?: number;
      active?: boolean;
      search?: string;
      group?: string;
    },
  ) => Promise<void>;
  fetchApplications: (
    token: string,
    params?: {
      page?: number;
      status?: string;
      search?: string;
      group?: string;
    },
  ) => Promise<void>;
  fetchLoans: (
    token: string,
    params?: {
      page?: number;
      status?: string;
      memberId?: string;
      group?: string;
    },
  ) => Promise<void>;
  createProduct: (
    token: string,
    payload: Omit<CreditProduct, "id">,
  ) => Promise<void>;
  submitApplication: (
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
  ) => Promise<{ eligible: boolean; reasons?: string[] }>;
  decideApplication: (
    token: string,
    id: string,
    decision: "approve" | "reject",
    note?: string,
  ) => Promise<void>;
  fetchPortfolio: (token: string) => Promise<void>;
  fetchLoanDetails: (token: string, loanId: string) => Promise<void>;
  recordPayment: (
    token: string,
    loanId: string,
    payload: {
      amount: number;
      paymentMethod: PaymentMethod;
      reference?: string;
    },
  ) => Promise<void>;
  clear: () => void;
}

export const useCreditManagementStore = create<CreditState>((set, get) => ({
  products: [],
  productsPagination: defaultPagination,
  productsLoading: false,
  applications: [],
  applicationsPagination: defaultPagination,
  applicationsLoading: false,
  loans: [],
  loansPagination: defaultPagination,
  loansLoading: false,
  portfolio: [],
  portfolioLoading: false,
  schedule: [],
  loanDetailsLoading: false,
  paymentLoading: false,
  creatingProduct: false,
  submittingApplication: false,
  decidingApplication: false,
  fetchProducts: async (token, params = {}) => {
    if (get().productsLoading) return;
    const page = params.page ?? 1;
    set({ productsLoading: true, productsError: undefined });
    try {
      const result = await listCreditProducts(token, {
        ...params,
        page,
        pageSize: 20,
      });
      set({
        products: mergePage(get().products, result.results, page),
        productsPagination: result.pagination,
        productsLoading: false,
      });
    } catch (error) {
      set({ productsLoading: false, productsError: getApiErrorMessage(error) });
    }
  },
  fetchApplications: async (token, params = {}) => {
    if (get().applicationsLoading) return;
    const page = params.page ?? 1;
    set({ applicationsLoading: true, applicationsError: undefined });
    try {
      const result = await listCreditApplications(token, {
        ...params,
        page,
        pageSize: 20,
      });
      set({
        applications: mergePage(get().applications, result.results, page),
        applicationsPagination: result.pagination,
        applicationsLoading: false,
      });
    } catch (error) {
      set({
        applicationsLoading: false,
        applicationsError: getApiErrorMessage(error),
      });
    }
  },
  fetchLoans: async (token, params = {}) => {
    if (get().loansLoading) return;
    const page = params.page ?? 1;
    set({ loansLoading: true, loansError: undefined });
    try {
      const result = await listCreditLoans(token, {
        ...params,
        page,
        pageSize: 20,
      });
      set({
        loans: mergePage(get().loans, result.results, page),
        loansPagination: result.pagination,
        loansLoading: false,
      });
    } catch (error) {
      set({ loansLoading: false, loansError: getApiErrorMessage(error) });
    }
  },
  createProduct: async (token, payload) => {
    set({ creatingProduct: true });
    try {
      await createCreditProduct(token, payload);
    } finally {
      set({ creatingProduct: false });
    }
  },
  submitApplication: async (token, payload) => {
    set({ submittingApplication: true });
    try {
      return await createCreditApplication(token, payload);
    } finally {
      set({ submittingApplication: false });
    }
  },
  decideApplication: async (token, id, decision, note) => {
    set({ decidingApplication: true });
    try {
      await decideCreditApplication(token, id, { decision, note });
      await get().fetchApplications(token, { page: 1 });
      await get().fetchLoans(token, { page: 1 });
    } finally {
      set({ decidingApplication: false });
    }
  },
  fetchPortfolio: async (token) => {
    set({ portfolioLoading: true, portfolioError: undefined });
    try {
      const result = await getPortfolio(token, { page: 1 });
      set({ portfolio: result.results, portfolioLoading: false });
    } catch (error) {
      set({
        portfolioLoading: false,
        portfolioError: getApiErrorMessage(error),
      });
    }
  },
  fetchLoanDetails: async (token, loanId) => {
    set({ loanDetailsLoading: true, loanDetailsError: undefined });
    try {
      const [loan, schedule] = await Promise.all([
        getCreditLoan(token, loanId),
        getCreditSchedule(token, loanId),
      ]);
      set({ loanDetails: loan, schedule, loanDetailsLoading: false });
    } catch (error) {
      set({
        loanDetailsLoading: false,
        loanDetailsError: getApiErrorMessage(error),
      });
      throw error;
    }
  },
  recordPayment: async (token, loanId, payload) => {
    set({ paymentLoading: true });
    try {
      await recordCreditPayment(token, loanId, payload);
      await get().fetchLoanDetails(token, loanId);
      await get().fetchLoans(token, { page: 1 });
    } finally {
      set({ paymentLoading: false });
    }
  },
  clear: () =>
    set({
      products: [],
      applications: [],
      loans: [],
      portfolio: [],
      schedule: [],
      loanDetails: undefined,
      loanDetailsError: undefined,
      productsPagination: defaultPagination,
      applicationsPagination: defaultPagination,
      loansPagination: defaultPagination,
    }),
}));

export const selectProductsHasMore = (state: CreditState) =>
  hasMore(state.productsPagination);
export const selectApplicationsHasMore = (state: CreditState) =>
  hasMore(state.applicationsPagination);
export const selectLoansHasMore = (state: CreditState) =>
  hasMore(state.loansPagination);
