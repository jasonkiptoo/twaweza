import { Text } from "./text";
import { formatKes } from "@/utils/currency";

export function CurrencyAmount({
  value,
  size = "md",
}: {
  value?: number;
  size?: "md" | "lg";
}) {
  return (
    <Text
      className={
        size === "lg"
          ? "text-3xl font-bold text-foreground"
          : "font-semibold text-foreground"
      }
    >
      {formatKes(value)}
    </Text>
  );
}
