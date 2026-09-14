import { AppCard } from "@/components/ui/AppCard";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import type { CreditLoanSchedule } from "@/types/creditManagement";
import { formatFinancialDate } from "@/utils/date";
import { ScrollView } from "react-native";

export function LoanSchedule({ schedule }: { schedule: CreditLoanSchedule[] }) {
  if (!schedule.length)
    return (
      <Text className="text-muted-foreground">
        No repayment schedule available.
      </Text>
    );
  return (
    <ScrollView
      nestedScrollEnabled
      showsVerticalScrollIndicator
      style={{ maxHeight: 360 }}
      contentContainerStyle={{ gap: 8, paddingRight: 2 }}
    >
      {schedule.map((item) => (
        <AppCard key={item.id ?? item.number} className="p-3">
          <VStack className="gap-1">
            <VStack className="flex-row items-center justify-between">
              <Text className="font-semibold">Payment {item.number}</Text>
              <StatusBadge status={item.status} />
            </VStack>
            <Text size="sm" className="text-muted-foreground">
              Due{" "}
              {item.dueDate
                ? formatFinancialDate(item.dueDate)
                : "date unavailable"}
            </Text>
            <VStack className="flex-row justify-between">
              <Text>Principal</Text>
              <CurrencyAmount value={item.principal} />
            </VStack>
            <VStack className="flex-row justify-between">
              <Text>Interest</Text>
              <CurrencyAmount value={item.interest} />
            </VStack>
            <VStack className="flex-row justify-between">
              <Text>Penalty</Text>
              <CurrencyAmount value={item.penalty} />
            </VStack>
            <VStack className="flex-row justify-between">
              <Text className="font-semibold">Amount due</Text>
              <CurrencyAmount value={item.amountDue} />
            </VStack>
            {item.paidAt && (
              <Text size="sm" className="text-muted-foreground">
                Paid {formatFinancialDate(item.paidAt)}
              </Text>
            )}
            {item.amountPaid !== undefined && (
              <VStack className="flex-row justify-between">
                <Text>Paid</Text>
                <CurrencyAmount value={item.amountPaid} />
              </VStack>
            )}
          </VStack>
        </AppCard>
      ))}
    </ScrollView>
  );
}
