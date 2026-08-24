import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useCreditManagementStore } from "@/store/creditManagementStore";
import { selectProductsHasMore } from "@/store/creditManagementStore";

export function useLoanProducts(active = true) {
  const token = useAuthStore((state) => state.token);
  const group = useAuthStore((state) => state.user?.group);
  const groupId = typeof group === "string" ? group : group?.id ?? group?._id;
  const products = useCreditManagementStore((state) => state.products);
  const loading = useCreditManagementStore((state) => state.productsLoading);
  const error = useCreditManagementStore((state) => state.productsError);
  const hasMore = useCreditManagementStore(selectProductsHasMore);
  const page = useCreditManagementStore((state) => state.productsPagination.page);
  const fetch = useCreditManagementStore((state) => state.fetchProducts);
  useEffect(() => {
    if (token) void fetch(token, { page: 1, active, group: groupId });
  }, [active, fetch, groupId, token]);
  return {
    products,
    loading: Boolean(token) && loading,
    error,
    hasMore,
    loadMore: () =>
      token && hasMore
        ? fetch(token, { page: page + 1, active, group: groupId })
        : Promise.resolve(),
    refresh: () =>
      token ? fetch(token, { page: 1, active, group: groupId }) : Promise.resolve(),
  };
}
