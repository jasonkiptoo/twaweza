import { LoanProductCard } from "@/components/credit-management/LoanProductCard";
import { Screen } from "@/components/layout/Screen";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppSkeleton } from "@/components/ui/AppSkeleton";
import { AppEmptyState, AppErrorState } from "@/components/ui/AppStates";
import { FormField } from "@/components/ui/FormField";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/authStore";
import { useCreditManagementStore } from "@/store/creditManagementStore";
import { useGroupStore } from "@/store/groupStore";
import type { CreditProduct } from "@/types/creditManagement";
import { getApiErrorMessage } from "@/utils/apiError";
import { Plus, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

const interestTypes = [
  { label: "Fixed", value: "fixed" },
  { label: "Reducing balance", value: "reducing_balance" },
] as const;
const repaymentFrequencies = [
  { label: "Weekly", value: "weekly" },
  { label: "Every two weeks", value: "biweekly" },
  { label: "Monthly", value: "monthly" },
] as const;
const approvalModes = [
  { label: "Single approval", value: "single" },
  { label: "Multi-level approval", value: "multi_level" },
] as const;

export default function AdminProducts() {
  const { colors } = useTheme();
  const token = useAuthStore((state) => state.token);
  const products = useCreditManagementStore((state) => state.products);
  const loading = useCreditManagementStore((state) => state.productsLoading);
  const error = useCreditManagementStore((state) => state.productsError);
  const creating = useCreditManagementStore((state) => state.creatingProduct);
  const fetch = useCreditManagementStore((state) => state.fetchProducts);
  const createProduct = useCreditManagementStore(
    (state) => state.createProduct,
  );
  const group = useGroupStore((state) => state.group);
  const fetchGroup = useGroupStore((state) => state.fetchGroup);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    minAmount: "",
    maxAmount: "",
    interestRate: "",
    repaymentDurationMonths: "",
    currency: "KES",
    interestType: "fixed",
    repaymentFrequency: "monthly",
    gracePeriodDays: "0",
    processingFee: "0",
    insuranceFee: "0",
    approvalMode: "single",
    maxActiveLoans: "1",
  });
  const [feedback, setFeedback] = useState("");
  const adminGroup = useAuthStore((state) => state.user?.group);
  const groupId =
    group?.id ??
    group?._id ??
    (typeof adminGroup === "string"
      ? adminGroup
      : (adminGroup?.id ?? adminGroup?._id));
  useEffect(() => {
    if (token) void fetch(token, { page: 1 });
    if (token && !groupId) void fetchGroup(token);
  }, [fetch, fetchGroup, groupId, token]);
  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }
  async function submit() {
    const minAmount = Number(form.minAmount);
    const maxAmount = Number(form.maxAmount);
    const interestRate = Number(form.interestRate);
    const duration = Number(form.repaymentDurationMonths);
    let resolvedGroupId = groupId;
    if (token && !resolvedGroupId) {
      await fetchGroup(token);
      const latestGroup = useGroupStore.getState().group;
      const latestUserGroup = useAuthStore.getState().user?.group;
      resolvedGroupId =
        latestGroup?.id ??
        latestGroup?._id ??
        (typeof latestUserGroup === "string"
          ? latestUserGroup
          : (latestUserGroup?.id ?? latestUserGroup?._id));
    }
    if (!token || !form.name.trim() || !resolvedGroupId)
      return setFeedback("Your account is not linked to a group yet.");
    if (
      minAmount < 0 ||
      maxAmount <= 0 ||
      maxAmount < minAmount ||
      interestRate < 0 ||
      duration < 1
    )
      return setFeedback(
        "Enter valid minimum and maximum amounts, interest rate, and duration.",
      );
    const payload: Omit<CreditProduct, "id"> = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      group: resolvedGroupId,
      currency: form.currency.trim() || "KES",
      active: true,
      minAmount,
      maxAmount,
      interestRate,
      repaymentDurationMonths: duration,
      gracePeriodDays: Number(form.gracePeriodDays),
      processingFee: Number(form.processingFee),
      insuranceFee: Number(form.insuranceFee),
      maxActiveLoans: Number(form.maxActiveLoans),
    };
    try {
      await createProduct(token, payload);
      setFeedback("Product created successfully.");
      setShowForm(false);
      await fetch(token, { page: 1 });
    } catch (cause) {
      setFeedback(getApiErrorMessage(cause));
    }
  }
  return (
    <Screen>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 16, paddingBottom: 96 }}
        >
          <VStack className="flex-row items-center justify-between">
            <Heading size="3xl">Credit products</Heading>
            {showForm && (
              <AppButton
                title="Close"
                variant="outline"
                onPress={() => setShowForm(false)}
              />
            )}
          </VStack>
          {feedback && (
            <Text className="text-muted-foreground">{feedback}</Text>
          )}
          {showForm && (
            <VStack className="gap-4 rounded-xl border border-border bg-card p-4">
              <FormField label="Product name" required>
                <AppInput
                  value={form.name}
                  onChangeText={(value) => update("name", value)}
                />
              </FormField>
              <FormField label="Description">
                <AppInput
                  value={form.description}
                  onChangeText={(value) => update("description", value)}
                />
              </FormField>
              <FormField label="Minimum amount" required>
                <AppInput
                  value={form.minAmount}
                  onChangeText={(value) => update("minAmount", value)}
                  keyboardType="number-pad"
                />
              </FormField>
              <FormField label="Maximum amount" required>
                <AppInput
                  value={form.maxAmount}
                  onChangeText={(value) => update("maxAmount", value)}
                  keyboardType="number-pad"
                />
              </FormField>
              <FormField label="Interest rate" required>
                <AppInput
                  value={form.interestRate}
                  onChangeText={(value) => update("interestRate", value)}
                  keyboardType="decimal-pad"
                />
              </FormField>
              <FormField label="Interest type" required>
                <VStack className="flex-row flex-wrap gap-2">
                  {interestTypes.map((option) => (
                    <AppButton
                      key={option.value}
                      title={option.label}
                      variant={
                        form.interestType === option.value
                          ? "default"
                          : "outline"
                      }
                      onPress={() => update("interestType", option.value)}
                    />
                  ))}
                </VStack>
              </FormField>
              <FormField label="Repayment frequency" required>
                <VStack className="flex-row flex-wrap gap-2">
                  {repaymentFrequencies.map((option) => (
                    <AppButton
                      key={option.value}
                      title={option.label}
                      variant={
                        form.repaymentFrequency === option.value
                          ? "default"
                          : "outline"
                      }
                      onPress={() => update("repaymentFrequency", option.value)}
                    />
                  ))}
                </VStack>
              </FormField>
              <FormField label="Repayment duration (months)" required>
                <AppInput
                  value={form.repaymentDurationMonths}
                  onChangeText={(value) =>
                    update("repaymentDurationMonths", value)
                  }
                  keyboardType="number-pad"
                />
              </FormField>
              <FormField label="Approval mode" required>
                <VStack className="flex-row flex-wrap gap-2">
                  {approvalModes.map((option) => (
                    <AppButton
                      key={option.value}
                      title={option.label}
                      variant={
                        form.approvalMode === option.value
                          ? "default"
                          : "outline"
                      }
                      onPress={() => update("approvalMode", option.value)}
                    />
                  ))}
                </VStack>
              </FormField>
              <AppButton
                title="Create product"
                loading={creating}
                onPress={submit}
              />
            </VStack>
          )}
          {loading && !products.length && <AppSkeleton height={140} />}
          {error && (
            <AppErrorState
              message={error}
              onRetry={() => (token ? fetch(token, { page: 1 }) : undefined)}
            />
          )}
          {!loading && !error && !products.length && (
            <AppEmptyState
              title="No credit products"
              message="Create the first product for your group."
            />
          )}
          {products.map((product) => (
            <LoanProductCard key={product.id} product={product} />
          ))}
        </ScrollView>
        <Pressable
          onPress={() => setShowForm((value) => !value)}
          style={[styles.fab, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
          accessibilityLabel={
            showForm ? "Close product form" : "Add loan product"
          }
          accessibilityHint="Opens the loan product creation form"
        >
          {showForm ? (
            <X size={24} color={colors.onPrimary} />
          ) : (
            <Plus size={26} color={colors.onPrimary} />
          )}
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});
