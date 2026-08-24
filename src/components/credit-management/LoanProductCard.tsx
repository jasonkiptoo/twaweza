import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import type { CreditProduct } from "@/types/creditManagement";
import { Link } from "expo-router";
import { View } from "react-native";

export function LoanProductCard({ product }: { product: CreditProduct }) {
  return (
    <AppCard>
      <VStack className="gap-3">
        <VStack className="gap-1">
          <Text className="font-semibold">{product.name}</Text>
          <Text className="text-muted-foreground">
            {product.description ?? "Flexible group credit product."}
          </Text>
        </VStack>
        <VStack className="gap-2">
          <Text size="sm">
            {product.currency ?? "KES"} {product.minAmount ?? 0} -{" "}
            {product.maxAmount ?? 0}
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {product.interestRate !== undefined && (
              <Text size="sm" className="text-muted-foreground">
                Interest: {product.interestRate}%
                {product.interestType ? ` ${product.interestType}` : ""}
              </Text>
            )}
            {product.repaymentFrequency && (
              <Text size="sm" className="text-muted-foreground">
                {product.repaymentFrequency} repayments
              </Text>
            )}
            {product.repaymentDurationMonths !== undefined && (
              <Text size="sm" className="text-muted-foreground">
                {product.repaymentDurationMonths} months
              </Text>
            )}
          </View>
        </VStack>
        <Link
          href={{
            pathname: "/(tabs)/credit-management/products/[productId]",
            params: { productId: product.id },
          }}
          asChild
        >
          <AppButton title="View product" />
        </Link>
      </VStack>
    </AppCard>
  );
}
