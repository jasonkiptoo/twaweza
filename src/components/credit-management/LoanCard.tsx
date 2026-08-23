import { Link } from "expo-router";
import { AppCard } from "@/components/ui/AppCard";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import type { CreditLoan } from "@/types/creditManagement";

export function LoanCard({ loan }: { loan: CreditLoan }) {
  return (
    <Link
      href={{
        pathname: "/(tabs)/credit-management/loans/[loanId]",
        params: { loanId: loan.id },
      }}
      asChild
    >
      <AppCard>
        <VStack className="gap-3">
          <VStack className="gap-1">
            <Text className="font-semibold">Loan {loan.id}</Text>
            <StatusBadge status={loan.status} />
          </VStack>
          <VStack className="flex-row justify-between">
            <VStack>
              <Text size="sm" className="text-muted-foreground">
                Principal
              </Text>
              <CurrencyAmount value={loan.principalAmount} />
            </VStack>
            <VStack>
              <Text size="sm" className="text-muted-foreground">
                Remaining
              </Text>
              <CurrencyAmount value={loan.amountRemaining ?? loan.balance} />
            </VStack>
          </VStack>
          {loan.nextPaymentDate && (
            <Text size="sm" className="text-muted-foreground">
              Next payment:{" "}
              {new Date(loan.nextPaymentDate).toLocaleDateString()}
            </Text>
          )}
        </VStack>
      </AppCard>
    </Link>
  );
}
