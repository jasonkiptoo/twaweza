import { Link } from "expo-router";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import type { CreditProduct } from "@/types/creditManagement";

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
        <Text size="sm">
          {product.currency ?? "KES"} {product.minAmount ?? 0} -{" "}
          {product.maxAmount ?? 0}
        </Text>
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
