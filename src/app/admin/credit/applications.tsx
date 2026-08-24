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
import { useAuthStore } from "@/store/authStore";
import { useCreditManagementStore } from "@/store/creditManagementStore";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";

export default function AdminApplications() {
  const token = useAuthStore((state) => state.token);
  const items = useCreditManagementStore((state) => state.applications);
  const loading = useCreditManagementStore(
    (state) => state.applicationsLoading,
  );
  const error = useCreditManagementStore((state) => state.applicationsError);
  const deciding = useCreditManagementStore(
    (state) => state.decidingApplication,
  );
  const fetch = useCreditManagementStore((state) => state.fetchApplications);
  const decide = useCreditManagementStore((state) => state.decideApplication);
  const [feedback, setFeedback] = useState("");
  const [feedbackError, setFeedbackError] = useState("");
  const [note, setNote] = useState("");
  const [selected, setSelected] = useState<{
    id: string;
    decision: "approve" | "reject";
  }>();
  useEffect(() => {
    if (token) void fetch(token, { page: 1 });
  }, [fetch, token]);
  const selectedApplication = items.find((item) => item.id === selected?.id);
  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 16, paddingBottom: 32 }}
      >
        <Heading size="3xl">Application review</Heading>
        {feedback && <Text className="text-success">{feedback}</Text>}
        {feedbackError && <Text className="text-error">{feedbackError}</Text>}
        {loading && !items.length && <AppSkeleton height={150} />}
        {error && (
          <AppErrorState
            message={error}
            onRetry={() => (token ? fetch(token, { page: 1 }) : undefined)}
          />
        )}
        {!loading && !error && !items.length && (
          <AppEmptyState
            title="No applications"
            message="The review queue is empty."
          />
        )}
        {items.map((item) => (
          <VStack key={item.id} className="gap-2">
            <ApplicationCard application={item} />
            {["submitted", "pending approval"].includes(
              item.status?.toLowerCase() ?? "",
            ) && (
              <VStack className="flex-row gap-3">
                <AppButton
                  title="Approve"
                  loading={deciding}
                  onPress={() =>
                    setSelected({ id: item.id, decision: "approve" })
                  }
                />
                <AppButton
                  title="Reject"
                  variant="destructive"
                  loading={deciding}
                  onPress={() =>
                    setSelected({ id: item.id, decision: "reject" })
                  }
                />
              </VStack>
            )}
          </VStack>
        ))}
      </ScrollView>
      <AppDialog
        open={Boolean(selectedApplication)}
        title={`${selected?.decision === "approve" ? "Approve" : "Reject"} application`}
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
              loading={deciding}
              onPress={async () => {
                if (!token || !selected) return;
                try {
                  setFeedbackError("");
                  await decide(
                    token,
                    selected.id,
                    selected.decision,
                    note.trim() || undefined,
                  );
                  setFeedback("Application updated successfully.");
                } catch {
                  setFeedbackError("Unable to update application.");
                } finally {
                  setNote("");
                  setSelected(undefined);
                }
              }}
            />
          </>
        }
      >
        <VStack className="gap-2">
          <Text className="font-semibold">
            {selectedApplication?.productSnapshot?.name ??
              (typeof selectedApplication?.product === "object"
                ? selectedApplication.product.name
                : "Loan application")}
          </Text>
          <Text>
            Requested amount: KES {selectedApplication?.requestedAmount ?? 0}
          </Text>
          {typeof selectedApplication?.member === "object" && (
            <Text>
              Member:{" "}
              {selectedApplication.member.username ??
                selectedApplication.member.email ??
                "Member"}
            </Text>
          )}
          {selectedApplication?.productSnapshot && (
            <Text>
              Terms: {selectedApplication.productSnapshot.interestRate ?? 0}%{" "}
              {selectedApplication.productSnapshot.interestType ?? ""},{" "}
              {selectedApplication.productSnapshot.repaymentFrequency ?? ""} for{" "}
              {selectedApplication.productSnapshot.repaymentDurationMonths ?? 0}{" "}
              months
            </Text>
          )}
          <Text>Purpose: {selectedApplication?.purpose ?? "Not provided"}</Text>
          <Text>Comments: {selectedApplication?.comments ?? "None"}</Text>
          <Text>Status: {selectedApplication?.status ?? "Unknown"}</Text>
          <FormField
            label={`${selected?.decision === "reject" ? "Rejection" : "Approval"} note`}
          >
            <AppInput
              value={note}
              onChangeText={setNote}
              placeholder="Optional note"
              multiline
            />
          </FormField>
        </VStack>
      </AppDialog>
    </Screen>
  );
}
