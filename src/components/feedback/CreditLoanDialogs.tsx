import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { FormField } from "@/components/ui/FormField";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useLoanProducts } from "@/hooks/useLoanProducts";
import { useTheme } from "@/hooks/useTheme";
import {
    createCreditApplication,
    recordCreditPayment,
} from "@/services/creditManagementApi";
import { useAuthStore } from "@/store/authStore";
import { useGroupStore } from "@/store/groupStore";
import type {
    CreditLoan,
    PaymentMethod
} from "@/types/creditManagement";
import { getApiErrorMessage } from "@/utils/apiError";
import { useEffect, useState } from "react";
import { AppDialog } from "./AppDialog";

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

export function CreditLoanRequestDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const { colors } = useTheme();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const group = useGroupStore((state) => state.group);
  const fetchGroup = useGroupStore((state) => state.fetchGroup);
  const { products, loading: productsLoading } = useLoanProducts(true);
  const [productId, setProductId] = useState("");
  const [amount, setAmount] = useState("");
  const [term, setTerm] = useState("");
  const [purpose, setPurpose] = useState("");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const userGroup = user?.group;
  const groupId =
    group?.id ??
    group?._id ??
    (typeof userGroup === "string"
      ? userGroup
      : (userGroup?.id ?? userGroup?._id));
  const product = products.find((item) => item.id === productId);
  const repaymentUnit =
    product?.repaymentFrequency?.toLowerCase() === "weekly" ? "weeks" : "months";
  const maximumTerm = product?.repaymentDurationMonths ?? 0;

  useEffect(() => {
    if (!open) {
      setProductId("");
      setAmount("");
      setTerm("");
      setPurpose("");
      setComments("");
      setFeedback("");
    }
  }, [open]);

  async function submit() {
    const requestedAmount = Number(amount.replace(/,/g, ""));
    const repaymentDurationMonths = Number(term);
    if (!token) return setFeedback("Your session has expired.");
    if (!product) return setFeedback("Select a loan product.");
    if (!requestedAmount || requestedAmount <= 0 || !purpose.trim())
      return setFeedback("Enter the amount and purpose.");
    if (product.minAmount !== undefined && requestedAmount < product.minAmount)
      return setFeedback(`The minimum amount is ${product.minAmount}.`);
    if (product.maxAmount !== undefined && requestedAmount > product.maxAmount)
      return setFeedback(`The maximum amount is ${product.maxAmount}.`);
    if (
      !repaymentDurationMonths ||
      repaymentDurationMonths < 1 ||
      repaymentDurationMonths > maximumTerm
    )
      return setFeedback(`Choose a repayment term from 1 to ${maximumTerm} ${repaymentUnit}.`);
    let resolvedGroupId = groupId;
    if (!resolvedGroupId) {
      await fetchGroup(token);
      const latestGroup = useGroupStore.getState().group;
      resolvedGroupId = latestGroup?.id ?? latestGroup?._id;
    }
    if (!resolvedGroupId)
      return setFeedback("Your account is not linked to a group yet.");
    setLoading(true);
    setFeedback("");
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
        setFeedback(
          `Loan application cannot be submitted: ${(result.reasons ?? []).join(", ") || "review the product terms."}`,
        );
      } else {
        setFeedback("Loan request submitted successfully.");
        onSuccess?.();
        setTimeout(onClose, 700);
      }
    } catch (cause) {
      setFeedback(getApiErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppDialog
      open={open}
      title="Request a loan"
      onClose={onClose}
      footer={
        <>
          <AppButton title="Cancel" variant="outline" onPress={onClose} />
          <AppButton
            title="Submit request"
            loading={loading}
            onPress={submit}
          />
        </>
      }
    >
      <VStack className="gap-4">
        <FormField label="Loan product" required>
          <VStack className="flex-row flex-wrap gap-2">
            {products.map((item) => (
              <AppButton
                key={item.id}
                title={item.name}
                variant={productId === item.id ? "default" : "outline"}
                onPress={() => setProductId(item.id)}
              />
            ))}
          </VStack>
          {productsLoading && (
            <Text className="text-muted-foreground">Loading products...</Text>
          )}
          {!productsLoading && !products.length && (
            <Text className="text-muted-foreground">
              No active loan products are available.
            </Text>
          )}
        </FormField>
        <FormField label="Requested amount" required>
          <AppInput
            value={amount}
            onChangeText={(value) => {
              setAmount(formatAmountInput(value));
            }}
            keyboardType="decimal-pad"
            placeholder="KES amount"
          />
        </FormField>
        <FormField label={`Repayment term in ${repaymentUnit} (maximum ${maximumTerm})`} required>
          <AppInput
            value={term}
            onChangeText={(value) => {
              const digits = value.replace(/\D/g, "");
              setTerm(
                maximumTerm && Number(digits) > maximumTerm
                  ? String(maximumTerm)
                  : digits,
              );
            }}
            keyboardType="number-pad"
            placeholder={`1-${maximumTerm} ${repaymentUnit}`}
          />
        </FormField>
        <FormField label="Purpose" required>
          <AppInput
            value={purpose}
            onChangeText={setPurpose}
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
        {feedback && (
          <Text
            style={{
              color: feedback.includes("successfully")
                ? colors.success
                : colors.error,
            }}
          >
            {feedback}
          </Text>
        )}
      </VStack>
    </AppDialog>
  );
}

