/**
 * Contribution Store
 * Manages the current user's contribution list and submission flow
 * 
 * Uses the legacy contribution routes currently exposed by the backend.
 */

import { create } from "zustand";
import type { Contribution, GroupContribution } from "@/types/creditManagement";
import type { Pagination } from "@/types/api";
import {
  getMyContributions,
  getGroupContributions,
  createContribution,
  confirmContribution,
  rejectContribution,
} from "@/services/dashboardApi";
import { defaultPagination, hasMore, mergePage } from "@/utils/pagination";
import { getApiErrorMessage } from "@/utils/apiError";

const defaultPaginationValue = {
  page: 1,
  pageSize: 20,
  totalPages: 0,
  totalElements: 0,
};

interface ContributionState {
  // User's contributions
  contributions: Contribution[];
  pagination: Pagination;
  loading: boolean;
  mutating: boolean;
  error?: string;

  // Admin: group contributions
  groupContributions: GroupContribution[];
  groupPagination: Pagination;
  groupLoading: boolean;
  error?: string;

  // Methods
  fetch: (token: string, page?: number) => Promise<void>;
  fetchGroupContributions: (token: string, page?: number) => Promise<void>;
  add: (token: string, payload: CreateContributionPayload) => Promise<void>;
  confirm: (token: string, contributionId: string) => Promise<void>;
  reject: (token: string, contributionId: string, reason?: string) => Promise<void>;
  clear: () => void;
}

export interface CreateContributionPayload {
  amount: number;
  method: "Mpesa" | "Bank" | "cash";
  reference?: string;
  phone?: string;
}

export const useContributionStore = create<ContributionState>((set, get) => ({
  contributions: [],
  pagination: defaultPaginationValue,
  loading: false,
  mutating: false,
  error: undefined,

  groupContributions: [],
  groupPagination: defaultPaginationValue,
  groupLoading: false,

  fetch: async (token, page = 1) => {
    if (get().loading) return;
    set({ loading: true, error: undefined });
    try {
      const result = await getMyContributions(token, page);
      set({
        contributions: mergePage(get().contributions, result.results, page),
        pagination: result.pagination,
        loading: false,
      });
    } catch (error) {
      set({ error: getApiErrorMessage(error), loading: false });
    }
  },

  fetchGroupContributions: async (token, page = 1) => {
    if (get().groupLoading) return;
    set({ groupLoading: true, error: undefined });
    try {
      const result = await getGroupContributions(token, page);
      set({
        groupContributions: mergePage(get().groupContributions, result.results, page),
        groupPagination: result.pagination,
        groupLoading: false,
      });
    } catch (error) {
      set({ error: getApiErrorMessage(error), groupLoading: false });
    }
  },

  add: async (token, payload) => {
    set({ mutating: true, error: undefined });
    try {
      await createContribution(token, {
        amount: payload.amount,
        method: payload.method,
        reference: payload.reference,
      });
      // Refresh the list after successful creation
      const result = await getMyContributions(token, 1);
      set({
        contributions: result.results,
        pagination: result.pagination,
        mutating: false,
      });
    } catch (error) {
      const errorMsg = getApiErrorMessage(error);
      set({ error: errorMsg, mutating: false });
      throw error;
    }
  },

  confirm: async (token, contributionId) => {
    set({ mutating: true, error: undefined });
    try {
      await confirmContribution(token, contributionId);
      // Refresh group contributions list
      const result = await getGroupContributions(token, 1);
      set({
        groupContributions: result.results,
        groupPagination: result.pagination,
        mutating: false,
      });
    } catch (error) {
      set({ error: getApiErrorMessage(error), mutating: false });
      throw error;
    }
  },

  reject: async (token, contributionId, reason) => {
    set({ mutating: true, error: undefined });
    try {
      await rejectContribution(token, contributionId, reason);
      // Refresh group contributions list
      const result = await getGroupContributions(token, 1);
      set({
        groupContributions: result.results,
        groupPagination: result.pagination,
        mutating: false,
      });
    } catch (error) {
      set({ error: getApiErrorMessage(error), mutating: false });
      throw error;
    }
  },

  clear: () =>
    set({
      contributions: [],
      pagination: defaultPaginationValue,
      loading: false,
      mutating: false,
      error: undefined,
      groupContributions: [],
      groupPagination: defaultPaginationValue,
      groupLoading: false,
    }),
}));

export const selectContributionHasMore = (state: ContributionState) =>
  hasMore(state.pagination);

export const selectGroupContributionHasMore = (state: ContributionState) =>
  hasMore(state.groupPagination);

