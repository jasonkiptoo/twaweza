import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Screen } from "@/components/layout/Screen";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { FormField } from "@/components/ui/FormField";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useAuthStore } from "@/store/authStore";
import { recordCreditPayment } from "@/services/creditManagementApi";
import { getApiErrorMessage } from "@/utils/apiError";
import type { PaymentMethod } from "@/types/creditManagement";
import { useLoanDetails } from "@/hooks/useLoanDetails";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { formatKes } from "@/utils/currency";

const methods: PaymentMethod[] = ["Cash", "Bank", "Manual", "Mpesa", "Wallet"];
export default function PaymentScreen() {
  const { loanId } = useLocalSearchParams<{ loanId: string }>();
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const { loan, refresh: refreshLoan } = useLoanDetails(loanId);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("Mpesa");
  const [reference, setReference] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function submit() {
    const value = Number(amount);
    if (!token || !loanId)
      return setError("Your session or loan is unavailable.");
    if (!value || value <= 0)
      return setError("Enter a payment amount greater than zero.");
    const outstanding = loan?.amountRemaining ?? loan?.balance;
    if (outstanding !== undefined && value > outstanding)
      return setError("Payment cannot exceed the outstanding balance.");
    if (!reference.trim() && method !== "Cash")
      return setError("Enter a payment reference.");
    setLoading(true);
    setError("");
    try {
      const paymentKey =
        idempotencyKey ||
        `payment-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
      if (!idempotencyKey) setIdempotencyKey(paymentKey);
      await recordCreditPayment(token, loanId, {
        amount: value,
        paymentMethod: method,
        reference: reference.trim(),
        idempotencyKey: paymentKey,
      });
      await refreshLoan();
      setSuccess("Payment recorded successfully.");
      setTimeout(() => router.back(), 700);
    } catch (cause) {
      setError(getApiErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }
  return (
    <Screen>
      <VStack className="gap-5">
        <Heading size="3xl">Record payment</Heading>
        <Text className="text-muted-foreground">
          Record a payment against this credit-management loan.
        </Text>
        <AppCard>
          <VStack className="gap-2">
            <Text className="text-muted-foreground">Outstanding balance</Text>
            <CurrencyAmount
              value={loan?.amountRemaining ?? loan?.balance}
              size="lg"
            />
            {amount && loan && (
              <Text className="text-muted-foreground">
                Remaining after payment:{" "}
                {formatKes(
                  Math.max(
                    0,
                    (loan.amountRemaining ?? loan.balance ?? 0) -
                      Number(amount),
                  ),
                )}
              </Text>
            )}
          </VStack>
        </AppCard>
        <VStack className="gap-4">
          <FormField label="Amount" required>
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
          <FormField label="Payment method" required>
            <VStack className="flex-row flex-wrap gap-2">
              {methods.map((item) => (
                <AppButton
                  key={item}
                  title={item}
                  variant={method === item ? "default" : "outline"}
                  onPress={() => setMethod(item)}
                />
              ))}
            </VStack>
          </FormField>
          <FormField
            label="Reference"
            helperText={
              method === "Cash"
                ? "Optional for cash payments."
                : "Required for this payment method."
            }
          >
            <AppInput
              value={reference}
              onChangeText={setReference}
              placeholder="Receipt or transaction reference"
            />
          </FormField>
        </VStack>
        {error && <Text className="text-error">{error}</Text>}
        {success && <Text className="text-success">{success}</Text>}
        <AppButton title="Record payment" loading={loading} onPress={submit} />
      </VStack>
    </Screen>
  );
}
