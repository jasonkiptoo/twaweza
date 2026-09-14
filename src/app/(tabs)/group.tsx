import { Screen } from "@/components/layout/Screen";
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
import { useDashboardStore } from "@/store/dashboardStore";
import { useGroupStore } from "@/store/groupStore";
import { formatCurrency } from "@/utils/currency";
import { formatFinancialDate } from "@/utils/date";
import { Landmark, Users } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";

const sections = ["Overview", "Contributions", "Members", "Bank Info"] as const;
type GroupSection = (typeof sections)[number];

export default function GroupScreen() {
  const { colors } = useTheme();
  const token = useAuthStore((state) => state.token);
  const group = useGroupStore((state) => state.group);
  const groupLoading = useGroupStore((state) => state.isLoading);
  const groupError = useGroupStore((state) => state.error);
  const fetchGroup = useGroupStore((state) => state.fetchGroup);
  const contributions = useContributionStore((state) => state.contributions);
  const contributionLoading = useContributionStore((state) => state.loading);
  const contributionError = useContributionStore((state) => state.error);
  const fetchContributions = useContributionStore((state) => state.fetch);
  const financialSummary = useDashboardStore((state) => state.financialSummary);
  const financialLoading = useDashboardStore((state) => state.financialLoading);
  const financialError = useDashboardStore((state) => state.financialError);
  const fetchFinancialSummary = useDashboardStore(
    (state) => state.fetchFinancialSummary,
  );
  const [section, setSection] = useState<GroupSection>("Overview");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    await fetchGroup(token);
    await fetchFinancialSummary(token);
    if (section === "Contributions") await fetchContributions(token, 1);
  }, [fetchContributions, fetchFinancialSummary, fetchGroup, section, token]);
  useEffect(() => {
    void load();
  }, [load]);

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }
  const error = groupError || contributionError;
  return (
    <Screen
      eyebrow="Your savings community"
      title={group?.name ?? "The Squad"}
      showBack
    >
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
        {groupLoading && !group ? (
          <AppSkeleton height={180} />
        ) : group ? (
          <AppCard>
            <VStack className="gap-3">
              <View className="flex-row items-center gap-3">
                <Users color={colors.primary} size={24} />
                <Heading size="xl">{group.name ?? "Your group"}</Heading>
              </View>
              <Text className="text-muted-foreground">
                {group.description || "A focused space for shared savings."}
              </Text>
              <View className="flex-row justify-between">
                <VStack>
                  <Text size="sm" className="text-muted-foreground">
                    Total savings
                  </Text>
                  <CurrencyAmount value={group.totalSavings} />
                </VStack>
                <VStack>
                  <Text size="sm" className="text-muted-foreground">
                    Monthly target
                  </Text>
                  <CurrencyAmount value={group.monthlyTarget} />
                </VStack>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-muted-foreground">
                  Code: {group.code ?? "Not available"}
                </Text>
                <StatusBadge status={group.status} />
              </View>
              {group.location && (
                <Text className="text-muted-foreground">
                  {group.location.city}, {group.location.country}
                </Text>
              )}
            </VStack>
          </AppCard>
        ) : (
          <AppEmptyState
            title="Group unavailable"
            message="We could not find your group details."
          />
        )}
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          horizontal
          contentContainerStyle={{ gap: 8 }}
        >
          {sections.map((item) => (
            <AppButton
              key={item}
              title={item}
              variant={section === item ? "default" : "outline"}
              onPress={() => setSection(item)}
            />
          ))}
        </ScrollView>
        {error && <AppErrorState message={error} onRetry={load} />}
        {section === "Overview" && (
          <VStack className="gap-3">
            <Heading size="lg">Group financial position</Heading>
            {financialLoading && !financialSummary ? (
              <AppSkeleton height={190} />
            ) : financialError && !financialSummary ? (
              <AppErrorState message={financialError} onRetry={load} />
            ) : financialSummary ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {[
                  [
                    "Available funds",
                    financialSummary.financialPosition.availableGroupFunds,
                  ],
                  [
                    "Total contributions",
                    financialSummary.contributions.confirmedTotal,
                  ],
                  ["Loans disbursed", financialSummary.loans.totalDisbursed],
                  [
                    "Outstanding loans",
                    financialSummary.loans.outstandingPrincipal,
                  ],
                  [
                    "Total repaid",
                    financialSummary.loans.totalRepaid ??
                      financialSummary.loans.repaidPrincipal,
                  ],
                  [
                    "Pending contributions",
                    financialSummary.contributions.pendingTotal,
                  ],
                ].map(([label, value]) => (
                  <AppCard
                    key={String(label)}
                    style={{ flexBasis: "47%", flexGrow: 1 }}
                  >
                    <Text size="sm" className="text-muted-foreground">
                      {label}
                    </Text>
                    <Text className="text-lg font-bold">
                      {formatCurrency(
                        Number(value),
                        financialSummary.group.currency,
                      )}
                    </Text>
                  </AppCard>
                ))}
                <AppCard style={{ flexBasis: "47%", flexGrow: 1 }}>
                  <Text size="sm" className="text-muted-foreground">
                    Members
                  </Text>
                  <Text className="text-lg font-bold">
                    {financialSummary.contributions.memberCount}
                  </Text>
                </AppCard>
                <AppCard style={{ flexBasis: "47%", flexGrow: 1 }}>
                  <Text size="sm" className="text-muted-foreground">
                    Active loans
                  </Text>
                  <Text className="text-lg font-bold">
                    {financialSummary.loans.activeLoans}
                  </Text>
                </AppCard>
              </View>
            ) : null}
          </VStack>
        )}
        {section === "Contributions" && (
          <VStack className="gap-3">
            {contributionLoading && !contributions.length && (
              <AppSkeleton height={140} />
            )}
            {!contributionLoading &&
              !contributionError &&
              !contributions.length && (
                <AppEmptyState
                  title="No contributions"
                  message="Your group contribution history will appear here."
                />
              )}
            {contributions.slice(0, 5).map((item) => (
              <AppCard key={item.id}>
                <View className="flex-row items-center justify-between">
                  <VStack className="gap-1">
                    <Text className="font-semibold">
                      {item.contributionTypeName ?? "Contribution"}
                    </Text>
                    <Text size="sm" className="text-muted-foreground">
                      {item.method} • {formatFinancialDate(item.contributedAt)}
                    </Text>
                  </VStack>
                  <VStack className="items-end gap-1">
                    <CurrencyAmount value={item.amount} />
                    <StatusBadge status={item.status} />
                  </VStack>
                </View>
              </AppCard>
            ))}
          </VStack>
        )}
        {section === "Members" && (
          <VStack className="gap-3">
            {group?.members?.length ? (
              group.members.map((member) => (
                <AppCard key={member.id ?? member._id ?? member.username}>
                  <View className="flex-row items-center gap-3">
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: colors.secondary,
                      }}
                      className="items-center justify-center"
                    >
                      <Text style={{ color: colors.onPrimary }}>
                        {(
                          member.first_name?.[0] ??
                          member.username?.[0] ??
                          "?"
                        ).toUpperCase()}
                      </Text>
                    </View>
                    <VStack className="flex-1">
                      <Text className="font-semibold">
                        {member.first_name || member.last_name
                          ? `${member.first_name ?? ""} ${member.last_name ?? ""}`.trim()
                          : member.username}
                      </Text>
                      <Text size="sm" className="text-muted-foreground">
                        @{member.username ?? "member"}
                      </Text>
                    </VStack>
                    <StatusBadge status={member.role} />
                  </View>
                </AppCard>
              ))
            ) : (
              <AppEmptyState
                title="No members to show"
                message="Member details are not available yet."
              />
            )}
          </VStack>
        )}
        {section === "Bank Info" && (
          <VStack className="gap-3">
            {group?.banks?.length ? (
              group.banks.map((bank, index) => (
                <AppCard key={`${bank.name ?? "bank"}-${index}`}>
                  <View className="flex-row gap-3">
                    <Landmark color={colors.primary} size={22} />
                    <VStack>
                      <Text className="font-semibold">
                        {bank.name ?? "Bank account"}
                        {bank.isPrimary ? " (Primary)" : ""}
                      </Text>
                      <Text size="sm" className="text-muted-foreground">
                        Paybill: {bank.paybill ?? "N/A"}
                      </Text>
                      <Text size="sm" className="text-muted-foreground">
                        {bank.accountNumber ?? "Account number unavailable"}
                      </Text>
                    </VStack>
                  </View>
                </AppCard>
              ))
            ) : (
              <AppEmptyState
                title="Bank information unavailable"
                message="Your group has not provided bank details yet."
              />
            )}
          </VStack>
        )}
      </ScrollView>
    </Screen>
  );
}
