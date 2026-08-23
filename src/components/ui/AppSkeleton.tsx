import { Box } from "./box";
import type { DimensionValue } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export function AppSkeleton({
  width = "100%",
  height = 16,
  radius = 8,
}: {
  width?: DimensionValue;
  height?: number;
  radius?: number;
}) {
  const { colors } = useTheme();
  return (
    <Box
      style={{
        width,
        height,
        borderRadius: radius,
        backgroundColor: colors.border,
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <Box className="gap-3 rounded-xl border border-border bg-card p-4">
      <AppSkeleton height={20} width="45%" />
      <AppSkeleton height={14} width="80%" />
      <AppSkeleton height={48} />
    </Box>
  );
}
