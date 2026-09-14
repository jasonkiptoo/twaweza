/**
 * Dashboard Store
 * Manages dashboard summary, financial position, and contribution progress data
 */

import { getGroupFinancialSummary } from "@/services/creditManagementApi";
import { getDashboardSummary } from "@/services/dashboardApi";
import type {
    DashboardSummary,
    GroupFinancialSummary,
} from "@/types/creditManagement";
import { getApiErrorMessage } from "@/utils/apiError";
import { create } from "zustand";

interface DashboardState {
  // Dashboard summary
  dashboardSummary: DashboardSummary | null;
  dashboardLoading: boolean;
  dashboardError?: string;

  // Group financial summary
  financialSummary: GroupFinancialSummary | null;
  financialLoading: boolean;
  financialError?: string;

  // Methods
  fetchDashboardSummary: (token: string) => Promise<void>;
  fetchFinancialSummary: (token: string) => Promise<void>;
  refreshAll: (token: string) => Promise<void>;

  // Cleanup
  clear: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  dashboardSummary: null,
  dashboardLoading: false,
  dashboardError: undefined,

  financialSummary: null,
  financialLoading: false,
  financialError: undefined,

  fetchDashboardSummary: async (token: string) => {
    if (get().dashboardLoading) return;
    set({ dashboardLoading: true, dashboardError: undefined });
    try {
      const summary = await getDashboardSummary(token);
      set({ dashboardSummary: summary, dashboardLoading: false });
    } catch (error) {
      set({
        dashboardError: getApiErrorMessage(error),
        dashboardLoading: false,
      });
    }
  },

  fetchFinancialSummary: async (token: string) => {
    if (get().financialLoading) return;
    set({ financialLoading: true, financialError: undefined });
    try {
      const summary = await getGroupFinancialSummary(token);
      set({ financialSummary: summary, financialLoading: false });
    } catch (error) {
      set({
        financialError: getApiErrorMessage(error),
        financialLoading: false,
      });
    }
  },

  refreshAll: async (token: string) => {
    await Promise.all([
      get().fetchDashboardSummary(token),
      get().fetchFinancialSummary(token),
    ]);
  },

  clear: () =>
    set({
      dashboardSummary: null,
      dashboardLoading: false,
      dashboardError: undefined,
      financialSummary: null,
      financialLoading: false,
      financialError: undefined,
    }),
}));
