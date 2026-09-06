import { useRouter } from "expo-router";
import { useState } from "react";
import { CreditCard, FileText, PiggyBank } from "lucide-react-native";
import { Screen } from "@/components/layout/Screen";
import { AppCard } from "@/components/ui/AppCard";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useTheme } from "@/hooks/useTheme";
import { Pressable } from "react-native";

export default function CreditHome() {
  const router = useRouter();
  const { colors } = useTheme();
  const [section, setSection] = useState<"Contributions" | "Loans">("Contributions");
  return (
    <Screen>
      <VStack className="gap-5">
        <VStack className="gap-1">
          <Text className="text-muted-foreground">Borrow with clarity</Text>
          <Heading size="3xl">Finance</Heading>
        </VStack>
        <VStack className="flex-row gap-2">
          {(["Contributions", "Loans"] as const).map((item) => (
            <AppCard
              key={item}
              style={{
                flex: 1,
                borderWidth: section === item ? 2 : 1,
                borderColor: section === item ? colors.primary : colors.border,
              }}
              onPress={() => setSection(item)}
            >
              <Text
                className="text-center font-semibold"
                style={{ color: section === item ? colors.primary : colors.textPrimary }}
              >
                {item}
              </Text>
            </AppCard>
          ))}
        </VStack>
        {section === "Contributions" && (
        <Pressable
          onPress={() => router.push("/(tabs)/contributions")}
          accessibilityRole="button"
          accessibilityLabel="Open contributions"
        >
          <AppCard>
            <VStack className="gap-2">
              <PiggyBank size={24} color={colors.primary} />
              <Heading size="lg">Contributions</Heading>
              <Text className="text-muted-foreground">
                Review contribution history, payment references, and statuses.
              </Text>
            </VStack>
          </AppCard>
        </Pressable>
        )}
        {section === "Loans" && (
          <>
            <Pressable
              onPress={() => router.push("/(tabs)/credit-management/products")}
              accessibilityRole="button"
              accessibilityLabel="Open loan products"
            >
              <AppCard>
                <VStack className="gap-2">
                  <CreditCard size={24} color={colors.primary} />
                  <Heading size="lg">Loan products</Heading>
                  <Text className="text-muted-foreground">
                    Explore available products and terms.
                  </Text>
                </VStack>
              </AppCard>
            </Pressable>
            <Pressable
              onPress={() => router.push("/(tabs)/credit-management/applications")}
              accessibilityRole="button"
              accessibilityLabel="Open my applications"
            >
              <AppCard>
                <VStack className="gap-2">
                  <FileText size={24} color={colors.primary} />
                  <Heading size="lg">My applications</Heading>
                  <Text className="text-muted-foreground">
                    Track submitted applications.
                  </Text>
                </VStack>
              </AppCard>
            </Pressable>
            <Pressable
              onPress={() => router.push("/(tabs)/credit-management/loans")}
              accessibilityRole="button"
              accessibilityLabel="Open my loans"
            >
              <AppCard>
                <VStack className="gap-2">
                  <CreditCard size={24} color={colors.primary} />
                  <Heading size="lg">My loans</Heading>
                  <Text className="text-muted-foreground">
                    Review balances and repayment schedules.
                  </Text>
                </VStack>
              </AppCard>
            </Pressable>
          </>
        )}
      </VStack>
    </Screen>
  );
}
