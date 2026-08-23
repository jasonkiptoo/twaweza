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
          <Text className="font-semibold">Application {application.id}</Text>
          <StatusBadge status={application.status} />
        </VStack>
        <CurrencyAmount value={application.requestedAmount} />
        <Text className="text-muted-foreground">
          {application.purpose ?? "Loan application"}
        </Text>
      </VStack>
    </AppCard>
  );
}
