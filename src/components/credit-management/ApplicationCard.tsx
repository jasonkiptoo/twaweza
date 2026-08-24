import { AppCard } from "@/components/ui/AppCard";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import type { CreditLoanApplication } from "@/types/creditManagement";

export function ApplicationCard({
  application,
}: {
  application: CreditLoanApplication;
}) {
  return (
    <AppCard>
      <VStack className="gap-2">
        <VStack className="flex-row items-center justify-between">
          <Text className="font-semibold">
            {application.productSnapshot?.name ??
              (typeof application.product === "object"
                ? application.product.name
                : "Loan application")}
          </Text>
          <StatusBadge status={application.status} />
        </VStack>
        <CurrencyAmount value={application.requestedAmount} />
        <Text className="text-muted-foreground">
          {application.purpose ?? "Loan application"}
        </Text>
        {typeof application.member === "object" && (
          <Text size="sm" className="text-muted-foreground">
            Applicant: {application.member.username ?? application.member.email ?? "Member"}
          </Text>
        )}
      </VStack>
    </AppCard>
  );
}
