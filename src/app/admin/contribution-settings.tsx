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
    ContributionMethod,
    ContributionType,
} from "@/types/creditManagement";
import { getApiErrorMessage } from "@/utils/apiError";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

const frequencies: { label: string; value: ContributionFrequency }[] = [
  { label: "None", value: "none" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

const methods: { label: string; value: ContributionMethod }[] = [
  { label: "Mpesa", value: "Mpesa" },
  { label: "Bank", value: "Bank" },
  { label: "Cash", value: "cash" },
];

const boolOptions = [
  { label: "Yes", value: "true" },
  { label: "No", value: "false" },
];

interface SettingsForm {
  enabled: string;
  required: string;
  minimumAmount: string;
  minimumFrequency: ContributionFrequency;
  minimumPeriods: string;
  minimumConfirmedAmount: string;
  eligibilityPercentage: string;
  loanMultiplier: string;
  allowPendingForEligibility: string;
  approvalRequired: string;
  allowedMethods: ContributionMethod[];
  currency: string;
}

const defaultForm: SettingsForm = {
  enabled: "true",
  required: "false",
  minimumAmount: "0",
  minimumFrequency: "monthly",
  minimumPeriods: "1",
  minimumConfirmedAmount: "0",
  eligibilityPercentage: "0",
  loanMultiplier: "1",
  allowPendingForEligibility: "false",
  approvalRequired: "true",
  allowedMethods: ["Mpesa"],
  currency: "KES",
};

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

export default function AdminContributionSettingsScreen() {
  const { colors } = useTheme();
  const token = useAuthStore((state) => state.token);
  const settings = useContributionSettingsStore((state) => state.settings);
  const loading = useContributionSettingsStore((state) => state.loading);
  const updating = useContributionSettingsStore((state) => state.updating);
  const error = useContributionSettingsStore((state) => state.error);
  const fetchSettings = useContributionSettingsStore((state) => state.fetch);
  const updateSettings = useContributionSettingsStore((state) => state.update);
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

  const [form, setForm] = useState<SettingsForm>(defaultForm);
  const [feedback, setFeedback] = useState("");

  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<ContributionType | null>(null);
  const [typeForm, setTypeForm] = useState<TypeForm>(defaultTypeForm);
  const [typeFeedback, setTypeFeedback] = useState("");

  useEffect(() => {
    if (token) {
      void fetchSettings(token);
      void fetchTypes(token);
    }
  }, [fetchSettings, fetchTypes, token]);

  useEffect(() => {
    if (!settings) return;
    setForm({
      enabled: String(settings.enabled),
      required: String(settings.required),
      minimumAmount: String(settings.minimumAmount ?? 0),
      minimumFrequency: settings.minimumFrequency,
      minimumPeriods: String(settings.minimumPeriods ?? 0),
      minimumConfirmedAmount: String(settings.minimumConfirmedAmount ?? 0),
      eligibilityPercentage: String(settings.eligibilityPercentage ?? 0),
      loanMultiplier: String(settings.loanMultiplier ?? 1),
      allowPendingForEligibility: String(settings.allowPendingForEligibility),
      approvalRequired: String(settings.approvalRequired),
      allowedMethods: settings.allowedMethods ?? ["Mpesa"],
      currency: settings.currency ?? "KES",
    });
  }, [settings]);

  const update = (field: keyof SettingsForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleMethod = (method: ContributionMethod) =>
    setForm((prev) => ({
      ...prev,
      allowedMethods: prev.allowedMethods.includes(method)
        ? prev.allowedMethods.filter((item) => item !== method)
        : [...prev.allowedMethods, method],
    }));

  const canSave = useMemo(() => Boolean(token) && !updating, [token, updating]);

  const handleSave = async () => {
    if (!token) return;
    setFeedback("");
    try {
      await updateSettings(token, {
        enabled: form.enabled === "true",
        required: form.required === "true",
        minimumAmount: Number(form.minimumAmount) || 0,
        minimumFrequency: form.minimumFrequency,
        minimumPeriods: Number(form.minimumPeriods) || 0,
        minimumConfirmedAmount: Number(form.minimumConfirmedAmount) || 0,
        eligibilityPercentage: Number(form.eligibilityPercentage) || 0,
        loanMultiplier: Number(form.loanMultiplier) || 1,
        allowPendingForEligibility: form.allowPendingForEligibility === "true",
        approvalRequired: form.approvalRequired === "true",
        allowedMethods: form.allowedMethods,
        currency: form.currency,
      });
      setFeedback("✅ Contribution settings saved.");
    } catch (err) {
      setFeedback(`❌ ${getApiErrorMessage(err)}`);
    }
  };

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

  function renderToggle(
    field:
      | "enabled"
      | "required"
      | "allowPendingForEligibility"
      | "approvalRequired",
    label: string,
  ) {
    return (
      <FormField label={label}>
        <View style={styles.row}>
          {boolOptions.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => update(field, opt.value)}
              style={[
                styles.chip,
                {
                  borderColor: colors.border,
                  backgroundColor:
                    form[field] === opt.value ? colors.primary : "transparent",
                },
              ]}
            >
              <Text
                style={{
                  color:
                    form[field] === opt.value
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
    );
  }

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
            Configure the group's contribution policy and loan eligibility
            rules.
          </Text>
        </VStack>

        {loading && !settings && <AppSkeleton height={200} />}

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

        {feedback && (
          <Text
            className={
              feedback.startsWith("✅") ? "text-success" : "text-error"
            }
          >
            {feedback}
          </Text>
        )}

        <VStack className="gap-4 border border-border rounded-lg p-4">
          {renderToggle("enabled", "Contributions enabled")}
          {renderToggle("required", "Contributions required")}

          <FormField label="Minimum amount">
            <AppInput
              value={form.minimumAmount}
              onChangeText={(v) => update("minimumAmount", v)}
              keyboardType="number-pad"
              placeholder="e.g., 500"
            />
          </FormField>

          <FormField label="Minimum frequency">
            <View style={styles.row}>
              {frequencies.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => update("minimumFrequency", opt.value)}
                  style={[
                    styles.chip,
                    {
                      borderColor: colors.border,
                      backgroundColor:
                        form.minimumFrequency === opt.value
                          ? colors.primary
                          : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color:
                        form.minimumFrequency === opt.value
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

          <FormField label="Minimum periods">
            <AppInput
              value={form.minimumPeriods}
              onChangeText={(v) => update("minimumPeriods", v)}
              keyboardType="number-pad"
              placeholder="e.g., 3"
            />
          </FormField>

          <FormField label="Minimum confirmed amount">
            <AppInput
              value={form.minimumConfirmedAmount}
              onChangeText={(v) => update("minimumConfirmedAmount", v)}
              keyboardType="number-pad"
              placeholder="e.g., 1500"
            />
          </FormField>

          <FormField label="Eligibility percentage">
            <AppInput
              value={form.eligibilityPercentage}
              onChangeText={(v) => update("eligibilityPercentage", v)}
              keyboardType="decimal-pad"
              placeholder="e.g., 80"
            />
          </FormField>

          <FormField label="Loan multiplier">
            <AppInput
              value={form.loanMultiplier}
              onChangeText={(v) => update("loanMultiplier", v)}
              keyboardType="decimal-pad"
              placeholder="e.g., 3"
            />
          </FormField>

          {renderToggle(
            "allowPendingForEligibility",
            "Count pending contributions toward eligibility",
          )}
          {renderToggle(
            "approvalRequired",
            "Require approval for contributions",
          )}

          <FormField label="Allowed payment methods">
            <View style={styles.row}>
              {methods.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => toggleMethod(opt.value)}
                  style={[
                    styles.chip,
                    {
                      borderColor: colors.border,
                      backgroundColor: form.allowedMethods.includes(opt.value)
                        ? colors.primary
                        : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: form.allowedMethods.includes(opt.value)
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

          <FormField label="Currency">
            <AppInput
              value={form.currency}
              onChangeText={(v) => update("currency", v)}
              placeholder="e.g., KES"
            />
          </FormField>

          <AppButton
            title="Save settings"
            onPress={handleSave}
            loading={updating}
            isDisabled={!canSave}
          />
        </VStack>
      </ScrollView>

      <AppDialog
        open={typeDialogOpen}
        title={editingType ? "Edit contribution type" : "Add contribution type"}
        onClose={() => setTypeDialogOpen(false)}
        footer={
          <>
            <AppButton
              title="Cancel"
              variant="outline"
              onPress={() => setTypeDialogOpen(false)}
            />
            <AppButton
              title="Save"
              loading={mutatingType}
              onPress={handleSaveType}
            />
          </>
        }
      >
        <VStack className="gap-3">
          {typeFeedback && (
            <Text style={{ color: colors.error }}>{typeFeedback}</Text>
          )}
          <FormField label="Name" required>
            <AppInput
              value={typeForm.name}
              onChangeText={(v) =>
                setTypeForm((prev) => ({ ...prev, name: v }))
              }
              placeholder="e.g., Monthly Contribution"
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
              placeholder="e.g., 5050"
            />
          </FormField>
          <FormField label="Frequency">
            <View style={styles.row}>
              {frequencies.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() =>
                    setTypeForm((prev) => ({ ...prev, frequency: opt.value }))
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
});
