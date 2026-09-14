import { AppCard } from "@/components/ui/AppCard";
import { AppSkeleton } from "@/components/ui/AppSkeleton";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import type { CreditLoan } from "@/types/creditManagement";
import { formatFinancialDate } from "@/utils/date";
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
        <VStack className="gap-2">
          <VStack className="flex-row items-center justify-between gap-2">
            <Text className="font-semibold" numberOfLines={1}>
              {loan.productSnapshot?.name ??
                (typeof loan.product === "object"
                  ? loan.product.name
                  : "Credit loan")}
            </Text>
            <StatusBadge status={loan.status} />
          </VStack>
          <VStack className="flex-row justify-between gap-3">
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
          {loan.nextPaymentDate && (
            <Text size="sm" className="text-muted-foreground">
              Next payment: {formatFinancialDate(loan.nextPaymentDate)}
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

export function LoanCardSkeleton() {
  return (
    <AppCard className="gap-2 p-3">
      <VStack className="flex-row items-center justify-between gap-3">
        <AppSkeleton height={18} width="48%" />
        <AppSkeleton height={24} width={92} radius={999} />
      </VStack>
      <VStack className="flex-row justify-between gap-3">
        <AppSkeleton height={14} width="32%" />
        <AppSkeleton height={14} width="32%" />
      </VStack>
      <AppSkeleton height={14} width="58%" />
    </AppCard>
  );
}
