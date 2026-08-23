import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";
import { useLoanProducts } from "@/hooks/useLoanProducts";

export default function ProductDetailsScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { products, loading, error } = useLoanProducts(true);
  const router = useRouter();
  const product = products.find((item) => item.id === productId);
  return (
    <Screen>
      <VStack className="gap-5">
        {loading && <Text>Loading product...</Text>}
        {error && <Text className="text-error">{error}</Text>}
        {product ? (
          <>
            <VStack className="gap-2">
              <Text className="text-muted-foreground">Loan product</Text>
              <Heading size="3xl">{product.name}</Heading>
            </VStack>
            <AppCard>
              <VStack className="gap-3">
                <Text>{product.description ?? "Product details"}</Text>
                <Text>
                  Range: {product.minAmount ?? 0} - {product.maxAmount ?? 0}{" "}
                  {product.currency ?? "KES"}
                </Text>
                <Text>
                  Interest: {product.interestRate ?? 0}%{" "}
                  {product.interestType ?? ""}
                </Text>
                <Text>
                  Duration: {product.repaymentDurationMonths ?? 0} months
                </Text>
              </VStack>
            </AppCard>
            <AppButton
              title="Start application"
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/credit-management/apply",
                  params: { productId: product.id },
                })
              }
            />
          </>
        ) : (
          !loading &&
          !error && (
            <Text className="text-muted-foreground">
              This product is unavailable.
            </Text>
          )
        )}
      </VStack>
    </Screen>
  );
}
