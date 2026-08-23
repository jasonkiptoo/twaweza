import { ActivityIndicator } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export function Spinner() {
  const { colors } = useTheme();
  return (
    <ActivityIndicator color={colors.primary} accessibilityLabel="Loading" />
  );
}
