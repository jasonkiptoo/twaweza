import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { AppCard } from "@/components/ui/AppCard";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Screen } from "@/components/layout/Screen";
import { AppButton } from "@/components/ui/AppButton";
import { useTheme } from "@/hooks/useTheme";
export default function AdminCreditHome() {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <Screen>
      <VStack className="gap-4">
        <Heading size="3xl">Credit management</Heading>
        <AppButton
          title="Add loan product"
          onPress={() => router.push("/admin/credit/products")}
        >
          <Plus size={18} color={colors.onPrimary} />
        </AppButton>
        <AppCard onTouchEnd={() => router.push("/admin/credit/products")}>
          <Heading size="lg">Products</Heading>
          <Text className="text-muted-foreground">
            Manage group credit products.
          </Text>
        </AppCard>
        <AppCard onTouchEnd={() => router.push("/admin/credit/applications")}>
          <Heading size="lg">Applications</Heading>
          <Text className="text-muted-foreground">
            Review and decide applications.
          </Text>
        </AppCard>
        <AppCard onTouchEnd={() => router.push("/admin/credit/portfolio")}>
          <Heading size="lg">Portfolio</Heading>
          <Text className="text-muted-foreground">
            Review active credit records.
          </Text>
        </AppCard>
      </VStack>
    </Screen>
  );
}
