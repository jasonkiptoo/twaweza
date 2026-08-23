import { useEffect } from "react";
import { ScrollView } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppEmptyState, AppErrorState } from "@/components/ui/AppStates";
import { AppSkeleton } from "@/components/ui/AppSkeleton";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { Heading } from "@/components/ui/heading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useAuthStore } from "@/store/authStore";
import { useAdminStore } from "@/store/adminStore";
import { AppDialog } from "@/components/feedback/AppDialog";
import { useState } from "react";

export default function AdminContributionsScreen() {
  const token = useAuthStore((state) => state.token);
  const {
    contributions,
    loading,
    mutating,
    error,
    fetchContributions,
    decideContribution,
  } = useAdminStore();
  const [selected, setSelected] = useState<{
    id: string;
    decision: "approve" | "reject";
  }>();
  useEffect(() => {
    if (token) void fetchContributions(token, 1);
  }, [fetchContributions, token]);
  const selectedContribution = contributions.find(
    (item) => item.id === selected?.id,
  );
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 32 }}>
        <Heading size="3xl">Contribution approvals</Heading>
        {loading && !contributions.length && <AppSkeleton height={150} />}
        {error && (
          <AppErrorState
            message={error}
            onRetry={() => (token ? fetchContributions(token, 1) : undefined)}
          />
        )}
        {!loading && !error && !contributions.length && (
          <AppEmptyState
            title="No pending contributions"
            message="There are no contribution approvals waiting for review."
          />
        )}
        {contributions.map((item) => (
          <AppCard key={item.id}>
            <VStack className="gap-3">
              <VStack className="flex-row items-center justify-between">
                <Text className="font-semibold">Contribution {item.id}</Text>
                <StatusBadge status={item.status} />
              </VStack>
              <CurrencyAmount value={item.amount} />
              <Text className="text-muted-foreground">
                {item.paymentMethod ?? "Payment method unavailable"}{" "}
                {item.reference ? `• ${item.reference}` : ""}
              </Text>
              <VStack className="flex-row gap-3">
                <AppButton
                  title="Approve"
                  loading={mutating}
                  onPress={() =>
                    setSelected({ id: item.id, decision: "approve" })
                  }
                />
                <AppButton
                  title="Reject"
                  variant="destructive"
                  loading={mutating}
                  onPress={() =>
                    setSelected({ id: item.id, decision: "reject" })
                  }
                />
              </VStack>
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
                await decideContribution(token, selected.id, selected.decision);
                setSelected(undefined);
              }}
            />
          </>
        }
      >
        <VStack className="gap-2">
          <Text className="font-semibold">Member contribution</Text>
          <CurrencyAmount value={selectedContribution?.amount} />
          <Text className="text-muted-foreground">
            {selectedContribution?.month ?? ""}{" "}
            {selectedContribution?.year ?? ""}
          </Text>
          <Text className="text-muted-foreground">
            {selectedContribution?.paymentMethod ??
              "Payment method unavailable"}
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
