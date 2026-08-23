# SaveSmart

Save now, or never. SaveSmart is a cross-platform group savings and credit-management application for chama members and administrators.

## Stack

React Native, TypeScript, Expo, Expo Router, Gluestack UI, NativeWind, Zustand, Axios, AsyncStorage, lucide-react-native, and EAS Build.

## Run locally

```bash
npm install
npx expo start
npx expo start --clear
```

The local API defaults to `http://localhost:4100/api/v1`. Set it with `EXPO_PUBLIC_API_BASE_URL` in `.env.local`.

## Architecture

- `src/theme`: semantic colors, typography, spacing, radii, shadows, dimensions, and component tokens.
- `src/components/ui`: thin wrappers over the configured Gluestack primitives.
- `src/components/layout`: shared screen layout conventions.
- `src/services`: Axios client and request helpers.
- `src/store`: independent Zustand stores per domain.
- `src/utils`: responsive, pagination, and API error utilities.
- `src/config`: typed runtime environment configuration.

Screens should consume semantic theme values and shared wrappers instead of defining brand colors or arbitrary spacing locally. Light and dark mode are persisted by `themeStore` using AsyncStorage.

## Environments

Use `.env.example` as the template. `.env.local`, `.env.staging`, and `.env.production` contain only client-safe public configuration and are ignored by Git. Never put private backend secrets in Expo public variables.

## Navigation

Expo Router owns the route tree under `src/app`. The root layout provides safe-area handling, theme, Gluestack variables, and the router stack. Feature route groups will be added in subsequent implementation phases.

## API and state

Axios is configured from `EXPO_PUBLIC_API_BASE_URL`; authenticated services should use `authHeaders(token)`. Stores own domain state and independent loading/error flags. API errors are normalized through `parseApiError`, and paginated responses should use the shared pagination helpers.

## Expo and EAS

```bash
npx expo start
npx expo run:android
npx expo run:ios
npx expo export
eas build --profile development
eas build --profile preview
eas build --profile production
```

`eas.json` defines development, preview/staging, and production profiles. Replace the placeholder EAS project ID in app configuration before a real build.

## Compatibility note

The repository currently contains Expo SDK 57, React Native 0.86, and Expo Router 57. The requested blueprint specifies Expo SDK 54 and Router v6. The existing SDK 57 configuration was preserved because it is the currently installed and booting setup; migrating SDK versions should be a dedicated dependency upgrade with the matching Expo 54 package matrix.
