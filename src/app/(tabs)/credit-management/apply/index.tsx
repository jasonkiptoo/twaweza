import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { FormField } from "@/components/ui/FormField";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/authStore";
import { useLoanProducts } from "@/hooks/useLoanProducts";
import { createCreditApplication } from "@/services/creditManagementApi";
import { getApiErrorMessage } from "@/utils/apiError";

export default function ApplyScreen() {
  const { colors } = useTheme();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const { productId } = useLocalSearchParams<{ productId?: string }>();
  const { products, loading: productsLoading } = useLoanProducts(true);
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const product = products.find((item) => item.id === productId);
  const groupId =
    typeof user?.group === "string" ? user.group : user?.group?.id;

  async function submit() {
    const requestedAmount = Number(amount);
    if (!groupId || !product)
      return setError("Your group or selected product is unavailable.");
    if (!requestedAmount || requestedAmount <= 0 || !purpose.trim())
      return setError("Enter the amount and purpose.");
    if (product.minAmount !== undefined && requestedAmount < product.minAmount)
      return setError(`The minimum amount is ${product.minAmount}.`);
    if (product.maxAmount !== undefined && requestedAmount > product.maxAmount)
      return setError(`The maximum amount is ${product.maxAmount}.`);
    if (!token) return setError("Your session has expired.");
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const result = await createCreditApplication(token, {
        group: groupId,
        product: product.id,
        requestedAmount,
        purpose: purpose.trim(),
        comments: comments.trim(),
      });
      if (!result.eligible)
        setMessage(
          `You are not eligible: ${(result.reasons ?? []).join(", ") || "review the product terms."}`,
        );
      else {
        setMessage("Application submitted successfully.");
        setTimeout(
          () => router.replace("/(tabs)/credit-management/applications"),
          700,
        );
      }
    } catch (cause) {
      setError(getApiErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <VStack className="gap-5">
        <Heading size="3xl">Apply for a loan</Heading>
        <Text className="text-muted-foreground">
          Review the selected product, then submit your application.
        </Text>
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
                setAmount(value.replace(/\D/g, ""));
                setError("");
              }}
              keyboardType="number-pad"
              placeholder="KES amount"
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
        {error && <Text style={{ color: colors.error }}>{error}</Text>}
        {message && <Text style={{ color: colors.success }}>{message}</Text>}
        <AppButton
          title="Submit application"
          loading={loading}
          onPress={submit}
        />
      </VStack>
    </Screen>
  );
}
