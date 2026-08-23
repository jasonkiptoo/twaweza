import * as SplashScreen from "expo-splash-screen";
import { router } from "expo-router";
import { PiggyBank } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/authStore";

SplashScreen.preventAutoHideAsync();
const SPLASH_DURATION = 1800;
const SPLASH_FAILSAFE = 10000;

export default function SplashRoute() {
  const { colors } = useTheme();
  const initialized = useAuthStore((state) => state.initialized);
  const status = useAuthStore((state) => state.status);
  const otpRequired = useAuthStore((state) => state.otpRequired);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    const navigate = () => {
      void SplashScreen.hideAsync();
      if (status === "authenticated") {
        router.replace(otpRequired ? "/(auth)/otp" : "/(tabs)/dashboard");
      } else {
        router.replace("/(auth)/login");
      }
    };
    const failsafe = setTimeout(navigate, SPLASH_FAILSAFE);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 8,
        tension: 55,
        useNativeDriver: true,
      }),
    ]).start();
    const ready = setTimeout(() => {
      if (initialized) navigate();
    }, SPLASH_DURATION);
    return () => {
      clearTimeout(failsafe);
      clearTimeout(ready);
    };
  }, [initialized, opacity, otpRequired, scale, status]);

  return (
    <Screen>
      <VStack
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <Animated.View style={{ opacity, transform: [{ scale }] }}>
          <VStack className="items-center gap-4">
            <VStack
              style={[styles.logo, { backgroundColor: colors.primary }]}
              className="items-center justify-center"
            >
              <PiggyBank color={colors.onPrimary} size={42} strokeWidth={1.8} />
            </VStack>
            <VStack className="items-center gap-1">
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                SaveSmart
              </Text>
              <Text style={{ color: colors.textSecondary }}>
                Save now, or never
              </Text>
            </VStack>
          </VStack>
        </Animated.View>
        <Text style={{ color: colors.muted }}>Powered by Financial Guru</Text>
      </VStack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    margin: -24,
  },
  logo: { width: 92, height: 92, borderRadius: 28 },
  title: { fontSize: 32, lineHeight: 40, fontWeight: "700" },
});
