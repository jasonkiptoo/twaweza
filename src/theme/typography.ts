export const typography = {
  display: { fontSize: 36, lineHeight: 44, fontWeight: "700" as const },
  h1: { fontSize: 30, lineHeight: 38, fontWeight: "700" as const },
  h2: { fontSize: 24, lineHeight: 32, fontWeight: "700" as const },
  h3: { fontSize: 20, lineHeight: 28, fontWeight: "600" as const },
  title: { fontSize: 18, lineHeight: 26, fontWeight: "600" as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: "400" as const },
  bodySmall: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: "400" as const },
  label: { fontSize: 14, lineHeight: 20, fontWeight: "600" as const },
  button: { fontSize: 15, lineHeight: 20, fontWeight: "600" as const },
  amount: { fontSize: 28, lineHeight: 36, fontWeight: "700" as const },
  statistic: { fontSize: 22, lineHeight: 28, fontWeight: "700" as const },
} as const;

export type TypographyToken = keyof typeof typography;