export function CreditRepaymentDialog({
  open,
  loan,
  onClose,
  onSuccess,
}: {
  open: boolean;
  loan?: CreditLoan;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const { colors } = useTheme();
  const token = useAuthStore((state) => state.token);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("Mpesa");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const outstanding = loan?.amountRemaining ?? loan?.balance;

  useEffect(() => {
    if (!open) {
      setAmount("");
      setReference("");
      setFeedback("");
    }
  }, [open]);

  async function submit() {
    const value = Number(amount);
    if (!token || !loan?.id) return setFeedback("Select an active loan first.");
    if (!value || value <= 0) return setFeedback("Enter a repayment amount.");
    if (outstanding !== undefined && value > outstanding)
      return setFeedback("Repayment cannot exceed the outstanding balance.");
    if (method !== "Cash" && !reference.trim())
      return setFeedback("Enter a payment reference.");
    setLoading(true);
    setFeedback("");
    try {
      await recordCreditPayment(token, loan.id, {
        amount: value,
        paymentMethod: method,
        reference: reference.trim() || undefined,
      });
      setFeedback("Repayment recorded successfully.");
      onSuccess?.();
      setTimeout(onClose, 700);
    } catch (cause) {
      setFeedback(getApiErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppDialog
      open={open}
      title="Repay loan"
      onClose={onClose}
      footer={
        <>
          <AppButton title="Cancel" variant="outline" onPress={onClose} />
          <AppButton
            title="Record repayment"
            loading={loading}
            onPress={submit}
          />
        </>
      }
    >
      <VStack className="gap-4">
        <Text className="text-muted-foreground">
          Outstanding: {outstanding ?? "Not available"}
        </Text>
        <FormField label="Amount" required>
          <AppInput
            value={amount}
            onChangeText={(value) => setAmount(value.replace(/\D/g, ""))}
            keyboardType="number-pad"
            placeholder="KES amount"
          />
        </FormField>
        <FormField label="Payment method" required>
          <VStack className="flex-row flex-wrap gap-2">
            {(
              ["Mpesa", "Cash", "Bank", "Manual", "Wallet"] as PaymentMethod[]
            ).map((item) => (
              <AppButton
                key={item}
                title={item}
                variant={method === item ? "default" : "outline"}
                onPress={() => setMethod(item)}
              />
            ))}
          </VStack>
        </FormField>
        <FormField label="Reference">
          <AppInput
            value={reference}
            onChangeText={setReference}
            placeholder="Payment reference"
          />
        </FormField>
        {feedback && (
          <Text
            style={{
              color: feedback.includes("successfully")
                ? colors.success
                : colors.error,
            }}
          >
            {feedback}
          </Text>
        )}
      </VStack>
    </AppDialog>
  );
}
