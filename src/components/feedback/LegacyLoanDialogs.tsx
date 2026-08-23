import { useEffect, useState } from "react";
import { AppButton } from "@/components/ui/AppButton";
import { AppDialog } from "./AppDialog";
import { AppInput } from "@/components/ui/AppInput";
import { FormField } from "@/components/ui/FormField";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/authStore";
import { useLoanStore } from "@/store/loanStore";
import { formatKes } from "@/utils/currency";
import type { CreditLoan } from "@/types/creditManagement";
import { useContributionStore } from "@/store/contributionStore";

export function DepositDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const token = useAuthStore((state) => state.token);
  const add = useContributionStore((state) => state.add);
  const loading = useContributionStore((state) => state.mutating);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"Mpesa" | "Bank" | "cash">("Mpesa");
  const [reference, setReference] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  useEffect(() => {
    if (!open) {
      setAmount("");
      setReference("");
      setPhone("");
      setError("");
      setSuccess("");
    }
  }, [open]);
  async function submit() {
    const value = Number(amount);
    if (!token || !value || value <= 0)
      return setError("Enter a contribution amount greater than zero.");
    if (method === "Mpesa" && !phone.trim())
      return setError("Enter a phone number for M-Pesa.");
    setError("");
    try {
      await add(token, {
        amount: value,
        method,
        reference: reference.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      setSuccess("Contribution submitted successfully.");
      setTimeout(onClose, 700);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to submit contribution.",
      );
    }
  }
  return (
    <AppDialog
      open={open}
      title="Deposit contribution"
      onClose={onClose}
      footer={
        <>
          <AppButton title="Cancel" variant="outline" onPress={onClose} />
          <AppButton
            title="Submit contribution"
            loading={loading}
            onPress={submit}
          />
        </>
      }
    >
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
            {(["Mpesa", "Bank", "cash"] as const).map((item) => (
              <AppButton
                key={item}
                title={item}
                variant={method === item ? "default" : "outline"}
                onPress={() => setMethod(item)}
              />
            ))}
          </VStack>
        </FormField>
        {method === "Mpesa" && (
          <FormField label="Phone number" required>
            <AppInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="07XXXXXXXX"
            />
          </FormField>
        )}
        <FormField label="Reference">
          <AppInput
            value={reference}
            onChangeText={setReference}
            placeholder="Payment reference"
          />
        </FormField>
        {error && <Text style={{ color: colors.error }}>{error}</Text>}
        {success && <Text style={{ color: colors.success }}>{success}</Text>}
      </VStack>
    </AppDialog>
  );
}

export function LegacyLoanRequestDialog({
  open,
  onClose,
  token,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  token?: string;
  onSuccess?: () => void;
}) {
  const request = useLoanStore((state) => state.request);
  const loading = useLoanStore((state) => state.mutating);
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  useEffect(() => {
    if (!open) {
      setAmount("");
      setDuration("");
      setError("");
      setSuccess("");
    }
  }, [open]);
  async function submit() {
    const numericAmount = Number(amount);
    const numericDuration = Number(duration);
    if (!token) return setError("Your session has expired.");
    if (
      !numericAmount ||
      numericAmount <= 0 ||
      !Number.isInteger(numericDuration) ||
      numericDuration <= 0
    )
      return setError("Enter a positive amount and duration in months.");
    setError("");
    try {
      await request(token, {
        amount: numericAmount,
        duration: numericDuration,
      });
      setSuccess("Loan request submitted successfully.");
      onSuccess?.();
      setTimeout(onClose, 700);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to submit loan request.",
      );
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
        <FormField label="Duration" required helperText="Number of months">
          <AppInput
            value={duration}
            onChangeText={(value) => {
              setDuration(value.replace(/\D/g, ""));
              setError("");
            }}
            keyboardType="number-pad"
            placeholder="3"
          />
        </FormField>
        {error && <Text className="text-error">{error}</Text>}
        {success && <Text className="text-success">{success}</Text>}
      </VStack>
    </AppDialog>
  );
}

export function LegacyRepaymentDialog({
  open,
  onClose,
  token,
  loan,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  token?: string;
  loan?: CreditLoan;
  onSuccess?: () => void;
}) {
  const repay = useLoanStore((state) => state.repay);
  const loading = useLoanStore((state) => state.mutating);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Mpesa");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  useEffect(() => {
    if (!open) {
      setAmount("");
      setReference("");
      setError("");
      setSuccess("");
    }
  }, [open]);
  async function submit() {
    const value = Number(amount);
    if (!token || !loan?.id) return setError("Select an active loan first.");
    const outstanding = loan.amountRemaining ?? loan.balance;
    if (
      !value ||
      value <= 0 ||
      (outstanding !== undefined && value > outstanding)
    )
      return setError(`Enter an amount up to ${formatKes(outstanding)}.`);
    if (method !== "Cash" && !reference.trim())
      return setError("Enter a payment reference.");
    setError("");
    try {
      await repay(token, loan.id, {
        amount: value,
        method,
        reference: reference.trim(),
      });
      setSuccess("Repayment recorded successfully.");
      onSuccess?.();
      setTimeout(onClose, 700);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to record repayment.",
      );
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
          Outstanding: {formatKes(loan?.amountRemaining ?? loan?.balance)}
        </Text>
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
        <FormField label="Method" required>
          <VStack className="flex-row flex-wrap gap-2">
            {["Cash", "Bank", "Manual", "Mpesa", "Wallet"].map((item) => (
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
            placeholder="Transaction reference"
          />
        </FormField>
        {error && <Text className="text-error">{error}</Text>}
        {success && <Text className="text-success">{success}</Text>}
      </VStack>
    </AppDialog>
  );
}
