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
import type { BankAccount } from "@/services/groupApi";
import { useAuthStore } from "@/store/authStore";
import { useGroupStore } from "@/store/groupStore";
import { getApiErrorMessage } from "@/utils/apiError";
import { Trash2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

export default function AdminBankInformationScreen() {
  const { colors } = useTheme();
  const token = useAuthStore((state) => state.token);
  const banks = useGroupStore((state) => state.banks);
  const banksLoading = useGroupStore((state) => state.banksLoading);
  const banksUpdating = useGroupStore((state) => state.banksUpdating);
  const banksError = useGroupStore((state) => state.banksError);
  const fetchBanks = useGroupStore((state) => state.fetchBanks);
  const saveBanks = useGroupStore((state) => state.saveBanks);

  const [draft, setDraft] = useState<BankAccount[]>([]);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (token) void fetchBanks(token);
  }, [fetchBanks, token]);

  useEffect(() => {
    setDraft(banks);
  }, [banks]);

  const updateBank = (index: number, patch: Partial<BankAccount>) =>
    setDraft((prev) =>
      prev.map((bank, i) => (i === index ? { ...bank, ...patch } : bank)),
    );

  const removeBank = (index: number) =>
    setDraft((prev) => prev.filter((_, i) => i !== index));

  const addBank = () =>
    setDraft((prev) => [
      ...prev,
      {
        name: "",
        paybill: "",
        accountNumber: "",
        isPrimary: prev.length === 0,
      },
    ]);

  const handleSave = async () => {
    if (!token) return;
    setFeedback("");
    try {
      await saveBanks(token, draft);
      setFeedback("✅ Bank information saved.");
    } catch (err) {
      setFeedback(`❌ ${getApiErrorMessage(err)}`);
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
          <Heading size="3xl">Bank information</Heading>
          <Text className="text-muted-foreground">
            Manage the bank accounts members can use to send contributions.
          </Text>
        </VStack>

        {banksLoading && !draft.length && <AppSkeleton height={150} />}

        {banksError && (
          <AppErrorState
            message={banksError}
            onRetry={() => (token ? fetchBanks(token) : undefined)}
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

        {!banksLoading && !draft.length && (
          <AppEmptyState
            title="No bank accounts yet"
            message="Add a bank account so members know where to send contributions."
          />
        )}

        {draft.map((bank, index) => (
          <AppCard key={index}>
            <VStack className="gap-3">
              <VStack className="flex-row items-center justify-between">
                <Text className="font-semibold">Account {index + 1}</Text>
                <Pressable onPress={() => removeBank(index)} hitSlop={10}>
                  <Trash2 size={18} color={colors.error} />
                </Pressable>
              </VStack>
              <FormField label="Bank name" required>
                <AppInput
                  value={bank.name ?? ""}
                  onChangeText={(v) => updateBank(index, { name: v })}
                  placeholder="e.g., Equity Bank"
                />
              </FormField>
              <FormField label="Paybill" required>
                <AppInput
                  value={bank.paybill ?? ""}
                  onChangeText={(v) => updateBank(index, { paybill: v })}
                  keyboardType="number-pad"
                  placeholder="e.g., 247247"
                />
              </FormField>
              <FormField label="Account number" required>
                <AppInput
                  value={bank.accountNumber ?? ""}
                  onChangeText={(v) => updateBank(index, { accountNumber: v })}
                  placeholder="e.g., 0123456789"
                />
              </FormField>
              <FormField label="Primary account">
                <View style={styles.row}>
                  {[true, false].map((value) => (
                    <Pressable
                      key={String(value)}
                      onPress={() => updateBank(index, { isPrimary: value })}
                      style={[
                        styles.chip,
                        {
                          borderColor: colors.border,
                          backgroundColor:
                            Boolean(bank.isPrimary) === value
                              ? colors.primary
                              : "transparent",
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color:
                            Boolean(bank.isPrimary) === value
                              ? colors.onPrimary
                              : colors.textPrimary,
                        }}
                      >
                        {value ? "Yes" : "No"}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </FormField>
            </VStack>
          </AppCard>
        ))}

        <AppButton
          title="+ Add bank account"
          variant="outline"
          onPress={addBank}
        />
        <AppButton
          title="Save bank information"
          onPress={handleSave}
          loading={banksUpdating}
          isDisabled={!token || banksUpdating}
        />
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
