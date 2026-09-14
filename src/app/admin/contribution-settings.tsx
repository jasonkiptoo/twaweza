import {
    contributionPaymentMethodLabel,
    PaymentMethodIcon,
    type ContributionPaymentMethod,
} from "@/components/credit-management/PaymentMethodIcon";
import { AppDialog } from "@/components/feedback/AppDialog";
import { Screen } from "@/components/layout/Screen";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppSkeleton } from "@/components/ui/AppSkeleton";
import { AppEmptyState, AppErrorState } from "@/components/ui/AppStates";
import { FormField } from "@/components/ui/FormField";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/authStore";
import { useContributionSettingsStore } from "@/store/contributionSettingsStore";
import type {
    ContributionFrequency,
    ContributionType,
} from "@/types/creditManagement";
import { getApiErrorMessage } from "@/utils/apiError";
import { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

interface TypeForm {
  name: string;
  description: string;
  amount: string;
  currency: string;
  frequency: ContributionFrequency;
  active: boolean;
}

const defaultTypeForm: TypeForm = {
  name: "",
  description: "",
  amount: "",
  currency: "KES",
  frequency: "monthly",
  active: true,
};

const frequencies: { label: string; value: ContributionFrequency }[] = [
  { label: "None", value: "none" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

const boolOptions = [
  { label: "Yes", value: "true" },
  { label: "No", value: "false" },
];

const paymentMethods: ContributionPaymentMethod[] = ["mpesa", "bank", "cash"];

export default function AdminContributionSettingsScreen() {
  const { colors } = useTheme();
  const token = useAuthStore((state) => state.token);
  const settings = useContributionSettingsStore((state) => state.settings);
  const settingsLoading = useContributionSettingsStore(
    (state) => state.loading,
  );
  const error = useContributionSettingsStore((state) => state.error);
  const fetchSettings = useContributionSettingsStore((state) => state.fetch);
  const types = useContributionSettingsStore((state) => state.types);
  const typesLoading = useContributionSettingsStore(
    (state) => state.typesLoading,
  );
  const mutatingType = useContributionSettingsStore(
    (state) => state.mutatingType,
  );
  const typesError = useContributionSettingsStore((state) => state.typesError);
  const fetchTypes = useContributionSettingsStore((state) => state.fetchTypes);
  const addType = useContributionSettingsStore((state) => state.addType);
  const editType = useContributionSettingsStore((state) => state.editType);

  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<ContributionType | null>(null);
  const [typeForm, setTypeForm] = useState<TypeForm>(defaultTypeForm);
  const [typeFeedback, setTypeFeedback] = useState("");
  const [paymentFeedback, setPaymentFeedback] = useState("");

  useEffect(() => {
    if (token) {
      void fetchSettings(token);
      void fetchTypes(token);
    }
  }, [fetchSettings, fetchTypes, token]);

  const openAddType = () => {
    setEditingType(null);
    setTypeForm(defaultTypeForm);
    setTypeFeedback("");
    setTypeDialogOpen(true);
  };

  const openEditType = (type: ContributionType) => {
    setEditingType(type);
    setTypeForm({
      name: type.name,
      description: type.description ?? "",
      amount: String(type.amount),
      currency: type.currency,
      frequency: type.frequency,
      active: type.active,
    });
    setTypeFeedback("");
    setTypeDialogOpen(true);
  };

  const handleSaveType = async () => {
    if (!token) return;
    if (!typeForm.name.trim() || !typeForm.amount) {
      setTypeFeedback("Name and amount are required.");
      return;
    }
    setTypeFeedback("");
    const payload = {
      name: typeForm.name.trim(),
      description: typeForm.description.trim(),
      amount: Number(typeForm.amount) || 0,
      currency: typeForm.currency,
      frequency: typeForm.frequency,
      active: typeForm.active,
    };
    try {
      if (editingType) {
        await editType(token, editingType.id, payload);
      } else {
        await addType(token, payload);
      }
      setTypeDialogOpen(false);
    } catch (err) {
      setTypeFeedback(getApiErrorMessage(err));
    }
  };

  const savePaymentMethods = async () => {
    if (!token || !settings) return;
    if (!settings.allowedMethods.length) {
      setPaymentFeedback("Enable at least one payment method.");
      return;
    }
    try {
      setPaymentFeedback("");
      await useContributionSettingsStore.getState().update(token, {
        allowedMethods: settings.allowedMethods,
      });
      setPaymentFeedback("Payment methods saved.");
    } catch (err) {
      setPaymentFeedback(getApiErrorMessage(err));
    }
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 16, paddingBottom: 32 }}
      >
        <VStack className="gap-2">
          <Heading size="3xl">Contribution settings</Heading>
          <Text className="text-muted-foreground">
            Configure the group&apos;s contribution policy and loan eligibility
            rules.
          </Text>
        </VStack>

        {settingsLoading && !settings && <AppSkeleton height={160} />}

        <VStack className="gap-3">
          <VStack className="flex-row items-center justify-between">
            <Heading size="lg">Contribution types</Heading>
            <AppButton title="+ Add" onPress={openAddType} />
          </VStack>
          <Text className="text-muted-foreground">
            Named contributions members can choose from, e.g. Monthly
            Contribution, Welfare, Development Fund.
          </Text>
          {typesLoading && !types.length && <AppSkeleton height={100} />}
          {typesError && (
            <Text style={{ color: colors.error }}>{typesError}</Text>
          )}
          {!typesLoading && !types.length && (
            <AppEmptyState
              title="No contribution types yet"
              message="Add a contribution type so members can select it when contributing."
            />
          )}
          {types.map((type) => (
            <Pressable key={type.id} onPress={() => openEditType(type)}>
              <AppCard>
                <VStack className="gap-1">
                  <VStack className="flex-row items-center justify-between">
                    <Text className="font-semibold">{type.name}</Text>
                    <Text
                      style={{
                        color: type.active ? colors.success : colors.error,
                      }}
                    >
                      {type.active ? "Active" : "Inactive"}
                    </Text>
                  </VStack>
                  <Text className="text-muted-foreground">
                    {type.currency} {type.amount} • {type.frequency}
                  </Text>
                </VStack>
              </AppCard>
            </Pressable>
          ))}
        </VStack>

        {error && (
          <AppErrorState
            message={error}
            onRetry={() => (token ? fetchSettings(token) : undefined)}
          />
        )}

        {settings && (
          <VStack className="gap-3">
            <Heading size="lg">Payment methods</Heading>
            <AppCard>
              <VStack className="gap-3">
                <Text className="text-muted-foreground">
                  Choose how members can record contributions for this group.
                </Text>
                <View style={styles.row}>
                  {paymentMethods.map((method) => {
                    const enabled = settings.allowedMethods.includes(method);
                    return (
                      <Pressable
                        key={method}
                        onPress={() => {
                          const allowedMethods = enabled
                            ? settings.allowedMethods.filter(
                                (item) => item !== method,
                              )
                            : [...settings.allowedMethods, method];
                          useContributionSettingsStore.setState({
                            settings: { ...settings, allowedMethods },
                          });
                          setPaymentFeedback("");
                        }}
                        style={[
                          styles.paymentMethod,
                          {
                            borderColor: enabled
                              ? colors.primary
                              : colors.border,
                            backgroundColor: enabled
                              ? colors.primary
                              : colors.card,
                          },
                        ]}
                      >
                        <PaymentMethodIcon
                          method={method}
                          color={enabled ? colors.onPrimary : colors.primary}
                        />
                        <Text
                          style={{
                            color: enabled
                              ? colors.onPrimary
                              : colors.textPrimary,
                            fontWeight: "600",
                          }}
                        >
                          {contributionPaymentMethodLabel(method)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                {paymentFeedback && (
                  <Text
                    style={{
                      color: paymentFeedback.includes("saved")
                        ? colors.success
                        : colors.error,
                    }}
                  >
                    {paymentFeedback}
                  </Text>
                )}
                <AppButton
                  title="Save payment methods"
                  onPress={savePaymentMethods}
                />
              </VStack>
            </AppCard>
            <Heading size="lg">Policy</Heading>
            <AppCard>
              <VStack className="gap-4">
                <PolicyRow
                  label="Contributions enabled"
                  value={settings.enabled ? "Yes" : "No"}
                />
                <PolicyRow
                  label="Contributions required"
                  value={settings.required ? "Yes" : "No"}
                />
                <PolicyRow
                  label="Minimum amount"
                  value={`${settings.currency} ${settings.minimumAmount}`}
                />
                <PolicyRow
                  label="Minimum frequency"
                  value={settings.minimumFrequency}
                />
                <PolicyRow
                  label="Minimum periods"
                  value={String(settings.minimumPeriods)}
                />
                <PolicyRow
                  label="Minimum confirmed amount"
                  value={`${settings.currency} ${settings.minimumConfirmedAmount}`}
                />
                <PolicyRow
                  label="Loan eligibility percentage"
                  value={`${settings.eligibilityPercentage}%`}
                />
                <PolicyRow
                  label="Loan multiplier"
                  value={`${settings.loanMultiplier}x confirmed contributions`}
                />
                <PolicyRow
                  label="Pending contributions count"
                  value={settings.allowPendingForEligibility ? "Yes" : "No"}
                />
                <PolicyRow
                  label="Approval required"
                  value={settings.approvalRequired ? "Yes" : "No"}
                />
                <PolicyRow
                  label="Allowed methods"
                  value={settings.allowedMethods.join(", ")}
                />
              </VStack>
            </AppCard>
          </VStack>
        )}
      </ScrollView>

      <AppDialog
        open={typeDialogOpen}
        title={editingType ? "Edit contribution type" : "Add contribution type"}
        onClose={() => setTypeDialogOpen(false)}
        footer={
          <View style={styles.dialogActions}>
            <View style={styles.dialogButton}>
              <AppButton
                title="Cancel"
                variant="outline"
                onPress={() => setTypeDialogOpen(false)}
              />
            </View>
            <View style={styles.dialogButton}>
              <AppButton
                title="Save"
                loading={mutatingType}
                onPress={handleSaveType}
              />
            </View>
          </View>
        }
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.dialogContent}
          >
            <VStack className="gap-4">
              {typeFeedback && (
                <Text style={{ color: colors.error }}>{typeFeedback}</Text>
              )}
              <FormField label="Name" required>
                <AppInput
                  value={typeForm.name}
                  onChangeText={(v) =>
                    setTypeForm((prev) => ({ ...prev, name: v }))
                  }
                  placeholder="Monthly Contribution"
                />
              </FormField>
              <FormField label="Description">
                <AppInput
                  value={typeForm.description}
                  onChangeText={(v) =>
                    setTypeForm((prev) => ({ ...prev, description: v }))
                  }
                  placeholder="Optional description"
                />
              </FormField>
              <FormField label="Amount" required>
                <AppInput
                  value={typeForm.amount}
                  onChangeText={(v) =>
                    setTypeForm((prev) => ({ ...prev, amount: v }))
                  }
                  keyboardType="number-pad"
                  placeholder="5050"
                />
              </FormField>
              <FormField label="Frequency">
                <View style={styles.row}>
                  {frequencies.map((opt) => (
                    <Pressable
                      key={opt.value}
                      onPress={() =>
                        setTypeForm((prev) => ({
                          ...prev,
                          frequency: opt.value,
                        }))
                      }
                      style={[
                        styles.chip,
                        {
                          borderColor: colors.border,
                          backgroundColor:
                            typeForm.frequency === opt.value
                              ? colors.primary
                              : "transparent",
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color:
                            typeForm.frequency === opt.value
                              ? colors.onPrimary
                              : colors.textPrimary,
                        }}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </FormField>
              <FormField label="Active">
                <View style={styles.row}>
                  {boolOptions.map((opt) => (
                    <Pressable
                      key={opt.value}
                      onPress={() =>
                        setTypeForm((prev) => ({
                          ...prev,
                          active: opt.value === "true",
                        }))
                      }
                      style={[
                        styles.chip,
                        {
                          borderColor: colors.border,
                          backgroundColor:
                            String(typeForm.active) === opt.value
                              ? colors.primary
                              : "transparent",
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color:
                            String(typeForm.active) === opt.value
                              ? colors.onPrimary
                              : colors.textPrimary,
                        }}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </FormField>
            </VStack>
          </ScrollView>
        </KeyboardAvoidingView>
      </AppDialog>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  paymentMethod: {
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dialogActions: {
    flexDirection: "row",
    gap: 12,
  },
  dialogButton: {
    flex: 1,
  },
  dialogContent: {
    padding: 16,
  },
});

function PolicyRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={policyRowStyles.container}>
      <Text className="text-muted-foreground">{label}</Text>
      <Text>{value}</Text>
    </View>
  );
}

const policyRowStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
});
