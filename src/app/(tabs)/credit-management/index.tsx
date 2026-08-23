import { useRouter } from "expo-router";
import { CreditCard, FileText } from "lucide-react-native";
import { Screen } from "@/components/layout/Screen";
import { AppCard } from "@/components/ui/AppCard";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useTheme } from "@/hooks/useTheme";

export default function CreditHome() {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <Screen>
      <VStack className="gap-5">
        <VStack className="gap-1">
          <Text className="text-muted-foreground">Borrow with clarity</Text>
          <Heading size="3xl">Loans</Heading>
        </VStack>
        <AppCard
          onTouchEnd={() => router.push("/(tabs)/credit-management/products")}
        >
          <VStack className="gap-2">
            <CreditCard size={24} color={colors.primary} />
            <Heading size="lg">Loan products</Heading>
            <Text className="text-muted-foreground">
              Explore available products and terms.
            </Text>
          </VStack>
        </AppCard>
        <AppCard
          onTouchEnd={() =>
            router.push("/(tabs)/credit-management/applications")
          }
        >
          <VStack className="gap-2">
            <FileText size={24} color={colors.primary} />
            <Heading size="lg">My applications</Heading>
            <Text className="text-muted-foreground">
              Track submitted applications.
            </Text>
          </VStack>
        </AppCard>
        <AppCard
          onTouchEnd={() => router.push("/(tabs)/credit-management/loans")}
        >
          <VStack className="gap-2">
            <CreditCard size={24} color={colors.primary} />
            <Heading size="lg">My loans</Heading>
            <Text className="text-muted-foreground">
              Review balances and repayment schedules.
            </Text>
          </VStack>
        </AppCard>
      </VStack>
    </Screen>
  );
}
