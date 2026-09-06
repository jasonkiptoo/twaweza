/**
 * Dashboard Screen (Redesigned)
 * Shows financial snapshot: ME + MY GROUP + MY LOANS + MY CONTRIBUTIONS
 * 
 * Key Principles:
 * - Backend is the source of truth for all financial data
 * - No calculations of financial values in React
 * - Use actual backend response contracts
 * - Proper error handling and loading states with skeleton loaders
 * - Pull-to-refresh support
 */

import { useFocusEffect, router } from "expo-router";
import {
  AlertCircle,
  Bell,
  Eye,
  EyeOff,
  Plus,
  Send,
  TrendingUp,
  Wallet,
  WalletCards,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { AppCard } from "@/components/ui/AppCard";
import { CardSkeleton } from "@/components/ui/AppSkeleton";
import { AppEmptyState, AppErrorState } from "@/components/ui/AppStates";
import { Heading } from "@/components/ui/heading";
import { IconButton } from "@/components/ui/IconButton";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/authStore";
import { useDashboardStore } from "@/store/dashboardStore";
import { useContributionStore } from "@/store/contributionStore";
import { useGroupStore } from "@/store/groupStore";
import { formatCurrency } from "@/utils/currency";
import { isAdmin } from "@/types/auth";
import type { DashboardSummary, GroupFinancialSummary } from "@/types/creditManagement";

export default function DashboardScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const group = useGroupStore((state) => state.group);
  const fetchGroup = useGroupStore((state) => state.fetchGroup);

  // Dashboard state
  const dashboardSummary = useDashboardStore((state) => state.dashboardSummary);
  const dashboardLoading = useDashboardStore((state) => state.dashboardLoading);
  const dashboardError = useDashboardStore((state) => state.dashboardError);
  const fetchDashboardSummary = useDashboardStore(
    (state) => state.fetchDashboardSummary,
  );

  // Financial summary state

  // Contributions state
  const contributions = useContributionStore((state) => state.contributions);
  const contribLoading = useContributionStore((state) => state.loading);
  const fetchContributions = useContributionStore((state) => state.fetch);

  // UI state
  const [refreshing, setRefreshing] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [showContributionModal, setShowContributionModal] = useState(false);

  // Load data on component mount
  useEffect(() => {
    if (token) {
      fetchDashboardSummary(token);
      fetchContributions(token);
      fetchGroup(token);
    }
  }, [token, fetchDashboardSummary, fetchContributions, fetchGroup]);

  // Reload data when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (token) {
        fetchDashboardSummary(token);
        fetchContributions(token);
        fetchGroup(token);
      }
    }, [token, fetchDashboardSummary, fetchContributions, fetchGroup]),
  );

  // Pull-to-refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    if (token) {
      await Promise.all([
        fetchDashboardSummary(token),
        fetchContributions(token),
        fetchGroup(token),
      ]);
    }
    setRefreshing(false);
  };

  // Get greeting
  const firstName = user?.firstName ?? user?.username ?? "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const isUserAdmin = isAdmin(user);
  const isLoading = dashboardLoading || contribLoading;
  const hasError = dashboardError;

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={{ gap: 20, paddingBottom: 32 }}
      >
        {/* ========== HEADER ========== */}
        <View className="flex-row items-center justify-between">
          <VStack className="gap-1">
            <Text className="text-muted-foreground text-sm">{greeting}</Text>
            <Heading size="2xl">{firstName}</Heading>
            {(group?.name || dashboardSummary?.group?.name) && (
              <Text className="text-xs text-muted-foreground">
                {group?.name || dashboardSummary?.group?.name}
              </Text>
            )}
          </VStack>
          <IconButton label="Notifications">
            <Bell size={22} color={colors.textPrimary} />
          </IconButton>
        </View>

        {/* ========== ERROR STATE ========== */}
        {hasError && (
          <AppErrorState
            message={hasError}
            onRetry={() => {
              if (token) {
                fetchDashboardSummary(token);
              }
            }}
          />
        )}

        {/* ========== CONTRIBUTION PROGRESS ========== */}
        {dashboardSummary?.contributions ? (
          <VStack className="gap-3">
            <Heading size="lg">
              {dashboardSummary.contributions.frequency === "weekly"
                ? "Weekly Contribution"
                : dashboardSummary.contributions.frequency === "monthly"
                  ? "Monthly Contribution"
                  : "Contribution"}
            </Heading>
            <AppCard>
              <VStack className="gap-3">
                <View className="flex-row items-center justify-between">
                  <Text className="font-semibold">
                    {formatCurrency(
                      dashboardSummary.contributions.amount || 0,
                      dashboardSummary.group.currency,
                    )}{" "}
                    / {formatCurrency(
                      (dashboardSummary.contributions.amount || 0) *
                        (dashboardSummary.contributions.periods?.required || 1),
                      dashboardSummary.group.currency,
                    )}
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    {dashboardSummary.contributions.progress || 0}%
                  </Text>
                </View>

                {/* Progress Bar */}
                <View
                  style={{
                    height: 8,
                    backgroundColor: colors.muted + "30",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      height: "100%",
                      width: `${Math.min(dashboardSummary.contributions.progress || 0, 100)}%`,
                      backgroundColor: colors.primary,
                      borderRadius: 4,
                    }}
                  />
                </View>

                {/* Periods */}
                <Text className="text-xs text-muted-foreground">
                  {dashboardSummary.contributions.periods?.completed || 0} of{" "}
                  {dashboardSummary.contributions.periods?.required || 0} required
                  periods
                </Text>
              </VStack>
            </AppCard>
          </VStack>
        ) : null}

        {/* ========== MY FINANCIAL SNAPSHOT ========== */}
        {dashboardSummary ? (
          <VStack className="gap-3">
            <Heading size="lg">My Financial Position</Heading>
            <View className="gap-2">
              {/* My Contributions */}
              <AppCard>
                <View className="flex-row items-center justify-between gap-3">
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: colors.success + "20",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 20 }}>💰</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text className="text-xs text-muted-foreground">
                      My Contributions
                    </Text>
                    <Text className="font-semibold text-base">
                      {balanceVisible
                        ? formatCurrency(
                            dashboardSummary.myContribution.confirmedTotal || 0,
                            dashboardSummary.group.currency,
                          )
                        : "••••••"}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setBalanceVisible((visible) => !visible)}
                    accessibilityRole="button"
                    accessibilityLabel={
                      balanceVisible ? "Hide contribution balance" : "Show contribution balance"
                    }
                    style={{
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 6,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                    }}
                  >
                    <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
                      {balanceVisible ? "Hide" : "Show"}
                    </Text>
                  </Pressable>
                  {dashboardSummary.myContribution.pendingTotal > 0 && (
                    <Text className="text-xs text-orange-500">
                      ⏳ {formatCurrency(
                        dashboardSummary.myContribution.pendingTotal,
                        dashboardSummary.group.currency,
                      )}
                    </Text>
                  )}
                </View>
              </AppCard>

              {/* Active Loans */}
              {dashboardSummary.myLoans.active > 0 && (
                <AppCard>
                  <View className="flex-row items-center gap-3">
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: colors.primary + "20",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontSize: 20 }}>💳</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text className="text-xs text-muted-foreground">
                        Active Loans
                      </Text>
                      <Text className="font-semibold text-base">
                        {formatCurrency(
                          dashboardSummary.myLoans.totalActive || 0,
                          dashboardSummary.group.currency,
                        )}
                      </Text>
                    </View>
                    <Text className="text-xs text-muted-foreground">
                      {dashboardSummary.myLoans.active} loan(s)
                    </Text>
                  </View>
                </AppCard>
              )}

              {/* Next Repayment */}
              {dashboardSummary.myLoans.nextRepaymentAmount &&
                dashboardSummary.myLoans.nextRepaymentAmount > 0 && (
                  <AppCard>
                    <View className="flex-row items-center gap-3">
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: colors.warning + "20",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ fontSize: 20 }}>📅</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text className="text-xs text-muted-foreground">
                          Next Repayment Due
                        </Text>
                        <Text className="font-semibold text-base">
                          {formatCurrency(
                            dashboardSummary.myLoans.nextRepaymentAmount,
                            dashboardSummary.group.currency,
                          )}
                        </Text>
                      </View>
                      <Text className="text-xs text-muted-foreground">
                        {dashboardSummary.myLoans.nextRepaymentDate
                          ? new Date(
                              dashboardSummary.myLoans.nextRepaymentDate,
                            ).toLocaleDateString()
                          : "N/A"}
                      </Text>
                    </View>
                  </AppCard>
                )}
            </View>
          </VStack>
        ) : null}

        {/* ========== QUICK ACTIONS ========== */}
        <VStack className="gap-3">
          <Heading size="lg">Quick Actions</Heading>
          <View className="gap-3">
            <View className="flex-row gap-3">
              <Pressable
                className="flex-1"
                onPress={() => setShowContributionModal(true)}
                accessibilityRole="button"
                accessibilityLabel="Contribute"
              >
                <AppCard>
                  <VStack className="items-center gap-2">
                    <Plus size={22} color={colors.primary} />
                    <Text className="text-center text-xs">Contribute</Text>
                  </VStack>
                </AppCard>
              </Pressable>

              <Pressable
                className="flex-1"
                onPress={() =>
                  router.push("/(tabs)/credit-management/products")
                }
                accessibilityRole="button"
                accessibilityLabel="Request Loan"
              >
                <AppCard>
                  <VStack className="items-center gap-2">
                    <Send size={22} color={colors.primary} />
                    <Text className="text-center text-xs">Request Loan</Text>
                  </VStack>
                </AppCard>
              </Pressable>

              <Pressable
                className="flex-1"
                onPress={() => router.push("/(tabs)/credit-management/loans")}
                accessibilityRole="button"
                accessibilityLabel="Repay Loan"
              >
                <AppCard>
                  <VStack className="items-center gap-2">
                    <WalletCards size={22} color={colors.primary} />
                    <Text className="text-center text-xs">Repay Loan</Text>
                  </VStack>
                </AppCard>
              </Pressable>
            </View>

            {/* Admin Actions */}
            {isUserAdmin && (
              <Pressable
                onPress={() => router.push("/admin")}
                accessibilityRole="button"
                accessibilityLabel="Group Administration"
              >
                <AppCard
                  style={{
                    borderTopWidth: 2,
                    borderTopColor: colors.primary,
                  }}
                >
                  <View className="flex-row items-center gap-3">
                    <Text style={{ fontSize: 20 }}>⚙️</Text>
                    <View style={{ flex: 1 }}>
                      <Text className="font-semibold">Group Administration</Text>
                      <Text className="text-xs text-muted-foreground">
                        Manage approvals, settings, and members
                      </Text>
                    </View>
                    {dashboardSummary?.admin && (
                      <View className="gap-1">
                        {dashboardSummary.admin?.pendingContributions > 0 && (
                          <View
                            style={{
                              backgroundColor: colors.warning,
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              borderRadius: 4,
                            }}
                          >
                            <Text
                              style={{
                                color: "white",
                                fontSize: 11,
                                fontWeight: "600",
                              }}
                            >
                              {dashboardSummary.admin?.pendingContributions} pending
                            </Text>
                          </View>
                        )}
                        {dashboardSummary.admin?.pendingApplications > 0 && (
                          <View
                            style={{
                              backgroundColor: colors.primary,
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              borderRadius: 4,
                            }}
                          >
                            <Text
                              style={{
                                color: "white",
                                fontSize: 11,
                                fontWeight: "600",
                              }}
                            >
                              {dashboardSummary.admin?.pendingApplications} loans
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </AppCard>
              </Pressable>
            )}
          </View>
        </VStack>

        {/* ========== MY CONTRIBUTIONS HISTORY ========== */}
        {contributions.length > 0 && (
          <VStack className="gap-3">
            <View className="flex-row items-center justify-between">
              <Heading size="lg">My Contributions</Heading>
              <Pressable
                onPress={() => router.push("/(tabs)/contributions")}
                accessibilityRole="button"
              >
                <Text style={{ color: colors.primary }} className="text-sm">
                  View All →
                </Text>
              </Pressable>
            </View>

            <VStack className="gap-2">
              {contributions.slice(0, 3).map((contribution) => (
                <AppCard key={contribution.id}>
                  <View className="flex-row items-center justify-between">
                    <View style={{ flex: 1 }}>
                      <Text className="font-semibold text-sm">
                        {contribution.method} •{" "}
                        {formatCurrency(
                          contribution.amount,
                          contribution.currency,
                        )}
                      </Text>
                      <Text className="text-xs text-muted-foreground mt-1">
                        {new Date(contribution.contributedAt).toLocaleDateString()}
                      </Text>
                      {contribution.reference && (
                        <Text className="text-xs text-muted-foreground">
                          Ref: {contribution.reference}
                        </Text>
                      )}
                    </View>
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 4,
                        backgroundColor:
                          contribution.status === "confirmed"
                            ? colors.success + "20"
                            : contribution.status === "pending"
                              ? colors.warning + "20"
                              : colors.error + "20",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "600",
                          color:
                            contribution.status === "confirmed"
                              ? colors.success
                              : contribution.status === "pending"
                                ? colors.warning
                                : colors.error,
                        }}
                      >
                        {contribution.status === "confirmed"
                          ? "✓ Confirmed"
                          : contribution.status === "pending"
                            ? "⏳ Pending"
                            : "✗ " + contribution.status}
                      </Text>
                    </View>
                  </View>
                </AppCard>
              ))}
            </VStack>
          </VStack>
        )}

        {/* ========== EMPTY STATE ========== */}
        {!isLoading &&
          !hasError &&
          contributions.length === 0 &&
          dashboardSummary && (
            <AppEmptyState
              title="No contributions yet"
              message="Start contributing to your group"
            />
          )}
      </ScrollView>

      {/* ========== CONTRIBUTION MODAL ========== */}
      {/* TODO: Import and add ContributionModal component */}
      {showContributionModal && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.background + "80",
          }}
        >
          <View className="flex-1 items-center justify-end">
            <AppCard
              style={{
                width: "100%",
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              }}
            >
              <VStack className="gap-4">
                <Text className="text-lg font-bold">Add Contribution</Text>
                <Pressable
                  onPress={() => setShowContributionModal(false)}
                  className="py-2"
                >
                  <Text style={{ color: colors.primary }}>Close</Text>
                </Pressable>
              </VStack>
            </AppCard>
          </View>
        </View>
      )}
    </Screen>
  );
}
