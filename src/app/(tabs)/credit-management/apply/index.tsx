import { Screen } from "@/components/layout/Screen";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { FormField } from "@/components/ui/FormField";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useLoanProducts } from "@/hooks/useLoanProducts";
import { useTheme } from "@/hooks/useTheme";
import { createCreditApplication } from "@/services/creditManagementApi";
import { useAuthStore } from "@/store/authStore";
import { useGroupStore } from "@/store/groupStore";
import { getApiErrorMessage, parseApiError } from "@/utils/apiError";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AlertCircle, CheckCircle } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";

function formatAmountInput(value: string) {
  const cleaned = value.replace(/,/g, "").replace(/[^0-9.]/g, "");
  if (!cleaned) return "";
  const [integerPart = "", ...decimalParts] = cleaned.split(".");
  const integer = integerPart.replace(/^0+(?=\d)/, "") || "0";
  const formattedInteger = Number(integer).toLocaleString("en-US");
  return decimalParts.length
    ? `${formattedInteger}.${decimalParts.join("").slice(0, 2)}`
    : formattedInteger;
}

export default function ApplyScreen() {
  const { colors } = useTheme();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const group = useGroupStore((state) => state.group);
  const fetchGroup = useGroupStore((state) => state.fetchGroup);
  const { productId } = useLocalSearchParams<{ productId?: string }>();
  const { products, loading: productsLoading } = useLoanProducts(true);
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [term, setTerm] = useState("");
  const [purpose, setPurpose] = useState("");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [eligibilityReasons, setEligibilityReasons] = useState<string[]>([]);
  const product = products.find((item) => item.id === productId);
  const repaymentUnit =
    product?.repaymentFrequency?.toLowerCase() === "weekly"
      ? "weeks"
      : "months";
  const maximumTerm = product?.repaymentDurationMonths ?? 0;

  useEffect(() => {
    if (product) setTerm(String(product.repaymentDurationMonths ?? ""));
  }, [product]);
  const groupId =
    group?.id ??
    group?._id ??
    (typeof user?.group === "string"
      ? user.group
      : (user?.group?.id ?? user?.group?._id));

  async function submit() {
    const requestedAmount = Number(amount.replace(/,/g, ""));
    const repaymentDurationMonths = Number(term);
    if (!product) return setError("Your selected product is unavailable.");
    if (!requestedAmount || requestedAmount <= 0 || !purpose.trim())
      return setError("Enter the amount and purpose.");
    if (product.minAmount !== undefined && requestedAmount < product.minAmount)
      return setError(`The minimum amount is ${product.minAmount}.`);
    if (product.maxAmount !== undefined && requestedAmount > product.maxAmount)
      return setError(`The maximum amount is ${product.maxAmount}.`);
    if (
      !repaymentDurationMonths ||
      repaymentDurationMonths < 1 ||
      repaymentDurationMonths > maximumTerm
    )
      return setError(
        `Choose a repayment term from 1 to ${maximumTerm} ${repaymentUnit}.`,
      );
    if (!token) return setError("Your session has expired.");
    let resolvedGroupId = groupId;
    if (!resolvedGroupId) {
      await fetchGroup(token);
      resolvedGroupId =
        useGroupStore.getState().group?.id ??
        useGroupStore.getState().group?._id;
    }
    if (!resolvedGroupId)
      return setError("Your account is not linked to a group yet.");
    setLoading(true);
    setError("");
    setMessage("");
    setEligibilityReasons([]);
    try {
      const result = await createCreditApplication(token, {
        group: resolvedGroupId,
        product: product.id,
        requestedAmount,
        repaymentDurationMonths,
        repaymentFrequency: product.repaymentFrequency,
        purpose: purpose.trim(),
        comments: comments.trim(),
      });
      if (!result.eligible) {
        // ✅ Enhanced: Show eligibility errors in structured format
        setEligibilityReasons(result.reasons ?? []);
        setMessage("❌ Cannot submit application - eligibility issues found");
      } else {
        setMessage("✅ Application submitted successfully!");
        setTimeout(
          () => router.replace("/(tabs)/credit-management/applications"),
          1000,
        );
      }
    } catch (cause) {
      const parsedError = parseApiError(cause);
      if (parsedError.reasons?.length) {
        setEligibilityReasons(parsedError.reasons);
        setError(
          "Your application could not be submitted because eligibility requirements were not met.",
        );
      } else {
        setError(getApiErrorMessage(cause));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 20, paddingBottom: 32 }}
      >
        <VStack className="gap-2">
          <Heading size="3xl">Apply for a loan</Heading>
          <Text className="text-muted-foreground">
            Review the selected product, then submit your application.
          </Text>
        </VStack>
        <VStack className="gap-4">
          <FormField label="Selected product" required>
            <Text className="rounded-lg border border-border bg-card p-3">
              {productsLoading
                ? "Loading product..."
                : (product?.name ?? "Product unavailable")}
            </Text>
          </FormField>
          <FormField label="Requested amount" required>
            <AppInput
              value={amount}
              onChangeText={(value) => {
                setAmount(formatAmountInput(value));
                setError("");
              }}
              keyboardType="decimal-pad"
              placeholder="KES amount"
            />
          </FormField>
          <FormField
            label={`Repayment term in ${repaymentUnit} (maximum ${maximumTerm})`}
            required
          >
            <AppInput
              value={term}
              onChangeText={(value) => {
                const digits = value.replace(/\D/g, "");
                setTerm(
                  maximumTerm && Number(digits) > maximumTerm
                    ? String(maximumTerm)
                    : digits,
                );
                setError("");
              }}
              keyboardType="number-pad"
              placeholder={`1-${maximumTerm} ${repaymentUnit}`}
            />
          </FormField>
          <FormField label="Purpose" required>
            <AppInput
              value={purpose}
              onChangeText={(value) => {
                setPurpose(value);
                setError("");
              }}
              placeholder="What will the loan support?"
            />
          </FormField>
          <FormField label="Comments">
            <AppInput
              value={comments}
              onChangeText={setComments}
              placeholder="Additional context"
            />
          </FormField>
        </VStack>

        {product && (
          <View className="bg-muted rounded-lg p-3">
            <VStack className="gap-2">
              <Text className="font-semibold">Product details</Text>
              <Text className="text-sm">
                Amount: {product.currency || "KES"} {product.minAmount} -{" "}
                {product.maxAmount}
              </Text>
              <Text className="text-sm">
                Interest: {product.interestRate}% ({product.interestType})
              </Text>
              <Text className="text-sm">
                Repayment: {product.repaymentFrequency} for{" "}
                {product.repaymentDurationMonths} months
              </Text>
              {product.maxActiveLoans && (
                <Text className="text-sm text-yellow-600">
                  📋 Note: Max {product.maxActiveLoans} active loan(s) per
                  member
                </Text>
              )}
            </VStack>
          </View>
        )}

        {/* ✅ Enhanced error display */}
        {error && (
          <View className="bg-red-50 border border-red-200 rounded-lg p-3 flex-row gap-3">
            <AlertCircle color={colors.error} size={20} />
            <Text style={{ color: colors.error }} className="flex-1">
              {error}
            </Text>
          </View>
        )}

        {/* ✅ Eligibility issues display */}
        {eligibilityReasons.length > 0 && (
          <VStack className="gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
            <View className="flex-row gap-2 items-center">
              <AlertCircle color={colors.error} size={20} />
              <Text className="font-semibold" style={{ color: colors.error }}>
                Why this application cannot proceed
              </Text>
            </View>
            {eligibilityReasons.map((reason, idx) => (
              <Text
                key={idx}
                className="text-sm"
                style={{ color: colors.error }}
              >
                • {reason}
              </Text>
            ))}
            <Text className="text-xs text-muted-foreground mt-2">
              Please contact your group admin if you have questions about these
              requirements.
            </Text>
          </VStack>
        )}

        {/* ✅ Success message */}
        {message && !eligibilityReasons.length && (
          <View className="bg-green-50 border border-green-200 rounded-lg p-3 flex-row gap-3">
            <CheckCircle color={colors.success} size={20} />
            <Text style={{ color: colors.success }} className="flex-1">
              {message}
            </Text>
          </View>
        )}
        <AppButton
          title="Submit application"
          loading={loading}
          onPress={submit}
        />
      </ScrollView>
    </Screen>
  );
}
