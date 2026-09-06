import { Screen } from "@/components/layout/Screen";
import { AppCard } from "@/components/ui/AppCard";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useTheme } from "@/hooks/useTheme";
import { useRouter } from "expo-router";
import { Coins, FileCheck, Landmark, PackagePlus, UsersRound } from "lucide-react-native";
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
            Manage group finance and approvals from one workspace.
          </Text>
        </VStack>
        <Heading size="lg">Contributions</Heading>
        <Pressable onPress={() => router.push("/admin/contribution-approvals")}>
          <AppCard>
            <VStack className="gap-2">
              <Coins size={24} color={colors.primary} />
              <Heading size="lg">Contributions</Heading>
              <Text className="text-muted-foreground">
                Review contribution approvals and monitor member payments.
              </Text>
            </VStack>
          </AppCard>
        </Pressable>
        <Heading size="lg">Loans & credit</Heading>
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
        <Heading size="lg">Group operations</Heading>
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
        <Pressable onPress={() => router.push("/admin/users")}>
          <AppCard>
            <VStack className="gap-2">
              <UsersRound size={24} color={colors.primary} />
              <Heading size="lg">Members</Heading>
              <Text className="text-muted-foreground">
                Review members and their group access.
              </Text>
            </VStack>
          </AppCard>
        </Pressable>
      </VStack>
    </Screen>
  );
}
