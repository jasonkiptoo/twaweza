import { useEffect } from "react";
import { ScrollView, RefreshControl } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { AppEmptyState, AppErrorState } from "@/components/ui/AppStates";
import { LoanCard } from "@/components/credit-management/LoanCard";
import { AppSkeleton } from "@/components/ui/AppSkeleton";
import { Heading } from "@/components/ui/heading";
import { useAuthStore } from "@/store/authStore";
import { useCreditManagementStore } from "@/store/creditManagementStore";
export default function AdminPortfolio() {
  const token = useAuthStore((state) => state.token);
  const items = useCreditManagementStore((state) => state.portfolio);
  const loading = useCreditManagementStore((state) => state.portfolioLoading);
  const error = useCreditManagementStore((state) => state.portfolioError);
  const fetch = useCreditManagementStore((state) => state.fetchPortfolio);
  useEffect(() => {
    if (token) void fetch(token);
  }, [fetch, token]);
  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading && Boolean(items.length)}
            onRefresh={() => (token ? fetch(token) : undefined)}
          />
        }
        contentContainerStyle={{ gap: 16, paddingBottom: 32 }}
      >
        <Heading size="3xl">Portfolio</Heading>
        {loading && !items.length && <AppSkeleton height={150} />}
        {error && (
          <AppErrorState
            message={error}
            onRetry={() => (token ? fetch(token) : undefined)}
          />
        )}
        {!loading && !error && !items.length && (
          <AppEmptyState
            title="No portfolio records"
            message="Documented portfolio loan records will appear here."
          />
        )}
        {items.map((loan) => (
          <LoanCard key={loan.id} loan={loan} />
        ))}
      </ScrollView>
    </Screen>
  );
}
