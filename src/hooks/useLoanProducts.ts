import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useCreditManagementStore } from "@/store/creditManagementStore";

export function useLoanProducts(active = true) {
  const token = useAuthStore((state) => state.token);
  const products = useCreditManagementStore((state) => state.products);
  const loading = useCreditManagementStore((state) => state.productsLoading);
  const error = useCreditManagementStore((state) => state.productsError);
  const fetch = useCreditManagementStore((state) => state.fetchProducts);
  useEffect(() => {
    if (token) void fetch(token, { page: 1, active });
  }, [active, fetch, token]);
  return {
    products,
    loading: Boolean(token) && loading,
    error,
    refresh: () =>
      token ? fetch(token, { page: 1, active }) : Promise.resolve(),
  };
}
