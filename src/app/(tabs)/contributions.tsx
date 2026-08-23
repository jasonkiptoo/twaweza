import { useEffect } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { AppCard } from "@/components/ui/AppCard";
import { AppEmptyState, AppErrorState } from "@/components/ui/AppStates";
import { AppSkeleton } from "@/components/ui/AppSkeleton";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { AppButton } from "@/components/ui/AppButton";
import { Heading } from "@/components/ui/heading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useAuthStore } from "@/store/authStore";
import { useContributionStore } from "@/store/contributionStore";

export default function ContributionsScreen() {
  const token = useAuthStore((state) => state.token);
  const contributions = useContributionStore((state) => state.contributions);
  const loading = useContributionStore((state) => state.loading);
  const error = useContributionStore((state) => state.error);
  const fetch = useContributionStore((state) => state.fetch);
  useEffect(() => {
    if (token) void fetch(token, 1);
  }, [fetch, token]);
  const canLoadMore = useContributionStore(
    (state) => state.pagination.page < state.pagination.totalPages,
  );
  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading && Boolean(contributions.length)}
            onRefresh={() => (token ? fetch(token, 1) : undefined)}
          />
        }
        contentContainerStyle={{ gap: 16, paddingBottom: 32 }}
      >
        <Heading size="3xl">Contributions</Heading>
        {loading && !contributions.length && <AppSkeleton height={120} />}
        {error && (
          <AppErrorState
            message={error}
            onRetry={() => (token ? fetch(token, 1) : undefined)}
          />
        )}
        {!loading && !error && !contributions.length && (
          <AppEmptyState
            title="No contributions"
            message="Your contribution history will appear here."
          />
        )}
        {contributions.map((item) => (
          <AppCard key={item.id}>
            <VStack className="gap-2">
              <VStack className="flex-row items-center justify-between">
                <Text className="font-semibold">
                  {item.month ?? ""} {item.year ?? ""}
                </Text>
                <StatusBadge status={item.status} />
              </VStack>
              <CurrencyAmount value={item.amount} />
              <Text size="sm" className="text-muted-foreground">
                {item.paymentMethod ?? "Payment method unavailable"}{" "}
                {item.reference ? `• ${item.reference}` : ""}
              </Text>
            </VStack>
          </AppCard>
        ))}
        {canLoadMore && token && (
          <AppButton
            title="Load more"
            loading={loading}
            onPress={() =>
              fetch(token, useContributionStore.getState().pagination.page + 1)
            }
          />
        )}
      </ScrollView>
    </Screen>
  );
}
