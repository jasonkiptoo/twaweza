import { useRouter } from "expo-router";
import { Plus, RefreshCw } from "lucide-react-native";
import { Screen } from "@/components/layout/Screen";
import { AppEmptyState, AppErrorState } from "@/components/ui/AppStates";
import { AppSkeleton } from "@/components/ui/AppSkeleton";
import { LoanProductCard } from "@/components/credit-management/LoanProductCard";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useLoanProducts } from "@/hooks/useLoanProducts";
import { AppButton } from "@/components/ui/AppButton";
import { useAuthStore } from "@/store/authStore";
import { StyleSheet, View } from "react-native";

export default function ProductsScreen() {
  const { products, loading, error, refresh } = useLoanProducts(true);
  const router = useRouter();
  const canCreate = useAuthStore(
    (state) => state.user?.role?.toLowerCase() === "admin",
  );
  return (
    <Screen>
      <View style={styles.container}>
      <VStack className="gap-4">
        <VStack className="flex-row items-center justify-between">
          <VStack>
            <Text className="text-muted-foreground">Credit management</Text>
            <Heading size="3xl">Loan products</Heading>
          </VStack>
          <RefreshCw size={20} />
        </VStack>
        {loading && !products.length && (
          <VStack className="gap-3">
            <AppSkeleton height={140} />
            <AppSkeleton height={140} />
          </VStack>
        )}
        {error && <AppErrorState message={error} onRetry={refresh} />}
        {!loading && !error && !products.length && (
          <AppEmptyState
            title="No loan products"
            message="There are no active credit products available for your group."
          />
        )}
        {products.map((product) => (
          <LoanProductCard key={product.id} product={product} />
        ))}
        <AppButton
          title="Back to loans"
          variant="ghost"
          onPress={() => router.back()}
        />
      </VStack>
      {canCreate && (
        <AppButton
          title="New product"
          onPress={() => router.push("/admin/credit/products")}
          style={styles.fab}
          accessibilityLabel="Create loan product"
        >
          <Plus size={18} color="white" />
        </AppButton>
      )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fab: { position: "absolute", right: 16, bottom: 16, borderRadius: 24 },
});
