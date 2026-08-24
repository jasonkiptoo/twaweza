import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useCreditManagementStore } from "@/store/creditManagementStore";
import { selectApplicationsHasMore } from "@/store/creditManagementStore";

export function useLoanApplications() {
  const token = useAuthStore((state) => state.token);
  const group = useAuthStore((state) => state.user?.group);
  const groupId = typeof group === "string" ? group : group?.id ?? group?._id;
  const applications = useCreditManagementStore((state) => state.applications);
  const loading = useCreditManagementStore(
    (state) => state.applicationsLoading,
  );
  const error = useCreditManagementStore((state) => state.applicationsError);
  const hasMore = useCreditManagementStore(selectApplicationsHasMore);
  const page = useCreditManagementStore((state) => state.applicationsPagination.page);
  const fetch = useCreditManagementStore((state) => state.fetchApplications);
  useEffect(() => {
    if (token) void fetch(token, { page: 1, group: groupId });
  }, [fetch, groupId, token]);
  return {
    applications,
    loading: Boolean(token) && loading,
    error,
    hasMore,
    loadMore: () =>
      token && hasMore
        ? fetch(token, { page: page + 1, group: groupId })
        : Promise.resolve(),
    refresh: () => (token ? fetch(token, { page: 1, group: groupId }) : Promise.resolve()),
  };
}
