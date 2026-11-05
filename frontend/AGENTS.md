This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Project structure & Navigation

This app uses **React Navigation** (not Expo Router). All source code lives in `src/`:

- `src/navigation/` — `RootNavigator` picks `AuthStack` / `UserTabs` / `AdminStack` by `user.role`; param list types in `types.ts`
- `src/screens/{auth,user,admin}/` — screen components
- `src/components/` — reusable UI (Screen, Button, TextField, Card, LoadingView, ErrorView)
- `src/theme/` — colors, spacing, typography. Style with `StyleSheet` + theme tokens (no NativeWind)
- `src/services/` — backend API calls via `http.ts` (axios, Bearer token, normalized `ApiError`); `mock/` is used when `EXPO_PUBLIC_USE_MOCK=true`
- `src/store/` — Redux Toolkit store + RTK Query (`api.ts`). Screens read server data through its hooks; endpoints wrap the services above (so axios + mock still apply). Cache is reset on logout.
- `src/components/game/` + `src/theme/game.ts` — Figma "Style A – Game hoá" UI used by Exam/Result. Illustrations and colorful icons (tab bar, stars) are Microsoft Fluent Emoji 3D PNGs (MIT) in `assets/emoji/` via `src/components/Emoji.tsx`; UI icons are Ionicons. Every new graphic must be listed in `CREDITS.md`.
- `src/components/motion.tsx` — shared Reanimated 4 effects (Float, Swim, Sway, RiseFade, PopIn, Bounce, Pulse, usePressScale, CountUp, listEntering). Reuse these for new screens; every effect must respect `useReducedMotion()`. If web throws "useAnimatedStyle was used without ... Babel plugin", restart with `npx expo start -c`.
- `src/hooks/` (`useAuth` + `AuthProvider`, `useCountdown`), `src/types/`, `src/utils/` (`config.ts`, `tokenStorage.ts`)

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
