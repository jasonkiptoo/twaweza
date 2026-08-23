import { create } from "zustand";
import type { GroupDetails } from "@/types/member";
import { getGroupDetails } from "@/services/groupApi";
import { getApiErrorMessage } from "@/utils/apiError";

interface GroupState {
  group?: GroupDetails;
  isLoading: boolean;
  error?: string;
  fetchGroup: (token: string) => Promise<void>;
  clear: () => void;
}
export const useGroupStore = create<GroupState>((set) => ({
  isLoading: false,
  fetchGroup: async (token) => {
    set({ isLoading: true, error: undefined });
    try {
      set({ group: await getGroupDetails(token), isLoading: false });
    } catch (error) {
      set({ error: getApiErrorMessage(error), isLoading: false });
    }
  },
  clear: () => set({ group: undefined, error: undefined, isLoading: false }),
}));
