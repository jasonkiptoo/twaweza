import { Text } from "./text";
import { Box } from "./box";
import type { ComponentProps } from "react";

export function AppBadge({
  label,
  ...props
}: ComponentProps<typeof Box> & { label: string }) {
  return (
    <Box
      {...props}
      className={`self-start rounded-full bg-secondary px-3 py-1 ${props.className ?? ""}`}
    >
      <Text size="sm">{label}</Text>
    </Box>
  );
}
