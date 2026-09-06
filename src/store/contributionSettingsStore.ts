/**
 * Contribution Settings Store
 * Manages contribution policy settings for the group
 */

import { create } from "zustand";
import type { ContributionSettings } from "@/types/creditManagement";

interface ContributionSettingsState {
  settings: ContributionSettings | null;
  loading: boolean;
  updating: boolean;
  error?: string;

  // Methods
  fetch: (token: string) => Promise<void>;
  update: (token: string, payload: Partial<ContributionSettings>) => Promise<void>;
  clear: () => void;
}

export const useContributionSettingsStore = create<ContributionSettingsState>(
  (set, get) => ({
    settings: null,
    loading: false,
    updating: false,
    error: undefined,

    fetch: async (token: string) => {
      void token;
      set({
        loading: false,
        error: "Contribution settings are not available from the backend yet.",
      });
    },

    update: async (token: string, payload: Partial<ContributionSettings>) => {
      void token;
      void payload;
      const error = new Error(
        "Contribution settings are not available from the backend yet.",
      );
      set({ updating: false, error: error.message });
      throw error;
    },

    clear: () =>
      set({
        settings: null,
        loading: false,
        updating: false,
        error: undefined,
      }),
  }),
);
