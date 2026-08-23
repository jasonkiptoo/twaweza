import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppEmptyState, AppErrorState } from "@/components/ui/AppStates";
import { AppSkeleton } from "@/components/ui/AppSkeleton";
import { FormField } from "@/components/ui/FormField";
import { Heading } from "@/components/ui/heading";
import { LoanProductCard } from "@/components/credit-management/LoanProductCard";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useAuthStore } from "@/store/authStore";
import { useCreditManagementStore } from "@/store/creditManagementStore";
import type { CreditProduct } from "@/types/creditManagement";

export default function AdminProducts() {
  const token = useAuthStore((state) => state.token);
  const products = useCreditManagementStore((state) => state.products);
  const loading = useCreditManagementStore((state) => state.productsLoading);
  const error = useCreditManagementStore((state) => state.productsError);
  const creating = useCreditManagementStore((state) => state.creatingProduct);
  const fetch = useCreditManagementStore((state) => state.fetchProducts);
  const createProduct = useCreditManagementStore(
    (state) => state.createProduct,
  );
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    group: "",
    minAmount: "",
    maxAmount: "",
    interestRate: "",
    repaymentDurationMonths: "",
    currency: "KES",
    interestType: "",
    repaymentFrequency: "",
    gracePeriodDays: "0",
    processingFee: "0",
    insuranceFee: "0",
    approvalMode: "",
    maxActiveLoans: "1",
  });
  const [feedback, setFeedback] = useState("");
  const adminGroup = useAuthStore((state) => state.user?.group);
  useEffect(() => {
    const groupId = typeof adminGroup === "string" ? adminGroup : adminGroup?.id;
    if (groupId) setForm((current) => ({ ...current, group: current.group || groupId }));
    if (token) void fetch(token, { page: 1 });
  }, [adminGroup, fetch, token]);
  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }
  async function submit() {
    const minAmount = Number(form.minAmount);
    const maxAmount = Number(form.maxAmount);
    const interestRate = Number(form.interestRate);
    const duration = Number(form.repaymentDurationMonths);
    if (!token || !form.name.trim() || !form.group.trim() || !form.interestType.trim() || !form.repaymentFrequency.trim() || !form.approvalMode.trim())
      return setFeedback("Name, group, interest type, repayment frequency, and approval mode are required.");
    if (!minAmount || minAmount < 0 || !maxAmount || maxAmount < minAmount || !interestRate || interestRate < 0 || !duration || duration < 1)
      return setFeedback("Enter valid minimum and maximum amounts, interest rate, and duration.");
    const payload: Omit<CreditProduct, "id"> = {
      ...form,
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
      setFeedback(
        cause instanceof Error ? cause.message : "Unable to create product.",
      );
    }
  }
  return (
    <Screen>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingBottom: 96 }}>
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
              {(
                ["name", "description", "group", "minAmount", "maxAmount", "interestRate", "repaymentDurationMonths", "interestType", "repaymentFrequency", "approvalMode"] as const
              ).map((field) => (
                <FormField key={field} label={field.replace(/([A-Z])/g, " $1")} required={["name", "group", "minAmount", "maxAmount", "interestRate", "repaymentDurationMonths", "interestType", "repaymentFrequency", "approvalMode"].includes(field)}>
                  <AppInput
                    value={form[field]}
                    onChangeText={(value) => update(field, value)}
                    keyboardType={
                      [
                        "minAmount",
                        "maxAmount",
                        "interestRate",
                        "repaymentDurationMonths",
                      ].includes(field)
                        ? "number-pad"
                        : "default"
                    }
                  />
                </FormField>
              ))}
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
        <AppButton
          title={showForm ? "Close" : "New product"}
          onPress={() => setShowForm((value) => !value)}
          style={styles.fab}
          accessibilityLabel={
            showForm ? "Close product form" : "Add loan product"
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fab: { position: "absolute", right: 16, bottom: 16, borderRadius: 24 },
});
