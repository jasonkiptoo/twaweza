import Constants from "expo-constants";

export type AppEnvironment = "development" | "staging" | "production";

function readEnvironment(): AppEnvironment {
  const value =
    process.env.EXPO_PUBLIC_ENVIRONMENT ??
    process.env.EXPO_PUBLIC_APP_ENV ??
    Constants.expoConfig?.extra?.appEnvironment;
  return value === "staging" || value === "production" ? value : "development";
}

export const env = {
  environment: readEnvironment(),
  apiBaseUrl:
    process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:4100/api/v1",
  isDevelopment: readEnvironment() === "development",
  isStaging: readEnvironment() === "staging",
  isProduction: readEnvironment() === "production",
} as const;
