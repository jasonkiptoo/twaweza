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
import { useLocalSearchParams } from "expo-router";
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

interface ProductForm {
  name: string;
  description: string;
  minAmount: string;
  maxAmount: string;
  interestRate: string;
  repaymentDurationMonths: string;
  currency: string;
  interestType: string;
  repaymentFrequency: string;
  gracePeriodDays: string;
  processingFee: string;
  insuranceFee: string;
  approvalMode: string;
  maxActiveLoans: string;
  // ✅ Eligibility Settings
  requireActiveMember: string;
  minimumMembershipDurationDays: string;
  requirePreviousLoanCleared: string;
  minimumAgeInGroup: string;
}

export default function AdminProductsEditScreen() {
  const { colors } = useTheme();
  const token = useAuthStore((state) => state.token);
  const products = useCreditManagementStore((state) => state.products);
  const loading = useCreditManagementStore((state) => state.productsLoading);
  const error = useCreditManagementStore((state) => state.productsError);
  const creating = useCreditManagementStore((state) => state.creatingProduct);
  const fetch = useCreditManagementStore((state) => state.fetchProducts);
  const createProduct = useCreditManagementStore((state) => state.createProduct);
  const updateProduct = useCreditManagementStore((state) => state.updateProduct);
  const group = useGroupStore((state) => state.group);
  const fetchGroup = useGroupStore((state) => state.fetchGroup);
  const { productId } = useLocalSearchParams<{ productId?: string }>();

  const [showForm, setShowForm] = useState(!!productId);
  const [editingProduct, setEditingProduct] = useState<CreditProduct | null>(null);
  const [form, setForm] = useState<ProductForm>({
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
    requireActiveMember: "true",
    minimumMembershipDurationDays: "0",
    requirePreviousLoanCleared: "false",
    minimumAgeInGroup: "0",
  });

  const [feedback, setFeedback] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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

  useEffect(() => {
    if (productId && products.length) {
      const product = products.find((p) => p.id === productId);
      if (product) {
        loadProductForm(product);
      }
    }
  }, [productId, products]);

  function loadProductForm(product: CreditProduct) {
    setEditingProduct(product);
    setForm({
      name: product.name || "",
      description: product.description || "",
      minAmount: String(product.minAmount || ""),
      maxAmount: String(product.maxAmount || ""),
      interestRate: String(product.interestRate || ""),
      repaymentDurationMonths: String(product.repaymentDurationMonths || ""),
      currency: product.currency || "KES",
      interestType: product.interestType || "fixed",
      repaymentFrequency: product.repaymentFrequency || "monthly",
      gracePeriodDays: String(product.gracePeriodDays || "0"),
      processingFee: String(product.processingFee || "0"),
      insuranceFee: String(product.insuranceFee || "0"),
      approvalMode: product.approvalMode || "single",
      maxActiveLoans: String(product.maxActiveLoans || "1"),
      requireActiveMember: String(
        product.eligibilitySettings?.requireActiveMember ?? "true"
      ),
      minimumMembershipDurationDays: String(
        product.eligibilitySettings?.minimumMembershipDurationDays || "0"
      ),
      requirePreviousLoanCleared: String(
        product.eligibilitySettings?.requirePreviousLoanCleared ?? "false"
      ),
      minimumAgeInGroup: String(
        product.eligibilitySettings?.minimumAgeInGroup || "0"
      ),
    });
    setShowForm(true);
  }

  function update(field: keyof ProductForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
  }

  async function submit() {
    const errors: Record<string, string> = {};

    const minAmount = Number(form.minAmount);
    const maxAmount = Number(form.maxAmount);
    const interestRate = Number(form.interestRate);
    const duration = Number(form.repaymentDurationMonths);

    if (!form.name.trim()) errors.name = "Product name is required";
    if (minAmount < 0) errors.minAmount = "Minimum amount must be positive";
    if (maxAmount <= 0) errors.maxAmount = "Maximum amount must be positive";
    if (maxAmount < minAmount) errors.maxAmount = "Must be greater than minimum";
    if (interestRate < 0) errors.interestRate = "Interest rate must be positive";
    if (duration < 1) errors.repaymentDurationMonths = "Duration must be at least 1";

    if (Object.keys(errors).length) {
      return setFieldErrors(errors);
    }

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

    if (!token || !resolvedGroupId) {
      return setFeedback("Your account is not linked to a group yet.");
    }

    const payload: Partial<CreditProduct> = {
      name: form.name.trim(),
      description: form.description.trim(),
      currency: form.currency.trim() || "KES",
      interestType: form.interestType as CreditProduct["interestType"],
      minAmount,
      maxAmount,
      interestRate,
      repaymentDurationMonths: duration,
      repaymentFrequency: form.repaymentFrequency,
      gracePeriodDays: Number(form.gracePeriodDays) || 0,
      processingFee: Number(form.processingFee) || 0,
      insuranceFee: Number(form.insuranceFee) || 0,
      approvalMode: form.approvalMode as CreditProduct["approvalMode"],
      maxActiveLoans: Number(form.maxActiveLoans) || 1,
      // ✅ Eligibility Settings
      eligibilitySettings: {
        requireActiveMember: form.requireActiveMember === "true",
        minimumMembershipDurationDays:
          Number(form.minimumMembershipDurationDays) || 0,
        requirePreviousLoanCleared:
          form.requirePreviousLoanCleared === "true",
        minimumAgeInGroup: Number(form.minimumAgeInGroup) || 0,
        maxActiveLoans: Number(form.maxActiveLoans) || 1,
      },
    };

    if (!editingProduct) {
      payload.group = resolvedGroupId;
      payload.active = true;
    }

    try {
      if (editingProduct) {
        await updateProduct(token, editingProduct.id, payload);
        setFeedback("✅ Product updated successfully");
        await fetch(token, { page: 1 });
      } else {
        await createProduct(token, payload as Omit<CreditProduct, "id">);
        setFeedback("✅ Product created successfully");
      }
      setShowForm(false);
      setEditingProduct(null);
      setForm({
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
        requireActiveMember: "true",
        minimumMembershipDurationDays: "0",
        requirePreviousLoanCleared: "false",
        minimumAgeInGroup: "0",
      });
      setTimeout(() => setFeedback(""), 3000);
    } catch (err) {
      setFeedback(`❌ Error: ${getApiErrorMessage(err)}`);
    }
  }

  function renderSelect(
    field: keyof ProductForm,
    label: string,
    options: Array<{ label: string; value: string }>,
  ) {
    return (
      <FormField label={label} error={fieldErrors[field]}>
        <View className="flex-row gap-2 flex-wrap">
          {options.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => update(field, opt.value)}
              style={[
                { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
                form[field] === opt.value
                  ? { backgroundColor: colors.primary }
                  : { backgroundColor: colors.muted, borderWidth: 1, borderColor: colors.border },
              ]}
            >
              <Text
                style={{
                  color:
                    form[field] === opt.value
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
    );
  }

  return (
    <Screen>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 16, paddingBottom: 80 }}
        >
          <VStack className="gap-2">
            <Heading size="3xl">Loan products</Heading>
            <Text className="text-muted-foreground">
              Create and manage credit products for your group.
            </Text>
          </VStack>

          {feedback && (
            <Text
              className={feedback.startsWith("✅") ? "text-success" : "text-error"}
            >
              {feedback}
            </Text>
          )}

          {showForm && (
            <VStack className="gap-4 border border-border rounded-lg p-4">
              <Text className="font-semibold text-lg">
                {editingProduct ? "Edit product" : "Create new product"}
              </Text>

              {/* Basic Info */}
              <FormField label="Product name" error={fieldErrors.name} required>
                <AppInput
                  value={form.name}
                  onChangeText={(v) => update("name", v)}
                  placeholder="e.g., Emergency Loan"
                />
              </FormField>

              <FormField label="Description">
                <AppInput
                  value={form.description}
                  onChangeText={(v) => update("description", v)}
                  placeholder="What is this product for?"
                  multiline
                />
              </FormField>

              {/* Loan Amounts */}
              <FormField label="Minimum amount (KES)" error={fieldErrors.minAmount} required>
                <AppInput
                  value={form.minAmount}
                  onChangeText={(v) => update("minAmount", v)}
                  keyboardType="number-pad"
                  placeholder="e.g., 1000"
                />
              </FormField>

              <FormField label="Maximum amount (KES)" error={fieldErrors.maxAmount} required>
                <AppInput
                  value={form.maxAmount}
                  onChangeText={(v) => update("maxAmount", v)}
                  keyboardType="number-pad"
                  placeholder="e.g., 50000"
                />
              </FormField>

              {/* Interest & Repayment */}
              <FormField label="Interest rate (%)" error={fieldErrors.interestRate} required>
                <AppInput
                  value={form.interestRate}
                  onChangeText={(v) => update("interestRate", v)}
                  keyboardType="decimal-pad"
                  placeholder="e.g., 5.5"
                />
              </FormField>

              {renderSelect("interestType", "Interest type", interestTypes)}
              {renderSelect("repaymentFrequency", "Repayment frequency", repaymentFrequencies)}

              <FormField label="Repayment duration (months)" error={fieldErrors.repaymentDurationMonths} required>
                <AppInput
                  value={form.repaymentDurationMonths}
                  onChangeText={(v) => update("repaymentDurationMonths", v)}
                  keyboardType="number-pad"
                  placeholder="e.g., 12"
                />
              </FormField>

              {/* Fees & Grace */}
              <FormField label="Grace period (days)">
                <AppInput
                  value={form.gracePeriodDays}
                  onChangeText={(v) => update("gracePeriodDays", v)}
                  keyboardType="number-pad"
                  placeholder="e.g., 0"
                />
              </FormField>

              <FormField label="Processing fee (KES)">
                <AppInput
                  value={form.processingFee}
                  onChangeText={(v) => update("processingFee", v)}
                  keyboardType="number-pad"
                  placeholder="e.g., 500"
                />
              </FormField>

              <FormField label="Insurance fee (KES)">
                <AppInput
                  value={form.insuranceFee}
                  onChangeText={(v) => update("insuranceFee", v)}
                  keyboardType="number-pad"
                  placeholder="e.g., 0"
                />
              </FormField>

              {/* Admin Settings */}
              <Text className="font-semibold text-base mt-4">Admin settings</Text>

              {renderSelect("approvalMode", "Approval mode", approvalModes)}

              <FormField label="✅ Max active loans per member">
                <AppInput
                  value={form.maxActiveLoans}
                  onChangeText={(v) => update("maxActiveLoans", v)}
                  keyboardType="number-pad"
                  placeholder="e.g., 1"
                />
              </FormField>

              {/* Eligibility Settings */}
              <Text className="font-semibold text-base mt-4">Eligibility rules</Text>

              <FormField label="✅ Require active member status">
                <VStack className="gap-2">
                  {["true", "false"].map((val) => (
                    <Pressable
                      key={val}
                      onPress={() => update("requireActiveMember", val)}
                      style={[
                        {
                          paddingVertical: 10,
                          paddingHorizontal: 12,
                          borderRadius: 6,
                          borderWidth: 1,
                        },
                        form.requireActiveMember === val
                          ? {
                              backgroundColor: colors.primary,
                              borderColor: colors.primary,
                            }
                          : {
                              backgroundColor: colors.muted,
                              borderColor: colors.border,
                            },
                      ]}
                    >
                      <Text
                        style={{
                          color:
                            form.requireActiveMember === val
                              ? colors.onPrimary
                              : colors.foreground,
                        }}
                      >
                        {val === "true" ? "Yes - Required" : "No - Optional"}
                      </Text>
                    </Pressable>
                  ))}
                </VStack>
              </FormField>

              <FormField label="✅ Minimum membership duration (days)">
                <AppInput
                  value={form.minimumMembershipDurationDays}
                  onChangeText={(v) => update("minimumMembershipDurationDays", v)}
                  keyboardType="number-pad"
                  placeholder="e.g., 30"
                />
              </FormField>

              <FormField label="✅ Require previous loan to be cleared">
                <VStack className="gap-2">
                  {["false", "true"].map((val) => (
                    <Pressable
                      key={val}
                      onPress={() => update("requirePreviousLoanCleared", val)}
                      style={[
                        {
                          paddingVertical: 10,
                          paddingHorizontal: 12,
                          borderRadius: 6,
                          borderWidth: 1,
                        },
                        form.requirePreviousLoanCleared === val
                          ? {
                              backgroundColor: colors.primary,
                              borderColor: colors.primary,
                            }
                          : {
                              backgroundColor: colors.muted,
                              borderColor: colors.border,
                            },
                      ]}
                    >
                      <Text
                        style={{
                          color:
                            form.requirePreviousLoanCleared === val
                              ? colors.onPrimary
                              : colors.foreground,
                        }}
                      >
                        {val === "true" ? "Yes - Required" : "No - Not required"}
                      </Text>
                    </Pressable>
                  ))}
                </VStack>
              </FormField>

              <FormField label="✅ Minimum age in group (days)">
                <AppInput
                  value={form.minimumAgeInGroup}
                  onChangeText={(v) => update("minimumAgeInGroup", v)}
                  keyboardType="number-pad"
                  placeholder="e.g., 0"
                />
              </FormField>

              {/* Actions */}
              <VStack className="gap-2 pt-4 flex-row">
                <AppButton
                  title={editingProduct ? "Save changes" : "Create product"}
                  loading={creating}
                  onPress={submit}
                  className="flex-1"
                />
                <AppButton
                  title="Cancel"
                  variant="outline"
                  onPress={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                  }}
                  className="flex-1"
                />
              </VStack>
            </VStack>
          )}

          {loading && !products.length && <AppSkeleton height={150} />}
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
            <Pressable
              key={product.id}
              onPress={() => loadProductForm(product)}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 12,
                },
              ]}
            >
              <VStack className="gap-2">
                <Text className="font-semibold">{product.name}</Text>
                <Text className="text-muted-foreground text-sm">
                  {product.description || "No description"}
                </Text>
                <View className="flex-row justify-between">
                  <Text className="text-sm">
                    {product.currency || "KES"} {product.minAmount} - {product.maxAmount}
                  </Text>
                  <Text className="text-sm">
                    {product.interestRate}% {product.interestType}
                  </Text>
                </View>
                <Text className="text-xs text-muted-foreground">
                  📋 Max active loans: {product.maxActiveLoans || 1}
                </Text>
              </VStack>
            </Pressable>
          ))}
        </ScrollView>

        {!showForm && (
          <Pressable
            onPress={() => {
              setShowForm(true);
              setEditingProduct(null);
              setForm({
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
                requireActiveMember: "true",
                minimumMembershipDurationDays: "0",
                requirePreviousLoanCleared: "false",
                minimumAgeInGroup: "0",
              });
            }}
            style={[styles.fab, { backgroundColor: colors.primary }]}
            accessibilityRole="button"
            accessibilityLabel="Add loan product"
          >
            <Plus size={26} color={colors.onPrimary} />
          </Pressable>
        )}
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
