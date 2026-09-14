import { Banknote, Building2, Smartphone, Wallet } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import type { ColorValue } from "react-native";

export type ContributionPaymentMethod = "mpesa" | "bank" | "cash";

export function normalizeContributionPaymentMethod(
  method: unknown,
): ContributionPaymentMethod | undefined {
  const value = String(method ?? "").trim().toLowerCase().replace(/[\s-]/g, "");
  if (value === "mpesa") return "mpesa";
  if (value === "bank") return "bank";
  if (value === "cash") return "cash";
  return undefined;
}

export function contributionPaymentMethodLabel(
  method: ContributionPaymentMethod,
) {
  return method === "mpesa"
    ? "M-Pesa"
    : method.charAt(0).toUpperCase() + method.slice(1);
}

const icons: Record<ContributionPaymentMethod, LucideIcon> = {
  mpesa: Smartphone,
  bank: Building2,
  cash: Banknote,
};

export function PaymentMethodIcon({
  method,
  color,
  size = 20,
}: {
  method: ContributionPaymentMethod;
  color: ColorValue;
  size?: number;
}) {
  const Icon = icons[method] ?? Wallet;
  return <Icon color={color} size={size} />;
}