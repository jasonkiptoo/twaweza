import { LoanSchedule } from "@/components/credit-management/LoanSchedule";
import { Screen } from "@/components/layout/Screen";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppErrorState } from "@/components/ui/AppStates";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { Heading } from "@/components/ui/heading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useLoanDetails } from "@/hooks/useLoanDetails";
import { useLocalSearchParams, useRouter } from "expo-router";
import { RefreshCw } from "lucide-react-native";

export default function LoanDetailsScreen() {
  const { loanId } = useLocalSearchParams<{ loanId: string }>();
  const router = useRouter();
  const { loan, schedule, loading, error, refresh } = useLoanDetails(loanId);
  return (
    <Screen>
      <VStack className="gap-5">
        <VStack className="flex-row items-center justify-between">
          <Heading size="3xl">Loan details</Heading>
          <RefreshCw size={20} onPress={() => void refresh()} />
        </VStack>
        {error && <AppErrorState message={error} onRetry={refresh} />}
        {loading && !loan && <Text>Loading loan...</Text>}
        {loan && (
          <>
            <AppCard>
              <VStack className="gap-3">
                <VStack className="flex-row items-center justify-between">
                  <Text className="font-semibold">
                    {loan.productSnapshot?.name ??
                      (typeof loan.product === "object"
                        ? loan.product.name
                        : "Credit loan")}
                  </Text>
                  <StatusBadge status={loan.status} />
                </VStack>
                <CurrencyAmount value={loan.principalAmount} size="lg" />
                <VStack className="flex-row justify-between">
                  <Text>Outstanding</Text>
                  <CurrencyAmount
                    value={loan.amountRemaining ?? loan.balance}
                  />
                </VStack>
                <VStack className="flex-row justify-between">
                  <Text>Total paid</Text>
                  <CurrencyAmount value={loan.totalPaid} />
                </VStack>
                <VStack className="flex-row justify-between">
                  <Text>Interest</Text>
                  <CurrencyAmount value={loan.interestAmount} />
                </VStack>
                <VStack className="flex-row justify-between">
                  <Text>Fees</Text>
                  <CurrencyAmount value={loan.fees} />
                </VStack>
                {loan.nextPaymentDate && (
                  <Text className="text-muted-foreground">
                    Next payment:{" "}
                    {new Date(loan.nextPaymentDate).toLocaleDateString()}
                  </Text>
                )}
                {loan.overdueDays !== undefined && loan.overdueDays > 0 && (
                  <Text className="text-error">
                    {loan.overdueDays} days overdue
                  </Text>
                )}
              </VStack>
            </AppCard>
            <VStack className="gap-3">
              <Heading size="lg">Repayment schedule</Heading>
              <LoanSchedule schedule={schedule} />
            </VStack>
            <AppButton
              title="Record payment"
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/credit-management/loans/[loanId]/payment",
                  params: { loanId },
                })
              }
            />
          </>
        )}
      </VStack>
    </Screen>
  );
}
