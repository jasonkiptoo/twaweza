import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useCreditManagementStore } from "@/store/creditManagementStore";

export function useLoanApplications() {
  const token = useAuthStore((state) => state.token);
  const applications = useCreditManagementStore((state) => state.applications);
  const loading = useCreditManagementStore(
    (state) => state.applicationsLoading,
  );
  const error = useCreditManagementStore((state) => state.applicationsError);
  const fetch = useCreditManagementStore((state) => state.fetchApplications);
  useEffect(() => {
    if (token) void fetch(token, { page: 1 });
  }, [fetch, token]);
  return {
    applications,
    loading: Boolean(token) && loading,
    error,
    refresh: () => (token ? fetch(token, { page: 1 }) : Promise.resolve()),
  };
}
