import { LoanCard, LoanCardSkeleton } from "@/components/credit-management/LoanCard";
import {
    CreditLoanRequestDialog,
    CreditRepaymentDialog,
} from "@/components/feedback/CreditLoanDialogs";
import { Screen } from "@/components/layout/Screen";
import { AppButton } from "@/components/ui/AppButton";
import { AppEmptyState, AppErrorState } from "@/components/ui/AppStates";
import { Heading } from "@/components/ui/heading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useLoans } from "@/hooks/useLoans";
import { useTheme } from "@/hooks/useTheme";
import type { CreditLoan } from "@/types/creditManagement";
import { useRouter } from "expo-router";
import { useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";

export default function LoansListScreen() {
  const router = useRouter();
  const { loans, loading, error, refresh, hasMore, loadMore } = useLoans();
  const { colors } = useTheme();
  const [requestOpen, setRequestOpen] = useState(false);
  const [repaymentLoan, setRepaymentLoan] = useState<CreditLoan>();
  return (
    <Screen>
      <ScrollView
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
        contentContainerStyle={{ gap: 16, paddingBottom: 32 }}
      >
        <View style={{ backgroundColor: colors.background, paddingBottom: 4 }}>
          <Heading size="3xl">My loans</Heading>
        </View>
        <Text className="text-muted-foreground">
          Request a loan from an available product, or open a loan below to view
          its schedule and repay it.
        </Text>
        <AppButton
          title="Request a loan"
          onPress={() => setRequestOpen(true)}
        />
        {loading && !loans.length && (
          <VStack className="gap-3">
            <LoanCardSkeleton />
            <LoanCardSkeleton />
          </VStack>
        )}
        {error && <AppErrorState message={error} onRetry={refresh} />}
        {!loading && !error && !loans.length && (
          <AppEmptyState
            title="No active loans"
            message="Your credit-management loans will appear here."
          />
        )}
        {loans.map((loan) => (
          <VStack key={loan.id} className="gap-2">
            <LoanCard loan={loan} />
            <View className="flex-row justify-end">
              <AppButton
                title="Repay"
                variant="outline"
                onPress={() => setRepaymentLoan(loan)}
              />
            </View>
            {loan.status?.toLowerCase().includes("pending") && (
              <VStack className="flex-row items-center justify-between rounded-lg border border-border bg-card p-3">
                <Text>Awaiting approval</Text>
                <StatusBadge status={loan.status} />
              </VStack>
            )}
          </VStack>
        ))}
        {hasMore && (
          <AppButton
            title="Load more loans"
            loading={loading}
            onPress={loadMore}
            variant="outline"
          />
        )}
      </ScrollView>
      <CreditLoanRequestDialog
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        onSuccess={refresh}
      />
      <CreditRepaymentDialog
        open={Boolean(repaymentLoan)}
        loan={repaymentLoan}
        onClose={() => setRepaymentLoan(undefined)}
        onSuccess={refresh}
      />
    </Screen>
  );
}
