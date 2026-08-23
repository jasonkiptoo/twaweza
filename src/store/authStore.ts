import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  AuthResponse,
  AuthStatus,
  Group,
  LoginPayload,
  OtpGeneratePayload,
  OtpVerifyPayload,
  SignupPayload,
  User,
} from "@/types/auth";
import {
  checkUsername,
  generateOtp,
  getCurrentUser,
  login,
  signup,
  verifyGroupCode,
  verifyOtp,
  type UsernameAvailabilityResponse,
} from "@/services/authApi";
import { getApiErrorMessage } from "@/utils/apiError";

const memoryStorage = new Map<string, string>();
const safeStorage = {
  getItem: async (name: string) => {
    try {
      const value = await AsyncStorage.getItem(name);
      if (value !== null) memoryStorage.set(name, value);
      return value ?? memoryStorage.get(name) ?? null;
    } catch {
      return memoryStorage.get(name) ?? null;
    }
  },
  setItem: async (name: string, value: string) => {
    memoryStorage.set(name, value);
    try {
      await AsyncStorage.setItem(name, value);
    } catch {}
  },
  removeItem: async (name: string) => {
    memoryStorage.delete(name);
    try {
      await AsyncStorage.removeItem(name);
    } catch {}
  },
};

interface AuthState {
  token?: string;
  user?: User;
  group?: Group;
  pendingOtpEmail?: string;
  status: AuthStatus;
  initialized: boolean;
  storageHydrated: boolean;
  isHydrating: boolean;
  isLoading: boolean;
  error?: string;
  otpRequired: boolean;
  otpVerified: boolean;
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  signup: (payload: SignupPayload) => Promise<AuthResponse>;
  hydrate: () => Promise<void>;
  fetchCurrentUser: () => Promise<User | undefined>;
  generateOtp: (payload: OtpGeneratePayload) => Promise<unknown>;
  verifyOtp: (payload: OtpVerifyPayload) => Promise<unknown>;
  checkUsernameAvailability: (
    username: string,
  ) => Promise<UsernameAvailabilityResponse>;
  verifyGroupCode: (code: string) => Promise<unknown>;
  clearError: () => void;
  clearAuth: () => void;
  logout: () => void;
  setPendingOtpEmail: (email: string) => void;
  markStorageHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      status: "uninitialized",
      initialized: false,
      storageHydrated: false,
      isHydrating: false,
      isLoading: false,
      otpRequired: false,
      otpVerified: false,
      login: async (payload) => {
        set({ isLoading: true, error: undefined });
        try {
          const response = await login(payload);
          const token = response.token ?? response.accessToken;
          if (!token)
            throw new Error("Login response did not include an access token.");
          set({ token, isLoading: true });
          const user = response.user ?? (await getCurrentUser(token));
          const otpRequired = user.otpVerified === false;
          set({
            token,
            user,
            isLoading: false,
            status: "authenticated",
            otpVerified: !otpRequired,
            otpRequired,
            pendingOtpEmail: user.email ?? payload.email,
          });
          return { ...response, token, user };
        } catch (error) {
          set({
            isLoading: false,
            error: getApiErrorMessage(error),
            status: "unauthenticated",
          });
          throw error;
        }
      },
      signup: async (payload) => {
        set({ isLoading: true, error: undefined });
        try {
          const response = await signup(payload);
          const token = response.token ?? response.accessToken;
          if (token)
            set({
              token,
              user: response.user,
              status: "authenticated",
              isLoading: false,
              pendingOtpEmail: response.user?.email,
            });
          else set({ isLoading: false });
          return response;
        } catch (error) {
          set({ isLoading: false, error: getApiErrorMessage(error) });
          throw error;
        }
      },
      hydrate: async () => {
        if (get().initialized || !get().storageHydrated) return;
        set({ status: "hydrating", isHydrating: true });
        try {
          if (get().token) await get().fetchCurrentUser();
          else set({ status: "unauthenticated" });
        } catch {
          get().clearAuth();
        } finally {
          set({ initialized: true, isHydrating: false });
        }
      },
      fetchCurrentUser: async () => {
        const token = get().token;
        if (!token) {
          set({ status: "unauthenticated" });
          return undefined;
        }
        const user = await getCurrentUser(token);
        const otpRequired = user.otpVerified === false;
        set({
          user,
          status: "authenticated",
          otpVerified: !otpRequired,
          otpRequired,
          pendingOtpEmail: user.email ?? get().pendingOtpEmail,
        });
        return user;
      },
      generateOtp: async (payload) => generateOtp(payload, get().token),
      verifyOtp: async (payload) => verifyOtp(payload, get().token),
      checkUsernameAvailability: checkUsername,
      verifyGroupCode,
      clearError: () => set({ error: undefined }),
      clearAuth: () =>
        set({
          token: undefined,
          user: undefined,
          group: undefined,
          pendingOtpEmail: undefined,
          status: "unauthenticated",
          otpRequired: false,
          otpVerified: false,
          error: undefined,
        }),
      logout: () => get().clearAuth(),
      setPendingOtpEmail: (email) => set({ pendingOtpEmail: email }),
      markStorageHydrated: () => set({ storageHydrated: true }),
    }),
    {
      name: "savesmart.auth",
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        group: state.group,
        pendingOtpEmail: state.pendingOtpEmail,
      }),
      onRehydrateStorage: () => (state) => state?.markStorageHydrated(),
    },
  ),
);
