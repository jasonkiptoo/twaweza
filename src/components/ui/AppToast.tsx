import { Text } from "./text";
import { Box } from "./box";
import { useTheme } from "@/hooks/useTheme";

type ToastKind = "success" | "error" | "warning" | "info";

export function AppToast({
  kind = "info",
  title,
  message,
}: {
  kind?: ToastKind;
  title: string;
  message?: string;
}) {
  const { colors } = useTheme();
  const accent = colors[kind];
  return (
    <Box
      style={{
        borderLeftWidth: 4,
        borderLeftColor: accent,
        backgroundColor: colors.card,
      }}
      className="rounded-lg border border-border p-4"
    >
      <Text className="font-semibold">{title}</Text>
      {message && <Text className="text-muted-foreground">{message}</Text>}
    </Box>
  );
}
