import { Screen } from "@/components/layout/Screen";
import { AppCard } from "@/components/ui/AppCard";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useTheme } from "@/hooks/useTheme";
import { useRouter } from "expo-router";
import { FileCheck, Landmark, PackagePlus } from "lucide-react-native";
import { Pressable } from "react-native";

export default function AdminHomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <Screen>
      <VStack className="gap-5">
        <VStack className="gap-1">
          <Heading size="3xl">Admin workspace</Heading>
          <Text className="text-muted-foreground">
            Manage credit products, applications, and the loan portfolio.
          </Text>
        </VStack>
        <Pressable onPress={() => router.push("/admin/credit/products")}>
          <AppCard>
            <VStack className="gap-2">
              <PackagePlus size={24} color={colors.primary} />
              <Heading size="lg">Loan products</Heading>
              <Text className="text-muted-foreground">
                Create and manage products members can apply for.
              </Text>
            </VStack>
          </AppCard>
        </Pressable>
        <Pressable onPress={() => router.push("/admin/credit/applications")}>
          <AppCard>
            <VStack className="gap-2">
              <FileCheck size={24} color={colors.primary} />
              <Heading size="lg">Application approvals</Heading>
              <Text className="text-muted-foreground">
                Review applications and approve or reject them with notes.
              </Text>
            </VStack>
          </AppCard>
        </Pressable>
        <Pressable onPress={() => router.push("/admin/credit/portfolio")}>
          <AppCard>
            <VStack className="gap-2">
              <Landmark size={24} color={colors.primary} />
              <Heading size="lg">Loan portfolio</Heading>
              <Text className="text-muted-foreground">
                Monitor issued loans, balances, payments, and statuses.
              </Text>
            </VStack>
          </AppCard>
        </Pressable>
      </VStack>
    </Screen>
  );
}
