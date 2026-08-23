import { AppCard } from "@/components/ui/AppCard";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import type { CreditLoanSchedule } from "@/types/creditManagement";

export function LoanSchedule({ schedule }: { schedule: CreditLoanSchedule[] }) {
  if (!schedule.length)
    return (
      <Text className="text-muted-foreground">
        No repayment schedule available.
      </Text>
    );
  return (
    <VStack className="gap-3">
      {schedule.map((item) => (
        <AppCard key={item.number}>
          <VStack className="gap-2">
            <VStack className="flex-row items-center justify-between">
              <Text className="font-semibold">Payment {item.number}</Text>
              <StatusBadge status={item.status} />
            </VStack>
            <Text size="sm" className="text-muted-foreground">
              Due{" "}
              {item.dueDate
                ? new Date(item.dueDate).toLocaleDateString()
                : "date unavailable"}
            </Text>
            <VStack className="flex-row justify-between">
              <Text>Amount due</Text>
              <CurrencyAmount value={item.amountDue} />
            </VStack>
            <VStack className="flex-row justify-between">
              <Text>Paid</Text>
              <CurrencyAmount value={item.amountPaid} />
            </VStack>
          </VStack>
        </AppCard>
      ))}
    </VStack>
  );
}
