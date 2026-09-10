import type { Pagination } from "@/types/api";
import { api, authHeaders } from "./api";

export interface Notification {
  id: string;
  _id?: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

export async function getNotifications(
  token: string,
  page = 1,
  pageSize = 20,
): Promise<{
  results: Notification[];
  pagination: Pagination;
  unreadCount: number;
}> {
  const { data } = await api.get<{
    results: Notification[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
    unreadCount: number;
  }>("/notifications", {
    params: { page, pageSize },
    headers: authHeaders(token),
  });
  return {
    results: (data.results ?? []).map((item) => ({
      ...item,
      id: item.id ?? item._id ?? "",
    })),
    pagination: {
      page: data.pagination?.page ?? page,
      pageSize: data.pagination?.pageSize ?? pageSize,
      totalElements: data.pagination?.total ?? 0,
      totalPages: data.pagination?.totalPages ?? 0,
    },
    unreadCount: data.unreadCount ?? 0,
  };
}

export async function getUnreadNotificationCount(
  token: string,
): Promise<number> {
  const { data } = await api.get<{ count: number }>(
    "/notifications/unread-count",
    {
      headers: authHeaders(token),
    },
  );
  return data.count ?? 0;
}

export async function markNotificationRead(
  token: string,
  notificationId: string,
): Promise<void> {
  await api.patch(`/notifications/${notificationId}/read`, undefined, {
    headers: authHeaders(token),
  });
}

export async function markAllNotificationsRead(token: string): Promise<void> {
  await api.patch("/notifications/read-all", undefined, {
    headers: authHeaders(token),
  });
}
