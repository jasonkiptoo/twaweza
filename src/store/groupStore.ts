import {
    getBankInformation,
    getGroupDetails,
    updateBankInformation,
    type BankAccount,
} from "@/services/groupApi";
import type { GroupDetails } from "@/types/member";
import { getApiErrorMessage } from "@/utils/apiError";
import { create } from "zustand";

interface GroupState {
  group?: GroupDetails;
  isLoading: boolean;
  error?: string;
  banks: BankAccount[];
  banksLoading: boolean;
  banksUpdating: boolean;
  banksError?: string;
  fetchGroup: (token: string) => Promise<void>;
  fetchBanks: (token: string) => Promise<void>;
  saveBanks: (token: string, banks: BankAccount[]) => Promise<void>;
  clear: () => void;
}
export const useGroupStore = create<GroupState>((set) => ({
  isLoading: false,
  banks: [],
  banksLoading: false,
  banksUpdating: false,
  fetchGroup: async (token) => {
    set({ isLoading: true, error: undefined });
    try {
      set({ group: await getGroupDetails(token), isLoading: false });
    } catch (error) {
      set({ error: getApiErrorMessage(error), isLoading: false });
    }
  },
  fetchBanks: async (token) => {
    set({ banksLoading: true, banksError: undefined });
    try {
      set({ banks: await getBankInformation(token), banksLoading: false });
    } catch (error) {
      set({ banksError: getApiErrorMessage(error), banksLoading: false });
    }
  },
  saveBanks: async (token, banks) => {
    set({ banksUpdating: true, banksError: undefined });
    try {
      set({
        banks: await updateBankInformation(token, banks),
        banksUpdating: false,
      });
    } catch (error) {
      set({ banksError: getApiErrorMessage(error), banksUpdating: false });
      throw error;
    }
  },
  clear: () =>
    set({
      group: undefined,
      error: undefined,
      isLoading: false,
      banks: [],
      banksLoading: false,
      banksUpdating: false,
      banksError: undefined,
    }),
}));
