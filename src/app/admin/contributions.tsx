import { AppDialog } from "@/components/feedback/AppDialog";
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
import { useAuthStore } from "@/store/authStore";
import { useContributionStore } from "@/store/contributionStore";
import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";

export default function AdminContributionsScreen() {
  const token = useAuthStore((state) => state.token);
  const {
    groupContributions: contributions,
    groupLoading: loading,
    mutating,
    error,
    fetchGroupContributions,
    confirm,
    reject,
  } = useContributionStore();
  const [selected, setSelected] = useState<{
    id: string;
    decision: "approve" | "reject";
  }>();
  useEffect(() => {
    if (token) void fetchGroupContributions(token, 1);
  }, [fetchGroupContributions, token]);
  const selectedContribution = contributions.find(
    (item) => item.id === selected?.id,
  );
  const pendingContributions = contributions.filter(
    (item) => item.status === "pending",
  );
  const pendingCount = pendingContributions.length;
  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading && Boolean(contributions.length)}
            onRefresh={() =>
              token ? fetchGroupContributions(token, 1) : undefined
            }
          />
        }
        contentContainerStyle={styles.content}
      >
        <VStack className="gap-1">
          <Heading size="3xl">Contribution approvals</Heading>
          <Text className="text-muted-foreground">
            Review member payments that need a decision.
          </Text>
        </VStack>

        <AppCard className="bg-primary">
          <View style={styles.summaryRow}>
            <View style={styles.summaryBlock}>
              <Text className="text-sm text-primary-foreground">
                Pending approval
              </Text>
              <Text className="text-3xl font-bold text-primary-foreground">
                {pendingCount}
              </Text>
            </View>
            <Text className="text-right text-sm text-primary-foreground">
              {pendingCount === 1
                ? "Payment is waiting for review"
                : "Payments are waiting for review"}
            </Text>
          </View>
        </AppCard>

        {loading && !contributions.length && <AppSkeleton height={150} />}
        {error && (
          <AppErrorState
            message={error}
            onRetry={() =>
              token ? fetchGroupContributions(token, 1) : undefined
            }
          />
        )}
        {!loading && !error && !pendingContributions.length && (
          <AppEmptyState
            title="Nothing needs approval"
            message="New member contributions will appear here when they need review."
          />
        )}
        {pendingContributions.map((item) => (
          <AppCard key={item.id}>
            <VStack className="gap-3">
              <View style={styles.cardHeader}>
                <VStack className="flex-1 gap-1">
                  <Text className="font-semibold">
                    {item.member?.name ?? "Member"}
                  </Text>
                  <Text size="sm" className="text-muted-foreground">
                    {item.contributionTypeName ?? "Contribution"}
                  </Text>
                </VStack>
                <StatusBadge status={item.status} />
              </View>
              <View style={styles.amountRow}>
                <CurrencyAmount value={item.amount} size="lg" />
                <Text size="sm" className="text-muted-foreground">
                  {new Date(item.contributedAt).toLocaleDateString()}
                </Text>
              </View>
              <Text className="text-muted-foreground">
                {item.method}
                {item.reference ? ` • ${item.reference}` : ""}
              </Text>
              <View style={styles.actions}>
                <View style={styles.actionButton}>
                  <AppButton
                    title="Approve"
                    loading={mutating}
                    onPress={() =>
                      setSelected({ id: item.id, decision: "approve" })
                    }
                  />
                </View>
                <View style={styles.actionButton}>
                  <AppButton
                    title="Reject"
                    variant="destructive"
                    loading={mutating}
                    onPress={() =>
                      setSelected({ id: item.id, decision: "reject" })
                    }
                  />
                </View>
              </View>
            </VStack>
          </AppCard>
        ))}
      </ScrollView>
      <AppDialog
        open={Boolean(selectedContribution)}
        title={`${selected?.decision === "approve" ? "Approve" : "Reject"} contribution`}
        onClose={() => setSelected(undefined)}
        footer={
          <>
            <AppButton
              title="Cancel"
              variant="outline"
              onPress={() => setSelected(undefined)}
            />
            <AppButton
              title={selected?.decision === "approve" ? "Approve" : "Reject"}
              variant={
                selected?.decision === "reject" ? "destructive" : "default"
              }
              loading={mutating}
              onPress={async () => {
                if (!token || !selected) return;
                if (selected.decision === "approve") {
                  await confirm(token, selected.id);
                } else {
                  await reject(token, selected.id);
                }
                setSelected(undefined);
              }}
            />
          </>
        }
      >
        <VStack className="gap-2">
          <Text className="font-semibold">
            {selectedContribution?.member?.name ?? "Member"}
          </Text>
          <CurrencyAmount value={selectedContribution?.amount} />
          <Text className="text-muted-foreground">
            {selectedContribution?.contributionTypeName ?? "Contribution"}
          </Text>
          <Text className="text-muted-foreground">
            {selectedContribution?.method ?? "Payment method unavailable"}
          </Text>
          <Text className="text-muted-foreground">
            {selectedContribution?.reference ?? "No reference provided"}
          </Text>
          <StatusBadge status={selectedContribution?.status} />
        </VStack>
      </AppDialog>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 32,
  },
  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  summaryBlock: {
    gap: 2,
  },
  cardHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  amountRow: {
    alignItems: "baseline",
    flexDirection: "row",
    gap: 10,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
});
