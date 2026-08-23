import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useCreditManagementStore } from "@/store/creditManagementStore";

export function useLoans() {
  const token = useAuthStore((state) => state.token);
  const loans = useCreditManagementStore((state) => state.loans);
  const loading = useCreditManagementStore((state) => state.loansLoading);
  const error = useCreditManagementStore((state) => state.loansError);
  const fetch = useCreditManagementStore((state) => state.fetchLoans);
  useEffect(() => {
    if (token) void fetch(token, { page: 1 });
  }, [fetch, token]);
  return {
    loans,
    loading: Boolean(token) && loading,
    error,
    refresh: () => (token ? fetch(token, { page: 1 }) : Promise.resolve()),
  };
}
