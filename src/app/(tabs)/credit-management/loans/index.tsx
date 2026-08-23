import { RefreshControl, ScrollView, View } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { LoanCard } from "@/components/credit-management/LoanCard";
import { AppEmptyState, AppErrorState } from "@/components/ui/AppStates";
import { AppSkeleton } from "@/components/ui/AppSkeleton";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";
import { useLoans } from "@/hooks/useLoans";
import { useRouter } from "expo-router";
import { AppButton } from "@/components/ui/AppButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/text";
import {
  CreditLoanRequestDialog,
  CreditRepaymentDialog,
} from "@/components/feedback/CreditLoanDialogs";
import type { CreditLoan } from "@/types/creditManagement";
import { useState } from "react";

export default function LoansListScreen() {
  const router = useRouter();
  const { loans, loading, error, refresh } = useLoans();
  const [requestOpen, setRequestOpen] = useState(false);
  const [repaymentLoan, setRepaymentLoan] = useState<CreditLoan>();
  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
        contentContainerStyle={{ gap: 16, paddingBottom: 32 }}
      >
        <Heading size="3xl">My loans</Heading>
        <AppButton
          title="Request a loan"
          onPress={() => setRequestOpen(true)}
        />
        {loading && !loans.length && (
          <VStack className="gap-3">
            <AppSkeleton height={150} />
            <AppSkeleton height={150} />
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
