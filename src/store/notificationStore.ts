import {
    getNotifications,
    getUnreadNotificationCount,
    markAllNotificationsRead,
    markNotificationRead,
    type Notification,
} from "@/services/notificationApi";
import type { Pagination } from "@/types/api";
import { getApiErrorMessage } from "@/utils/apiError";
import { defaultPagination, hasMore, mergePage } from "@/utils/pagination";
import { create } from "zustand";

interface NotificationState {
  notifications: Notification[];
  pagination: Pagination;
  unreadCount: number;
  loading: boolean;
  error?: string;

  fetch: (token: string, page?: number) => Promise<void>;
  refreshUnreadCount: (token: string) => Promise<void>;
  markRead: (token: string, notificationId: string) => Promise<void>;
  markAllRead: (token: string) => Promise<void>;
  clear: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  pagination: defaultPagination,
  unreadCount: 0,
  loading: false,
  error: undefined,

  fetch: async (token, page = 1) => {
    if (get().loading) return;
    set({ loading: true, error: undefined });
    try {
      const result = await getNotifications(token, page);
      set({
        notifications: mergePage(get().notifications, result.results, page),
        pagination: result.pagination,
        unreadCount: result.unreadCount,
        loading: false,
      });
    } catch (error) {
      set({ error: getApiErrorMessage(error), loading: false });
    }
  },

  refreshUnreadCount: async (token) => {
    try {
      set({ unreadCount: await getUnreadNotificationCount(token) });
    } catch {
      // Non-fatal - badge simply won't update this cycle.
    }
  },

  markRead: async (token, notificationId) => {
    try {
      await markNotificationRead(token, notificationId);
      set({
        notifications: get().notifications.map((item) =>
          item.id === notificationId ? { ...item, read: true } : item,
        ),
        unreadCount: Math.max(0, get().unreadCount - 1),
      });
    } catch (error) {
      set({ error: getApiErrorMessage(error) });
    }
  },

  markAllRead: async (token) => {
    try {
      await markAllNotificationsRead(token);
      set({
        notifications: get().notifications.map((item) => ({
          ...item,
          read: true,
        })),
        unreadCount: 0,
      });
    } catch (error) {
      set({ error: getApiErrorMessage(error) });
    }
  },

  clear: () =>
    set({
      notifications: [],
      pagination: defaultPagination,
      unreadCount: 0,
      loading: false,
      error: undefined,
    }),
}));

export const selectNotificationHasMore = (state: NotificationState) =>
  hasMore(state.pagination);
