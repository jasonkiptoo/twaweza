import { create } from "zustand";
import { getUserSummary } from "@/services/userApi";
import { getApiErrorMessage } from "@/utils/apiError";

interface UserState {
  summary?: unknown;
  isLoading: boolean;
  error?: string;
  fetchSummary: (token: string) => Promise<void>;
  clear: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  isLoading: false,
  fetchSummary: async (token) => {
    set({ isLoading: true, error: undefined });
    try {
      set({ summary: await getUserSummary(token), isLoading: false });
    } catch (error) {
      set({ error: getApiErrorMessage(error), isLoading: false });
    }
  },
  clear: () => set({ summary: undefined, error: undefined, isLoading: false }),
}));
