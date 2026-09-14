import { Screen } from "@/components/layout/Screen";
import {
  contributionPaymentMethodLabel,
  normalizeContributionPaymentMethod,
  PaymentMethodIcon,
} from "@/components/credit-management/PaymentMethodIcon";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppSkeleton } from "@/components/ui/AppSkeleton";
import { AppEmptyState, AppErrorState } from "@/components/ui/AppStates";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { Heading } from "@/components/ui/heading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/authStore";
import { useContributionStore } from "@/store/contributionStore";
import { formatFinancialDate } from "@/utils/date";
import { useEffect, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";

const filters = ["all", "pending", "confirmed", "rejected"] as const;
type ContributionFilter = (typeof filters)[number];

export default function ContributionsScreen() {
  const { colors } = useTheme();
  const token = useAuthStore((state) => state.token);
  const contributions = useContributionStore((state) => state.contributions);
  const loading = useContributionStore((state) => state.loading);
  const error = useContributionStore((state) => state.error);
  const fetch = useContributionStore((state) => state.fetch);
  const [filter, setFilter] = useState<ContributionFilter>("all");
  useEffect(() => {
    if (token) void fetch(token, 1);
  }, [fetch, token]);
  const canLoadMore = useContributionStore(
    (state) => state.pagination.page < state.pagination.totalPages,
  );
  const visibleContributions = useMemo(
    () =>
      filter === "all"
        ? contributions
        : contributions.filter((item) => item.status === filter),
    [contributions, filter],
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
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {filters.map((item) => {
            const selected = filter === item;
            return (
              <Pressable
                key={item}
                onPress={() => setFilter(item)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={{
                  borderColor: selected ? colors.primary : colors.border,
                  borderRadius: 999,
                  borderWidth: 1,
                  backgroundColor: selected ? colors.primary : colors.card,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                }}
              >
                <Text
                  style={{
                    color: selected ? colors.onPrimary : colors.textPrimary,
                    fontWeight: "600",
                    textTransform: "capitalize",
                  }}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {loading && !contributions.length && <AppSkeleton height={120} />}
        {error && (
          <AppErrorState
            message={error}
            onRetry={() => (token ? fetch(token, 1) : undefined)}
          />
        )}
        {!loading && !error && !visibleContributions.length && (
          <AppEmptyState
            title="No contributions"
            message="Your contribution history will appear here."
          />
        )}
        {visibleContributions.map((item) => (
          <AppCard key={item.id}>
            <VStack className="gap-2">
              <VStack className="flex-row items-center justify-between">
                <Text className="font-semibold">
                  {item.contributionTypeName ?? "Contribution"}
                </Text>
                <StatusBadge status={item.status} />
              </VStack>
              <CurrencyAmount value={item.amount} />
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                {normalizeContributionPaymentMethod(item.method) && (
                  <PaymentMethodIcon
                    method={normalizeContributionPaymentMethod(item.method)!}
                    color={colors.primary}
                    size={16}
                  />
                )}
                <Text size="sm" className="text-muted-foreground">
                  {contributionPaymentMethodLabel(
                    normalizeContributionPaymentMethod(item.method) ?? "cash",
                  )} • {formatFinancialDate(item.contributedAt)}{" "}
                </Text>
                {item.reference ? `• ${item.reference}` : ""}
              </View>
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
