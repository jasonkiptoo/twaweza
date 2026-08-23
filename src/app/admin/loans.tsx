import { useEffect, useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { LoanCard } from "@/components/credit-management/LoanCard";
import { AppEmptyState, AppErrorState } from "@/components/ui/AppStates";
import { AppSkeleton } from "@/components/ui/AppSkeleton";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useAuthStore } from "@/store/authStore";
import { getPendingLegacyLoans } from "@/services/loanApi";
import type { CreditLoan } from "@/types/creditManagement";

export default function AdminLoansScreen() {
  const token = useAuthStore((state) => state.token);
  const [loans, setLoans] = useState<CreditLoan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function load() {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      setLoans(await getPendingLegacyLoans(token));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to load pending loans.",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, [token]);
  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading && Boolean(loans.length)}
            onRefresh={load}
          />
        }
        contentContainerStyle={{ gap: 16, paddingBottom: 32 }}
      >
        <Heading size="3xl">Loan management</Heading>
        {loading && !loans.length && <AppSkeleton height={150} />}
        {error && <AppErrorState message={error} onRetry={load} />}
        {!loading && !error && !loans.length && (
          <AppEmptyState
            title="No pending loans"
            message="There are no legacy loan requests waiting for review."
          />
        )}
        {loans.map((loan) => (
          <LoanCard key={loan.id} loan={loan} />
        ))}
      </ScrollView>
    </Screen>
  );
}
