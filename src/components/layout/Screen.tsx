import { Text } from "@/components/ui/text";
import { useTheme } from "@/hooks/useTheme";
import { spacing } from "@/theme";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import type { PropsWithChildren } from "react";
import { Pressable, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function Screen({
  children,
  eyebrow,
  title,
  showBack = true,
}: PropsWithChildren<{
  eyebrow?: string;
  title?: string;
  showBack?: boolean;
}>) {
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
        {(showBack || eyebrow || title) && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              gap: spacing.sm,
              marginBottom: spacing.lg,
            }}
          >
            {showBack && router.canGoBack() && (
              <Pressable
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                hitSlop={10}
                style={{
                  width: 32,
                  height: 32,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ArrowLeft size={22} color={colors.textPrimary} />
              </Pressable>
            )}
            {(eyebrow || title) && (
              <View style={{ flex: 1, gap: 2 }}>
                {eyebrow && (
                  <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                    {eyebrow}
                  </Text>
                )}
                {title && (
                  <Text
                    style={{
                      color: colors.textPrimary,
                      fontSize: 28,
                      lineHeight: 34,
                      fontWeight: "700",
                    }}
                  >
                    {title}
                  </Text>
                )}
              </View>
            )}
          </View>
        )}
        {children}
      </View>
    </SafeAreaView>
  );
}
