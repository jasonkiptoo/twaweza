import type { Pagination } from "@/types/api";
import type { Activity, Contribution } from "@/types/member";
import { normalizeEntityId } from "./ids";
import { normalizePagination } from "./pagination";

export function adaptActivityResponse(payload: unknown): {
  results: Activity[];
  pagination: Pagination;
} {
  const record = (
    payload && typeof payload === "object" ? payload : {}
  ) as Record<string, unknown>;
  const items = Array.isArray(record.activities) ? record.activities : [];
  const page = (
    record.pagination && typeof record.pagination === "object"
      ? record.pagination
      : {}
  ) as Record<string, number>;
  return {
    results: items.map((item) => normalizeEntityId(item as Activity)),
    pagination: normalizePagination({
      page: page.page,
      pageSize: page.limit,
      totalElements: page.total,
      totalPages: page.total_pages,
    }),
  };
}

export function adaptContributionList(payload: unknown): {
  results: Contribution[];
  pagination: Pagination;
} {
  const record = (
    payload && typeof payload === "object" ? payload : {}
  ) as Record<string, unknown>;
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(record.results)
      ? record.results
      : Array.isArray(record.data)
        ? record.data
        : Array.isArray(record.contributions)
          ? record.contributions
          : [];
  const meta = (
    record.meta && typeof record.meta === "object"
      ? record.meta
      : record.pagination && typeof record.pagination === "object"
        ? record.pagination
        : record
  ) as Record<string, number>;
  const pagination = (
    record.pagination && typeof record.pagination === "object"
      ? record.pagination
      : record
  ) as Partial<Pagination>;
  return {
    results: items.map((item) => normalizeEntityId(item as Contribution)),
    pagination: normalizePagination(
      {
        page: meta.page,
        pageSize: meta.limit ?? meta.pageSize,
        totalElements: meta.total,
        totalPages: meta.totalPages ?? meta.total_pages,
      },
      1,
      5,
    ),
  };
}
