import "@/global.css";

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import { useEffect } from "react";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";

function RouteGate() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const mode = useThemeStore((state) => state.mode);
  const systemScheme = useColorScheme();
  const resolvedMode =
    mode === "system" ? (systemScheme === "dark" ? "dark" : "light") : mode;
  const storageHydrated = useAuthStore((state) => state.storageHydrated);

  useEffect(() => {
    if (storageHydrated) void useAuthStore.getState().hydrate();
  }, [storageHydrated]);

  return (
    <SafeAreaProvider>
      <GluestackUIProvider mode={resolvedMode}>
        <ThemeProvider
          value={resolvedMode === "dark" ? DarkTheme : DefaultTheme}
        >
          <RouteGate />
        </ThemeProvider>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}
