import { useThemeStore } from "@/store/themeStore";
import { colors, type ThemeMode } from "@/theme";
import { useColorScheme } from "react-native";

export function useTheme() {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const systemScheme = useColorScheme();
  const resolvedMode =
    mode === "system" ? (systemScheme === "dark" ? "dark" : "light") : mode;
  return {
    mode,
    resolvedMode,
    isDark: resolvedMode === "dark",
    colors: colors[resolvedMode],
    setMode,
    toggleTheme,
  };
}
