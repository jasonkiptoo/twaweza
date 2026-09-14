import { Screen } from "@/components/layout/Screen";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppSkeleton } from "@/components/ui/AppSkeleton";
import { AppEmptyState, AppErrorState } from "@/components/ui/AppStates";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/authStore";
import {
    selectNotificationHasMore,
    useNotificationStore,
} from "@/store/notificationStore";
import { formatFinancialDate } from "@/utils/date";
import { useEffect } from "react";
import { Pressable, RefreshControl, ScrollView } from "react-native";

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const token = useAuthStore((state) => state.token);
  const notifications = useNotificationStore((state) => state.notifications);
  const loading = useNotificationStore((state) => state.loading);
  const error = useNotificationStore((state) => state.error);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const fetch = useNotificationStore((state) => state.fetch);
  const markRead = useNotificationStore((state) => state.markRead);
  const markAllRead = useNotificationStore((state) => state.markAllRead);
  const canLoadMore = useNotificationStore(selectNotificationHasMore);

  useEffect(() => {
    if (token) void fetch(token, 1);
  }, [fetch, token]);

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading && Boolean(notifications.length)}
            onRefresh={() => (token ? fetch(token, 1) : undefined)}
          />
        }
        contentContainerStyle={{ gap: 12, paddingBottom: 32 }}
      >
        <VStack className="flex-row items-center justify-between">
          <Heading size="3xl">Notifications</Heading>
          {unreadCount > 0 && token && (
            <AppButton
              title="Mark all read"
              variant="outline"
              onPress={() => markAllRead(token)}
            />
          )}
        </VStack>

        {loading && !notifications.length && <AppSkeleton height={100} />}

        {error && (
          <AppErrorState
            message={error}
            onRetry={() => (token ? fetch(token, 1) : undefined)}
          />
        )}

        {!loading && !error && !notifications.length && (
          <AppEmptyState
            title="No notifications yet"
            message="You'll see updates about contributions, loans, and approvals here."
          />
        )}

        {notifications.map((item) => (
          <Pressable
            key={item.id}
            onPress={() =>
              token && !item.read ? markRead(token, item.id) : undefined
            }
          >
            <AppCard
              style={
                item.read
                  ? undefined
                  : { borderColor: colors.primary, borderWidth: 1 }
              }
            >
              <VStack className="gap-1">
                <VStack className="flex-row items-center justify-between">
                  <Text className="font-semibold">{item.title}</Text>
                  {!item.read && (
                    <Text size="sm" style={{ color: colors.primary }}>
                      New
                    </Text>
                  )}
                </VStack>
                <Text className="text-muted-foreground">{item.message}</Text>
                <Text size="sm" className="text-muted-foreground">
                  {formatFinancialDate(item.createdAt)}
                </Text>
              </VStack>
            </AppCard>
          </Pressable>
        ))}

        {canLoadMore && token && (
          <AppButton
            title="Load more"
            loading={loading}
            onPress={() =>
              fetch(token, useNotificationStore.getState().pagination.page + 1)
            }
          />
        )}
      </ScrollView>
    </Screen>
  );
}
