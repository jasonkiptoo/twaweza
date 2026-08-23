import { create } from "zustand";
interface SignupState {
  loading: boolean;
  error?: string;
}
export const useSignupStore = create<SignupState>(() => ({ loading: false }));
