import type { PropsWithChildren } from "react";
import { useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import { spacing } from "@/theme";

export function Screen({ children }: PropsWithChildren) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const horizontalPadding = width >= 768 ? spacing.xxl : spacing.lg;
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingVertical: spacing.xl,
        paddingHorizontal: horizontalPadding,
      }}
    >
      {children}
    </SafeAreaView>
  );
}
