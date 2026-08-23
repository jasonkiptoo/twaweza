import { create } from "zustand";
import { getGroupActivity } from "@/services/activityApi";
import type { Activity } from "@/types/member";
import type { Pagination } from "@/types/api";
import { defaultPagination, hasMore, mergePage } from "@/utils/pagination";
import { getApiErrorMessage } from "@/utils/apiError";

interface ActivityState {
  activities: Activity[];
  pagination: Pagination;
  loading: boolean;
  error?: string;
  fetch: (token: string, page?: number) => Promise<void>;
  clear: () => void;
}
export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],
  pagination: defaultPagination,
  loading: false,
  fetch: async (token, page = 1) => {
    if (get().loading) return;
    set({ loading: true, error: undefined });
    try {
      const result = await getGroupActivity(token, page);
      set({
        activities: mergePage(get().activities, result.results, page),
        pagination: result.pagination,
        loading: false,
      });
    } catch (error) {
      set({ error: getApiErrorMessage(error), loading: false });
    }
  },
  clear: () =>
    set({
      activities: [],
      pagination: defaultPagination,
      error: undefined,
      loading: false,
    }),
}));
export const selectActivityHasMore = (state: ActivityState) =>
  hasMore(state.pagination);
