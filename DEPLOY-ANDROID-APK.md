# Deploy SaveSmart Android APK

The repository includes `.github/workflows/build-android-apk.yml`.

The workflow builds an installable Android APK using the production API:

`https://twaweza-api.onrender.com/api/v1`

## One-time GitHub setup

1. Create an Expo account or use the existing EAS account.
2. Create an Expo access token at https://expo.dev/accounts/[account]/settings/access-tokens.
3. In the GitHub repository, open **Settings > Secrets and variables > Actions**.
4. Add the repository secret `EXPO_TOKEN` containing the Expo access token.
5. Add the repository variable `EAS_ACCOUNT` containing the Expo account owner name.

The workflow will create/link the EAS project automatically when `app.json` still contains the placeholder project ID.

## Start a build

- Run the workflow manually from **Actions > Build Android APK > Run workflow**.
- Or push a version tag, for example:

```bash
git tag v1.0.0
git push origin v1.0.0
```

When the build finishes, download `savesmart-production.apk` from the workflow run's **Artifacts** section and install it on an Android device.

## Local build

After authenticating with EAS and linking the project:

```bash
npm install --global eas-cli@24.3.0
eas login
eas project:init --account YOUR_EAS_ACCOUNT
npm run build:android:apk:wait
```

Use `eas project:init` exactly as shown. The `YOUR_EAS_ACCOUNT` value is the Expo account owner name, not an email address. The command creates or links the project and writes its ID to `app.json`.

The EAS build page will provide the APK download URL.

## Profiles

- `production`: production Android store build, normally an AAB.
- `production-apk`: production API configuration and installable APK output.
- `preview`: staging API configuration for internal builds.
