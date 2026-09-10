/**
 * Contribution Settings Store
 * Manages contribution policy settings and configurable contribution types for the group
 */

import {
    createContributionType,
    deleteContributionType,
    getContributionSettings,
    listContributionTypes,
    updateContributionSettings,
    updateContributionType,
} from "@/services/creditManagementApi";
import type {
    ContributionSettings,
    ContributionType,
} from "@/types/creditManagement";
import { getApiErrorMessage } from "@/utils/apiError";
import { create } from "zustand";

interface ContributionSettingsState {
  settings: ContributionSettings | null;
  loading: boolean;
  updating: boolean;
  error?: string;

  types: ContributionType[];
  typesLoading: boolean;
  mutatingType: boolean;
  typesError?: string;

  // Methods
  fetch: (token: string) => Promise<void>;
  update: (
    token: string,
    payload: Partial<ContributionSettings>,
  ) => Promise<void>;
  fetchTypes: (token: string) => Promise<void>;
  addType: (
    token: string,
    payload: Omit<ContributionType, "id">,
  ) => Promise<void>;
  editType: (
    token: string,
    typeId: string,
    payload: Partial<ContributionType>,
  ) => Promise<void>;
  removeType: (token: string, typeId: string) => Promise<void>;
  clear: () => void;
}

export const useContributionSettingsStore = create<ContributionSettingsState>(
  (set, get) => ({
    settings: null,
    loading: false,
    updating: false,
    error: undefined,

    types: [],
    typesLoading: false,
    mutatingType: false,
    typesError: undefined,

    fetch: async (token: string) => {
      set({ loading: true, error: undefined });
      try {
        const settings = await getContributionSettings(token);
        set({ settings, loading: false });
      } catch (error) {
        set({ error: getApiErrorMessage(error), loading: false });
      }
    },

    update: async (token: string, payload: Partial<ContributionSettings>) => {
      set({ updating: true, error: undefined });
      try {
        const settings = await updateContributionSettings(token, payload);
        set({ settings, updating: false });
      } catch (error) {
        set({ error: getApiErrorMessage(error), updating: false });
        throw error;
      }
    },

    fetchTypes: async (token: string) => {
      set({ typesLoading: true, typesError: undefined });
      try {
        const types = await listContributionTypes(token);
        set({ types, typesLoading: false });
      } catch (error) {
        set({ typesError: getApiErrorMessage(error), typesLoading: false });
      }
    },

    addType: async (token, payload) => {
      set({ mutatingType: true, typesError: undefined });
      try {
        const type = await createContributionType(token, payload);
        set({ types: [...get().types, type], mutatingType: false });
      } catch (error) {
        set({ typesError: getApiErrorMessage(error), mutatingType: false });
        throw error;
      }
    },

    editType: async (token, typeId, payload) => {
      set({ mutatingType: true, typesError: undefined });
      try {
        const type = await updateContributionType(token, typeId, payload);
        set({
          types: get().types.map((item) => (item.id === typeId ? type : item)),
          mutatingType: false,
        });
      } catch (error) {
        set({ typesError: getApiErrorMessage(error), mutatingType: false });
        throw error;
      }
    },

    removeType: async (token, typeId) => {
      set({ mutatingType: true, typesError: undefined });
      try {
        await deleteContributionType(token, typeId);
        set({
          types: get().types.filter((item) => item.id !== typeId),
          mutatingType: false,
        });
      } catch (error) {
        set({ typesError: getApiErrorMessage(error), mutatingType: false });
        throw error;
      }
    },

    clear: () =>
      set({
        settings: null,
        loading: false,
        updating: false,
        error: undefined,
        types: [],
        typesLoading: false,
        mutatingType: false,
        typesError: undefined,
      }),
  }),
);
