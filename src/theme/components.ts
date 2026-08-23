import { colors } from "./colors";
import { radii } from "./radii";
import { spacing } from "./spacing";

export const componentTokens = {
  screen: { background: colors.light.background, padding: spacing.xxl },
  card: {
    background: colors.light.card,
    radius: radii.md,
    padding: spacing.lg,
  },
  input: { height: 48, radius: radii.sm },
  button: { height: 48, radius: radii.sm },
} as const;
