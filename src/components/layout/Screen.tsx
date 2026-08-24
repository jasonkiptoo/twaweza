import { useTheme } from "@/hooks/useTheme";
import { spacing } from "@/theme";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import type { PropsWithChildren } from "react";
import { Pressable, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
      <View style={{ flex: 1 }}>
        {router.canGoBack() && (
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={10}
            style={{
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: spacing.sm,
            }}
          >
            <ArrowLeft size={22} color={colors.textPrimary} />
          </Pressable>
        )}
        {children}
      </View>
    </SafeAreaView>
  );
}
