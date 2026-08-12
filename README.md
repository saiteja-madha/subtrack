# SubTrack

SubTrack is a local-first subscription tracker for iOS, Android, and the web. It keeps recurring expenses, renewal dates, and reminders in one place without requiring an account or remote backend.

Built with Expo Router, React Native, TypeScript, and SQLite.

## Features

- Track subscription prices, billing cycles, renewal dates, categories, notes, and status.
- View monthly and yearly spending summaries.
- Group upcoming renewals by date.
- Search, filter, and sort subscriptions.
- Schedule renewal reminders on supported native platforms.
- Choose system, light, or dark appearance.
- Export and import versioned JSON backups.
- Reset local data or add sample data in development builds.
- Use the same responsive interface on iOS, Android, and web.

## Technology

- [Expo SDK 57](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/) with file-based routes under `src/app/`
- React 19 and React Native 0.86
- TypeScript in strict mode
- Expo SQLite for local persistence
- React Native `StyleSheet` with shared theme tokens
- Expo Glass Effect on supported iOS versions, with blur/translucent fallbacks elsewhere
- Vitest for domain and database tests
- Prettier for formatting

## Requirements

- A current Node.js LTS release
- [pnpm](https://pnpm.io/) 11 (the repository declares its exact package-manager version)
- Expo Go, an iOS simulator, an Android emulator, or a web browser

Native iOS development requires macOS and Xcode. Android development requires Android Studio and an Android SDK.

## Getting started

Install dependencies:

```sh
pnpm install
```

Start the Expo development server:

```sh
pnpm start
```

Run a specific platform:

```sh
pnpm ios
pnpm android
pnpm web
```

If Metro serves stale assets after a configuration change, restart it with a cleared cache:

```sh
pnpm exec expo start -c
```

## Quality checks

```sh
pnpm format        # Format the repository
pnpm format:check  # Verify formatting
pnpm typecheck     # Run TypeScript without emitting files
pnpm test          # Run the Vitest suite once
```

Expo dependency compatibility can be checked with:

```sh
pnpm exec expo install --check
pnpm peers check
```

## Project structure

```text
src/
├── app/          Expo Router screens and layouts
├── components/   Shared React Native UI components
├── constants/    Categories, currencies, and reminder options
├── db/           SQLite setup, migrations, adapters, and repositories
├── domain/       Subscription validation and billing calculations
├── hooks/        Application data provider and state operations
├── services/     Backup, notification, and sample-data services
├── utils/        Date, identifier, and money helpers
└── theme.tsx     Color tokens and appearance provider
```

The primary tabs are Home, Subscriptions, Upcoming, and Settings. Subscription create, detail, and edit screens live under `src/app/subscription/`.

## Data and privacy

SubTrack stores subscriptions, categories, and preferences in a local SQLite database. It does not include authentication, analytics, or a hosted backend.

JSON backup export and import are available from Settings:

- Native platforms use the system file and sharing interfaces.
- Web uses browser download and file-selection APIs.

Import data is validated before it replaces the current database. Keep exported backups somewhere secure if the data matters to you.

## Platform notes

- Renewal notifications are scheduled locally on iOS and Android after permission is granted.
- Browser notifications are intentionally disabled; the web implementation is a no-op.
- The web build uses Expo SQLite's WebAssembly worker and requires the cross-origin headers configured in `app.json` when hosted.
- Native Liquid Glass is used only where the operating system supports it. Other platforms use visual fallbacks.

## Production exports

Create static bundles for every supported platform:

```sh
pnpm exec expo export --platform all
```

Production signing and store distribution can be configured with [EAS Build](https://docs.expo.dev/build/introduction/) when deployment is needed.

## Dependency audit note

`pnpm audit` currently reports two high-severity `image-size` advisories inherited through Expo's Metro build tooling. They affect malformed image processing during development/build and are not part of SubTrack's runtime data path. As of August 11, 2026, npm lists no published patched version (the latest release is 2.0.2, while the advisories require 2.0.3). Do not suppress the findings; re-run the audit after `image-size`, Expo, or Metro publishes a compatible update.
