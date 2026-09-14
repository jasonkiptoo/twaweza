import Constants from "expo-constants";

export type AppEnvironment = "development" | "staging" | "production";

const API_BASE_URLS: Record<AppEnvironment, string> = {
  development: "http://localhost:4100/api/v1",
  staging: "https://twaweza-api.onrender.com/api/v1",
  production: "https://twaweza-api.onrender.com/api/v1",
};

function readEnvironment(): AppEnvironment {
  const value =
    Constants.expoConfig?.extra?.appEnvironment ??
    process.env.EXPO_PUBLIC_ENVIRONMENT ??
    process.env.EXPO_PUBLIC_APP_ENV;
  return value === "staging" || value === "production" ? value : "development";
}

export const env = {
  environment: readEnvironment(),
  apiBaseUrl: API_BASE_URLS[readEnvironment()],
  isDevelopment: readEnvironment() === "development",
  isStaging: readEnvironment() === "staging",
  isProduction: readEnvironment() === "production",
} as const;
