import { Screen } from "@/components/layout/Screen";
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
import { useCreditManagementStore } from "@/store/creditManagementStore";
import { formatFinancialDate } from "@/utils/date";
import { CreditCard, PiggyBank } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";

export default function CreditHome() {
  const { colors } = useTheme();
  const token = useAuthStore((state) => state.token);
  const contributions = useContributionStore((state) => state.contributions);
  const contributionsLoading = useContributionStore((state) => state.loading);
  const contributionsError = useContributionStore((state) => state.error);
  const fetchContributions = useContributionStore((state) => state.fetch);
  const loans = useCreditManagementStore((state) => state.loans);
  const loansLoading = useCreditManagementStore((state) => state.loansLoading);
  const loansError = useCreditManagementStore((state) => state.loansError);
  const fetchLoans = useCreditManagementStore((state) => state.fetchLoans);
  const [section, setSection] = useState<"Contributions" | "Loans">(
    "Contributions",
  );

  const load = useCallback(async () => {
    if (!token) return;
    if (section === "Contributions") await fetchContributions(token, 1);
    else await fetchLoans(token, { page: 1 });
  }, [fetchContributions, fetchLoans, section, token]);

  useEffect(() => {
    void load();
  }, [load]);

  const isLoading =
    section === "Contributions" ? contributionsLoading : loansLoading;
  const error = section === "Contributions" ? contributionsError : loansError;

  return (
    <Screen eyebrow="Your finances" title="Finance" showBack>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={load}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={{ gap: 16, paddingBottom: 32 }}
      >
        <View
          style={{
            flexDirection: "row",
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
          }}
        >
          {(["Contributions", "Loans"] as const).map((item) => (
            <Pressable
              key={item}
              onPress={() => setSection(item)}
              accessibilityRole="tab"
              accessibilityState={{ selected: section === item }}
              style={{
                flex: 1,
                alignItems: "center",
                borderBottomColor:
                  section === item ? colors.primary : "transparent",
                borderBottomWidth: 3,
                paddingHorizontal: 12,
                paddingVertical: 14,
              }}
            >
              <Text
                className="font-semibold"
                style={{
                  color: section === item ? colors.primary : colors.textPrimary,
                }}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
        {error && <AppErrorState message={error} onRetry={load} />}
        {section === "Contributions" && (
          <VStack className="gap-3">
            <View className="flex-row items-center gap-3">
              <PiggyBank size={24} color={colors.primary} />
              <VStack>
                <Heading size="lg">My contributions</Heading>
                <Text className="text-muted-foreground">
                  Your contribution history and current statuses.
                </Text>
              </VStack>
            </View>
            {contributionsLoading && !contributions.length && (
              <AppSkeleton height={120} />
            )}
            {!contributionsLoading &&
              !contributionsError &&
              !contributions.length && (
                <AppEmptyState
                  title="No contributions"
                  message="Your contribution history will appear here."
                />
              )}
            {contributions.slice(0, 8).map((contribution) => (
              <AppCard key={contribution.id}>
                <View className="flex-row items-center justify-between gap-3">
                  <VStack className="flex-1 gap-1">
                    <Text className="font-semibold">
                      {contribution.contributionTypeName ?? "Contribution"}
                    </Text>
                    <Text size="sm" className="text-muted-foreground">
                      {contribution.method} •{" "}
                      {formatFinancialDate(contribution.contributedAt)}
                    </Text>
                  </VStack>
                  <VStack className="items-end gap-1">
                    <CurrencyAmount value={contribution.amount} />
                    <StatusBadge status={contribution.status} />
                  </VStack>
                </View>
              </AppCard>
            ))}
          </VStack>
        )}
        {section === "Loans" && (
          <VStack className="gap-3">
            <View className="flex-row items-center gap-3">
              <CreditCard size={24} color={colors.primary} />
              <VStack>
                <Heading size="lg">My loans</Heading>
                <Text className="text-muted-foreground">
                  Your loan balances and repayment status.
                </Text>
              </VStack>
            </View>
            {loansLoading && !loans.length && <AppSkeleton height={140} />}
            {!loansLoading && !loansError && !loans.length && (
              <AppEmptyState
                title="No loans"
                message="Your loans will appear here."
              />
            )}
            {loans.slice(0, 8).map((loan) => (
              <AppCard key={loan.id}>
                <View className="flex-row items-center justify-between gap-3">
                  <VStack className="flex-1 gap-1">
                    <Text className="font-semibold">
                      {loan.productSnapshot?.name ?? "Credit loan"}
                    </Text>
                    <View className="flex-row items-center gap-1">
                      <Text size="sm" className="text-muted-foreground">
                        Principal:
                      </Text>
                      <CurrencyAmount
                        value={loan.principalAmount ?? loan.principal}
                      />
                    </View>
                    {loan.nextPaymentDate && (
                      <Text size="sm" className="text-muted-foreground">
                        Next payment:{" "}
                        {formatFinancialDate(loan.nextPaymentDate)}
                      </Text>
                    )}
                  </VStack>
                  <VStack className="items-end gap-1">
                    <CurrencyAmount
                      value={loan.amountRemaining ?? loan.balance}
                    />
                    <StatusBadge status={loan.status} />
                  </VStack>
                </View>
              </AppCard>
            ))}
          </VStack>
        )}
      </ScrollView>
    </Screen>
  );
}
