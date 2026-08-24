import { useAuthStore } from "@/store/authStore";
import { selectLoansHasMore, useCreditManagementStore } from "@/store/creditManagementStore";
import { useEffect } from "react";

export function useLoans() {
  const token = useAuthStore((state) => state.token);
  const group = useAuthStore((state) => state.user?.group);
  const groupId = typeof group === "string" ? group : (group?.id ?? group?._id);
  const loans = useCreditManagementStore((state) => state.loans);
  const loading = useCreditManagementStore((state) => state.loansLoading);
  const error = useCreditManagementStore((state) => state.loansError);
  const hasMore = useCreditManagementStore(selectLoansHasMore);
  const page = useCreditManagementStore((state) => state.loansPagination.page);
  const fetch = useCreditManagementStore((state) => state.fetchLoans);
  useEffect(() => {
    if (token) void fetch(token, { page: 1, group: groupId });
  }, [fetch, groupId, token]);
  return {
    loans,
    loading: Boolean(token) && loading,
    error,
    hasMore,
    loadMore: () =>
      token && hasMore
        ? fetch(token, { page: page + 1, group: groupId })
        : Promise.resolve(),
    refresh: () =>
      token ? fetch(token, { page: 1, group: groupId }) : Promise.resolve(),
  };
}
