import { AppCard } from "@/components/ui/AppCard";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import type { CreditLoanApplication } from "@/types/creditManagement";
import { Pressable } from "react-native";

export function ApplicationCard({
  application,
  onPress,
}: {
  application: CreditLoanApplication;
  onPress?: () => void;
}) {
  const product = application.productSnapshot;
  const member =
    typeof application.member === "object" ? application.member : undefined;
  const productName =
    product?.name ??
    (typeof application.product === "object"
      ? application.product.name
      : "Loan application");

  const card = (
    <AppCard className="p-3">
      <VStack className="gap-1.5">
        <VStack className="flex-row items-center justify-between">
          <Text className="flex-1 font-semibold" numberOfLines={1}>
            {productName}
          </Text>
          <StatusBadge status={application.status} />
        </VStack>
        <VStack className="flex-row items-center justify-between">
          <CurrencyAmount value={application.requestedAmount} />
          <Text size="sm" className="text-muted-foreground" numberOfLines={1}>
            {application.purpose ?? "No purpose provided"}
          </Text>
        </VStack>
        <Text size="sm" className="text-muted-foreground" numberOfLines={1}>
          {member
            ? `Applicant: ${member.username ?? member.email ?? "Member"}`
            : "Applicant unavailable"}
          {product?.interestRate !== undefined
            ? `  |  ${product.interestRate}% ${product.interestType ?? "interest"}`
            : ""}
          {product?.repaymentFrequency
            ? `  |  ${product.repaymentFrequency}`
            : ""}
          {product?.repaymentDurationMonths
            ? ` ${product.repaymentDurationMonths} mo.`
            : ""}
        </Text>
      </VStack>
    </AppCard>
  );

  if (!onPress) return card;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        console.log("[ApplicationCard] pressed", application.id);
        onPress();
      }}
    >
      {card}
    </Pressable>
  );
}
