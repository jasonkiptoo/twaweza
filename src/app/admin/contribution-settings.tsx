import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppSkeleton } from "@/components/ui/AppSkeleton";
import { AppErrorState } from "@/components/ui/AppStates";
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
} from "@/types/creditManagement";
import { getApiErrorMessage } from "@/utils/apiError";

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

export default function AdminContributionSettingsScreen() {
  const { colors } = useTheme();
  const token = useAuthStore((state) => state.token);
  const settings = useContributionSettingsStore((state) => state.settings);
  const loading = useContributionSettingsStore((state) => state.loading);
  const updating = useContributionSettingsStore((state) => state.updating);
  const error = useContributionSettingsStore((state) => state.error);
  const fetchSettings = useContributionSettingsStore((state) => state.fetch);
  const updateSettings = useContributionSettingsStore((state) => state.update);

  const [form, setForm] = useState<SettingsForm>(defaultForm);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (token) void fetchSettings(token);
  }, [fetchSettings, token]);

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

  function renderToggle(field: "enabled" | "required" | "allowPendingForEligibility" | "approvalRequired", label: string) {
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
                    form[field] === opt.value ? colors.onPrimary : colors.foreground,
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
            Configure the group's contribution policy and loan eligibility rules.
          </Text>
        </VStack>

        {loading && !settings && <AppSkeleton height={200} />}

        {error && (
          <AppErrorState
            message={error}
            onRetry={() => (token ? fetchSettings(token) : undefined)}
          />
        )}

        {feedback && (
          <Text className={feedback.startsWith("✅") ? "text-success" : "text-error"}>
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
                          : colors.foreground,
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

          {renderToggle("allowPendingForEligibility", "Count pending contributions toward eligibility")}
          {renderToggle("approvalRequired", "Require approval for contributions")}

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
                        : colors.foreground,
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
