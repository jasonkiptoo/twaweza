import { AppCard } from "@/components/ui/AppCard";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import type { CreditLoan } from "@/types/creditManagement";
import { formatKes } from "@/utils/currency";
import { Link } from "expo-router";

export function LoanCard({ loan }: { loan: CreditLoan }) {
  return (
    <Link
      href={{
        pathname: "/(tabs)/credit-management/loans/[loanId]",
        params: { loanId: loan.id },
      }}
      asChild
    >
      <AppCard className="p-3">
        <VStack className="gap-1.5">
          <VStack className="gap-0.5">
            <Text className="font-semibold" numberOfLines={1}>
              {loan.productSnapshot?.name ??
                (typeof loan.product === "object"
                  ? loan.product.name
                  : "Credit loan")}
            </Text>
            <StatusBadge status={loan.status} />
          </VStack>
          <VStack className="flex-row justify-between">
            <VStack>
              <Text size="sm" className="text-muted-foreground">
                Principal
              </Text>
              <CurrencyAmount value={loan.principalAmount ?? loan.principal} />
            </VStack>
            <VStack>
              <Text size="sm" className="text-muted-foreground">
                Remaining
              </Text>
              <CurrencyAmount value={loan.amountRemaining ?? loan.balance} />
            </VStack>
          </VStack>
          <VStack className="flex-row flex-wrap justify-between gap-1">
            <Text size="sm" className="text-muted-foreground">
              Interest: {formatKes(loan.interestAmount ?? loan.interest)}
            </Text>
            <Text size="sm" className="text-muted-foreground">
              Fees: {formatKes(loan.fees)}
            </Text>
            <Text size="sm" className="text-muted-foreground">
              Paid: {formatKes(loan.totalPaid)}
            </Text>
          </VStack>
          {loan.nextPaymentDate && (
            <Text size="sm" className="text-muted-foreground">
              Next payment:{" "}
              {new Date(loan.nextPaymentDate).toLocaleDateString()}
            </Text>
          )}
          {loan.overdueDays !== undefined && loan.overdueDays > 0 && (
            <Text size="sm" className="text-error">
              {loan.overdueDays} days overdue
            </Text>
          )}
        </VStack>
      </AppCard>
    </Link>
  );
}
