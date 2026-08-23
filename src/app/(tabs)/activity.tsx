import { useEffect } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { AppCard } from "@/components/ui/AppCard";
import { AppEmptyState, AppErrorState } from "@/components/ui/AppStates";
import { AppSkeleton } from "@/components/ui/AppSkeleton";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { AppButton } from "@/components/ui/AppButton";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useAuthStore } from "@/store/authStore";
import { useActivityStore } from "@/store/activityStore";

export default function ActivityScreen() {
  const token = useAuthStore((state) => state.token);
  const activities = useActivityStore((state) => state.activities);
  const loading = useActivityStore((state) => state.loading);
  const error = useActivityStore((state) => state.error);
  const fetch = useActivityStore((state) => state.fetch);
  useEffect(() => {
    if (token) void fetch(token, 1);
  }, [fetch, token]);
  const canLoadMore = useActivityStore(
    (state) => state.pagination.page < state.pagination.totalPages,
  );
  return (
    <Screen>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={loading && Boolean(activities.length)}
            onRefresh={() => (token ? fetch(token, 1) : undefined)}
          />
        }
        contentContainerStyle={{ gap: 16, paddingBottom: 32 }}
      >
        <Heading size="3xl">Activity</Heading>
        {loading && !activities.length && <AppSkeleton height={100} />}
        {error && (
          <AppErrorState
            message={error}
            onRetry={() => (token ? fetch(token, 1) : undefined)}
          />
        )}
        {!loading && !error && !activities.length && (
          <AppEmptyState
            title="No activities"
            message="Your group activity will appear here."
          />
        )}
        {activities.map((activity) => (
          <AppCard key={activity.id}>
            <VStack className="gap-1">
              <Text className="font-semibold">
                {activity.description ?? activity.type ?? "Group activity"}
              </Text>
              {activity.amount !== undefined && (
                <CurrencyAmount value={activity.amount} />
              )}
              {activity.createdAt && (
                <Text size="sm" className="text-muted-foreground">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </Text>
              )}
            </VStack>
          </AppCard>
        ))}
        {canLoadMore && token && (
          <AppButton
            title="Load more"
            loading={loading}
            onPress={() =>
              fetch(token, useActivityStore.getState().pagination.page + 1)
            }
          />
        )}
      </ScrollView>
    </Screen>
  );
}
