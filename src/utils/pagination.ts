import type { Pagination } from "@/types/api";

export const defaultPagination: Pagination = {
  page: 1,
  pageSize: 20,
  totalPages: 0,
  totalElements: 0,
};

export function hasMore(pagination: Pagination): boolean {
  return pagination.page < pagination.totalPages;
}

export function mergePage<T>(current: T[], incoming: T[], page: number): T[] {
  return page === 1 ? incoming : [...current, ...incoming];
}

export function normalizePagination(
  value: Partial<Pagination> | undefined,
  fallbackPage = 1,
  fallbackPageSize = 20,
): Pagination {
  return {
    page: value?.page ?? fallbackPage,
    pageSize: value?.pageSize ?? fallbackPageSize,
    totalPages: value?.totalPages ?? 0,
    totalElements: value?.totalElements ?? 0,
  };
}
