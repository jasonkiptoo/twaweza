import type { ConfigContext, ExpoConfig } from "expo/config";
import appJson from "./app.json";

const baseConfig = appJson.expo as ExpoConfig;

type AppEnvironment = "development" | "staging" | "production";

function getEnvironment(): AppEnvironment {
  const value =
    process.env.EXPO_PUBLIC_ENVIRONMENT ?? process.env.EXPO_PUBLIC_APP_ENV;
  return value === "staging" || value === "production" ? value : "development";
}

function getApiBaseUrl(environment: AppEnvironment) {
  return environment === "development"
    ? "http://localhost:4100/api/v1"
    : "https://twaweza-api.onrender.com/api/v1";
}

export default function appConfig({ config }: ConfigContext): ExpoConfig {
  const environment = getEnvironment();
  return {
    ...baseConfig,
    ...config,
    name: "SaveSmart",
    slug: "savesmart",
    scheme: "savesmart",
    extra: {
      ...baseConfig.extra,
      ...config.extra,
      appEnvironment: environment,
      apiBaseUrl: getApiBaseUrl(environment),
    },
  };
}
