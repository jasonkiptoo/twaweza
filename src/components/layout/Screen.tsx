import type { PropsWithChildren } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import { spacing } from "@/theme";

export function Screen({ children }: PropsWithChildren) {
  const { colors } = useTheme();
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: spacing.xxl,
      }}
    >
      {children}
    </SafeAreaView>
  );
}
