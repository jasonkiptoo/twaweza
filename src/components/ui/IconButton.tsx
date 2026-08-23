import { Pressable } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export function IconButton({
  children,
  label,
  onPress,
}: {
  children: React.ReactNode;
  label: string;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        opacity: pressed ? 0.7 : 1,
        borderRadius: 22,
        backgroundColor: colors.surface,
        alignItems: "center",
        justifyContent: "center",
      })}
    >
      {children}
    </Pressable>
  );
}
