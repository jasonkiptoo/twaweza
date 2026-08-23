import { create } from "zustand";
import type { Contribution } from "@/types/member";
import type { Pagination } from "@/types/api";
import { getMyContributions } from "@/services/contributionApi";
import {
  addContribution,
  type AddContributionPayload,
} from "@/services/contributionApi";
import { defaultPagination, hasMore, mergePage } from "@/utils/pagination";
import { getApiErrorMessage } from "@/utils/apiError";

interface ContributionState {
  contributions: Contribution[];
  pagination: Pagination;
  loading: boolean;
  mutating: boolean;
  error?: string;
  fetch: (token: string, page?: number) => Promise<void>;
  add: (token: string, payload: AddContributionPayload) => Promise<void>;
  clear: () => void;
}

export const useContributionStore = create<ContributionState>((set, get) => ({
  contributions: [],
  pagination: defaultPagination,
  loading: false,
  mutating: false,
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
  add: async (token, payload) => {
    set({ mutating: true, error: undefined });
    try {
      await addContribution(token, payload);
      const result = await getMyContributions(token, 1);
      set({ contributions: result.results, pagination: result.pagination });
    } catch (error) {
      set({ error: getApiErrorMessage(error) });
      throw error;
    } finally {
      set({ mutating: false });
    }
  },
  clear: () =>
    set({
      contributions: [],
      pagination: defaultPagination,
      loading: false,
      mutating: false,
      error: undefined,
    }),
}));
export const selectContributionHasMore = (state: ContributionState) =>
  hasMore(state.pagination);
