import { create } from "zustand";
import type { Contribution } from "@/types/member";
import {
  approveContribution,
  getAdminContributions,
  rejectContribution,
} from "@/services/contributionApi";
import type { Pagination } from "@/types/api";
import { defaultPagination, mergePage } from "@/utils/pagination";
import { getApiErrorMessage } from "@/utils/apiError";

interface AdminState {
  contributions: Contribution[];
  pagination: Pagination;
  loading: boolean;
  mutating: boolean;
  error?: string;
  fetchContributions: (token: string, page?: number) => Promise<void>;
  decideContribution: (
    token: string,
    id: string,
    decision: "approve" | "reject",
  ) => Promise<void>;
}
export const useAdminStore = create<AdminState>((set, get) => ({
  contributions: [],
  pagination: defaultPagination,
  loading: false,
  mutating: false,
  fetchContributions: async (token, page = 1) => {
    if (get().loading) return;
    set({ loading: true, error: undefined });
    try {
      const result = await getAdminContributions(token, page);
      set({
        contributions: mergePage(get().contributions, result.results, page),
        pagination: result.pagination,
        loading: false,
      });
    } catch (error) {
      set({ loading: false, error: getApiErrorMessage(error) });
    }
  },
  decideContribution: async (token, id, decision) => {
    set({ mutating: true, error: undefined });
    try {
      if (decision === "approve") await approveContribution(token, id);
      else await rejectContribution(token, id);
      await get().fetchContributions(token, 1);
    } catch (error) {
      set({ error: getApiErrorMessage(error) });
    } finally {
      set({ mutating: false });
    }
  },
}));
