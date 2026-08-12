# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## Commands

- Dev: `pnpm start` (`pnpm run ios` / `pnpm run android` / `pnpm run web` to target a platform)
- Format: `pnpm format` (`pnpm format:check` to verify without changing files)
- Typecheck: `pnpm typecheck`
- Tests: `pnpm test`
- If Metro becomes stale after editing, restart with `pnpm exec expo start -c`

## Routing

- Routes live under `src/app/` (Expo Router supports `src/app`), NOT a root `app/` dir. Entry is `expo-router/entry` (package.json `main`).
- The root layout provides the data and application theme contexts.

## Styling

- Use React Native core components and `StyleSheet`; do not add a UI or utility-class library without an explicit product need.
- Theme tokens live in `src/theme.tsx`. Shared controls and glass surfaces live in `src/components/ui.tsx`.
- `GlassSurface` uses native Liquid Glass where available and blur/translucent fallbacks elsewhere.
- Preserve first-class iOS, Android, and web behavior. Use platform files such as `Component.web.tsx` where native controls do not translate cleanly.
