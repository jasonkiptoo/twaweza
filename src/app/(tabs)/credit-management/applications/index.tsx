import { ApplicationCard } from "@/components/credit-management/ApplicationCard";
import { AppDialog } from "@/components/feedback/AppDialog";
import { Screen } from "@/components/layout/Screen";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppSkeleton } from "@/components/ui/AppSkeleton";
import { AppEmptyState, AppErrorState } from "@/components/ui/AppStates";
import { FormField } from "@/components/ui/FormField";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useLoanApplications } from "@/hooks/useLoanApplications";
import { useAuthStore } from "@/store/authStore";
import { useCreditManagementStore } from "@/store/creditManagementStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";

export default function ApplicationsScreen() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const decide = useCreditManagementStore((state) => state.decideApplication);
  const deciding = useCreditManagementStore(
    (state) => state.decidingApplication,
  );
  const { applications, loading, error, refresh, hasMore, loadMore } =
    useLoanApplications();
  const [selected, setSelected] = useState<(typeof applications)[number]>();
  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackError, setFeedbackError] = useState("");
  const [decisionLoading, setDecisionLoading] = useState<
    "approve" | "reject"
  >();

  async function submitDecision(decision: "approve" | "reject") {
    if (!token || !selected) return;
    setDecisionLoading(decision);
    console.log("[ApplicationsScreen] submitting decision", {
      applicationId: selected.id,
      decision,
    });
    try {
      setFeedbackError("");
      await decide(token, selected.id, decision, note.trim() || undefined);
      console.log("[ApplicationsScreen] decision succeeded", selected.id);
      setFeedback("Application updated successfully.");
      await refresh();
    } catch (cause) {
      console.error("[ApplicationsScreen] decision failed", cause);
      setFeedbackError("Unable to update application.");
    } finally {
      setDecisionLoading(undefined);
      setNote("");
      setSelected(undefined);
    }
  }
  return (
    <Screen>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refresh} />
          }
          contentContainerStyle={{ gap: 16, paddingBottom: 32 }}
        >
          <Heading size="3xl">My applications</Heading>
          {feedback && <Text className="text-success">{feedback}</Text>}
          {feedbackError && <Text className="text-error">{feedbackError}</Text>}
          {loading && !applications.length && <AppSkeleton height={130} />}
          {error && <AppErrorState message={error} onRetry={refresh} />}
          {!loading && !error && !applications.length && (
            <AppEmptyState
              title="No applications yet"
              message="Your submitted loan applications will appear here."
            />
          )}
          {applications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onPress={() => {
                console.log(
                  "[ApplicationsScreen] opening application",
                  application.id,
                );
                setSelected(application);
              }}
            />
          ))}
          {hasMore && (
            <AppButton
              title="Load more applications"
              loading={loading}
              onPress={loadMore}
              variant="outline"
            />
          )}
        </ScrollView>
        <AppButton
          title="Request a loan"
          onPress={() => router.push("/(tabs)/credit-management/products")}
          style={styles.fab}
          accessibilityLabel="Request a loan"
        />
        <AppDialog
          open={Boolean(selected)}
          title="Loan application details"
          onClose={() => setSelected(undefined)}
          footer={
            <>
              <AppButton
                title="Close"
                variant="outline"
                onPress={() => setSelected(undefined)}
              />
              {selected &&
              ["submitted", "pending approval"].includes(
                selected.status?.toLowerCase() ?? "",
              ) ? (
                  <>
                    <AppButton
                      title="Reject"
                      variant="destructive"
                      loading={decisionLoading === "reject"}
                      onPress={() => void submitDecision("reject")}
                    />
                    <AppButton
                      title="Approve"
                      loading={decisionLoading === "approve"}
                      onPress={() => void submitDecision("approve")}
                    />
                  </>
                ) : null}
            </>
          }
        >
          <VStack className="gap-2">
            <Text className="font-semibold">
              {selected?.productSnapshot?.name ?? "Loan application"}
            </Text>
            <Text>Requested amount: KES {selected?.requestedAmount ?? 0}</Text>
            <Text>Purpose: {selected?.purpose ?? "Not provided"}</Text>
            <Text>Comments: {selected?.comments ?? "None"}</Text>
            <Text>Status: {selected?.status ?? "Unknown"}</Text>
            {selected && (
              <FormField label="Decision note">
                <AppInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="Optional note"
                  multiline
                />
              </FormField>
            )}
          </VStack>
        </AppDialog>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fab: { position: "absolute", right: 16, bottom: 16, borderRadius: 24 },
});
