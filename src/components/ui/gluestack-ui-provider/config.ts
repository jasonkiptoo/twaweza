import { vars } from "nativewind";
import { colors as semanticColors } from "@/theme";

// Raw color values - update these and they sync everywhere
export const colors = {
  light: {
    "--primary": "36 87 255",
    "--primary-foreground": "255 255 255",
    "--card": "255 255 255",
    "--secondary": "241 244 255",
    "--secondary-foreground": "15 23 42",
    "--background": "245 247 251",
    "--popover": "255 255 255",
    "--popover-foreground": "15 23 42",
    "--muted": "241 245 249",
    "--muted-foreground": "100 116 139",
    "--destructive": "239 68 68",
    "--foreground": "15 23 42",
    "--border": "226 232 240",
    "--input": "226 232 240",
    "--ring": "95 116 249",
    "--accent": "239 242 255",
    "--accent-foreground": "15 23 42",
  },
  dark: {
    "--primary": "124 143 255",
    "--primary-foreground": "7 17 31",
    "--card": "16 27 48",
    "--secondary": "31 46 78",
    "--secondary-foreground": "248 251 255",
    "--background": "7 17 31",
    "--popover": "14 23 40",
    "--popover-foreground": "248 251 255",
    "--muted": "20 34 58",
    "--muted-foreground": "169 183 204",
    "--destructive": "248 113 113",
    "--foreground": "248 251 255",
    "--border": "36 53 83",
    "--input": "36 53 83",
    "--ring": "124 143 255",
    "--accent": "24 39 68",
    "--accent-foreground": "248 251 255",
  },
};

// Config for nativewind vars() - used by provider
export const config = {
  light: vars(colors.light),
  dark: vars(colors.dark),
};
