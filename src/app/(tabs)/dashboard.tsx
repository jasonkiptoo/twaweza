import { useCallback, useEffect } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import {
  Bell,
  Eye,
  EyeOff,
  Plus,
  Send,
  WalletCards,
} from "lucide-react-native";
import { Screen } from "@/components/layout/Screen";
import { AppCard } from "@/components/ui/AppCard";
import { AppEmptyState, AppErrorState } from "@/components/ui/AppStates";
import { AppSkeleton, CardSkeleton } from "@/components/ui/AppSkeleton";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { Heading } from "@/components/ui/heading";
import { IconButton } from "@/components/ui/IconButton";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/authStore";
import { useGroupStore } from "@/store/groupStore";
import { useActivityStore } from "@/store/activityStore";
import { useUserStore } from "@/store/userStore";
import { useState } from "react";
import { formatKes } from "@/utils/currency";
import { DepositDialog } from "@/components/feedback/LegacyLoanDialogs";
import { router } from "expo-router";

export default function DashboardScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const group = useGroupStore((state) => state.group);
  const groupLoading = useGroupStore((state) => state.isLoading);
  const groupError = useGroupStore((state) => state.error);
  const fetchGroup = useGroupStore((state) => state.fetchGroup);
  const activities = useActivityStore((state) => state.activities);
  const activityLoading = useActivityStore((state) => state.loading);
  const activityError = useActivityStore((state) => state.error);
  const fetchActivity = useActivityStore((state) => state.fetch);
  const summary = useUserStore((state) => state.summary) as
    { user_contribution?: number; user_loan_limit?: number } | undefined;
  const summaryLoading = useUserStore((state) => state.isLoading);
  const summaryError = useUserStore((state) => state.error);
  const fetchSummary = useUserStore((state) => state.fetchSummary);
  const [refreshing, setRefreshing] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [dialog, setDialog] = useState<"deposit" | "request" | "repay" | null>(
    null,
  );

  const load = useCallback(async () => {
    if (!token) return;
    await Promise.all([
      fetchGroup(token),
      fetchActivity(token, 1),
      fetchSummary(token),
    ]);
  }, [fetchActivity, fetchGroup, fetchSummary, token]);
  useEffect(() => {
    void load();
  }, [load]);

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }
  const firstName = user?.firstName ?? user?.username ?? "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const isLoading = groupLoading || activityLoading || summaryLoading;
  const hasError = groupError || summaryError || activityError;

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={{ gap: 20, paddingBottom: 32 }}
      >
        <View className="flex-row items-center justify-between">
          <VStack className="gap-1">
            <Text className="text-muted-foreground">{greeting}</Text>
            <Heading size="2xl">{firstName}</Heading>
          </VStack>
          <IconButton label="Notifications">
            <Bell size={22} color={colors.textPrimary} />
          </IconButton>
        </View>
        {hasError && <AppErrorState message={hasError} onRetry={load} />}
        {isLoading && !group ? (
          <CardSkeleton />
        ) : (
          <AppCard style={{ backgroundColor: colors.primary }}>
            <VStack className="gap-4">
              <View className="flex-row items-center justify-between">
                <Text style={{ color: colors.onPrimary }}>
                  Group savings balance
                </Text>
                <IconButton
                  label={balanceVisible ? "Hide balance" : "Show balance"}
                  onPress={() => setBalanceVisible((visible) => !visible)}
                >
                  <>
                    {balanceVisible ? (
                      <Eye size={20} color={colors.primary} />
                    ) : (
                      <EyeOff size={20} color={colors.primary} />
                    )}
                  </>
                </IconButton>
              </View>
              <Text
                style={{
                  color: colors.onPrimary,
                  fontSize: 30,
                  fontWeight: "700",
                }}
              >
                {balanceVisible ? formatKes(group?.totalSavings) : "KES ••••••"}
              </Text>
              <View className="flex-row justify-between">
                <VStack>
                  <Text style={{ color: colors.onPrimary, opacity: 0.8 }}>
                    Monthly target
                  </Text>
                  <Text style={{ color: colors.onPrimary }}>
                    {formatKes(group?.monthlyTarget)}
                  </Text>
                </VStack>
                <VStack>
                  <Text style={{ color: colors.onPrimary, opacity: 0.8 }}>
                    Your contribution
                  </Text>
                  <Text style={{ color: colors.onPrimary }}>
                    {formatKes(summary?.user_contribution)}
                  </Text>
                </VStack>
              </View>
            </VStack>
          </AppCard>
        )}
        <VStack className="gap-3">
          <Heading size="lg">Quick actions</Heading>
          <View className="flex-row flex-wrap gap-3">
            <Pressable
              className="min-w-[30%] flex-1"
              onPress={() => setDialog("deposit")}
              accessibilityRole="button"
              accessibilityLabel="Deposit contribution"
            >
              <AppCard>
                <VStack className="items-center gap-2">
                  <Plus size={22} color={colors.primary} />
                  <Text className="text-center">Deposit</Text>
                </VStack>
              </AppCard>
            </Pressable>
            <Pressable
              className="min-w-[30%] flex-1"
              onPress={() => router.push("/(tabs)/credit-management/products")}
              accessibilityRole="button"
              accessibilityLabel="Request a loan"
            >
              <AppCard>
                <VStack className="items-center gap-2">
                  <Send size={22} color={colors.primary} />
                  <Text className="text-center">Request</Text>
                </VStack>
              </AppCard>
            </Pressable>
            <Pressable
              className="min-w-[30%] flex-1"
              onPress={() => router.push("/(tabs)/credit-management/loans")}
              accessibilityRole="button"
              accessibilityLabel="Repay a loan"
            >
              <AppCard>
                <VStack className="items-center gap-2">
                  <WalletCards size={22} color={colors.primary} />
                  <Text className="text-center">Repay</Text>
                </VStack>
              </AppCard>
            </Pressable>
          </View>
        </VStack>
        <VStack className="gap-3">
          <Heading size="lg">Recent activity</Heading>
          {activities.length === 0 && !activityLoading ? (
            <AppEmptyState
              title="No recent activity"
              message="Your group activity will appear here."
            />
          ) : (
            activities.slice(0, 5).map((activity) => (
              <AppCard key={activity.id}>
                <View className="flex-row items-center justify-between">
                  <VStack className="flex-1 gap-1">
                    <Text className="font-semibold">
                      {activity.description ??
                        activity.type ??
                        "Group activity"}
                    </Text>
                    {activity.createdAt && (
                      <Text size="sm" className="text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </Text>
                    )}
                  </VStack>
                  {activity.amount !== undefined && (
                    <CurrencyAmount value={activity.amount} />
                  )}
                </View>
              </AppCard>
            ))
          )}
        </VStack>
      </ScrollView>
      <DepositDialog
        open={dialog === "deposit"}
        onClose={() => setDialog(null)}
      />
    </Screen>
  );
}
