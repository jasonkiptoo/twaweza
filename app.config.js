const appJson = require("./app.json");

const baseConfig = appJson.expo;

function getEnvironment() {
  const value =
    process.env.EXPO_PUBLIC_ENVIRONMENT ?? process.env.EXPO_PUBLIC_APP_ENV;
  return value === "staging" || value === "production" ? value : "development";
}

function getApiBaseUrl(environment) {
  return environment === "development"
    ? "http://localhost:4100/api/v1"
    : "https://twaweza-api.onrender.com/api/v1";
}

module.exports = ({ config }) => {
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
};