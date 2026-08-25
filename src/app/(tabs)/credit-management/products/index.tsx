import { LoanProductCard } from "@/components/credit-management/LoanProductCard";
import { Screen } from "@/components/layout/Screen";
import { AppButton } from "@/components/ui/AppButton";
import { AppSkeleton } from "@/components/ui/AppSkeleton";
import { AppEmptyState, AppErrorState } from "@/components/ui/AppStates";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useLoanProducts } from "@/hooks/useLoanProducts";
import { useTheme } from "@/hooks/useTheme";
import { useRouter } from "expo-router";
import { Plus, RefreshCw } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

export default function ProductsScreen() {
  const { colors } = useTheme();
  const { products, loading, error, refresh, hasMore, loadMore } =
    useLoanProducts(true);
  const router = useRouter();
  return (
    <Screen>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingBottom: 96 }}
        >
        <VStack className="gap-3">
          <VStack className="flex-row items-center justify-between">
            <VStack>
              <Text className="text-muted-foreground">Credit management</Text>
              <Heading size="3xl">Loan products</Heading>
            </VStack>
            <RefreshCw
              size={20}
              onPress={() => void refresh()}
              accessibilityLabel="Refresh loan products"
            />
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
          {hasMore && (
            <AppButton
              title="Load more products"
              loading={loading}
              onPress={loadMore}
              variant="outline"
            />
          )}
          <AppButton
            title="Back to loans"
            variant="ghost"
            onPress={() => router.back()}
          />
        </VStack>
        </ScrollView>
        <Pressable
          onPress={() => router.push("/admin/credit/products")}
          style={[styles.fab, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
          accessibilityLabel="Add loan product"
          accessibilityHint="Opens the loan product creation form"
        >
          <Plus size={26} color={colors.onPrimary} />
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});
