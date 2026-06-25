---
title: 'Convert srcWeb to React Native'
type: 'feature'
created: '2026-06-12T00:00:00+07:00'
status: 'done'
baseline_commit: 'a665ea3d0194c114f8f4f511ac36025360161ee5'
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/package.json'
---

<frozen-after-approval reason="human-owned intent - do not modify unless human renegotiates">

## Intent

**Problem:** The real AirConnect experience lives under `srcWeb` as a DOM/Tailwind React app, while the Expo app under `src` is still mostly starter content. The project needs the `srcWeb` screens converted into native React Native code that runs through Expo SDK 56, Expo Router, and Uniwind.

**Approach:** Replace the Expo starter routes with AirConnect native routes, port each user-facing `srcWeb/app/components/*Screen.tsx` screen to React Native primitives, and preserve the current onboarding, browsing, purchase, eSIM detail, and profile flows through Expo Router navigation.

## Boundaries & Constraints

**Always:** Read and follow the exact Expo SDK 56 docs before implementation. Use the existing Expo Router project structure under `src/app`; keep TypeScript strict; use React Native primitives plus Uniwind `className` styling where supported; keep the AirConnect visual language, content, and screen flow recognizable; use safe-area-aware layouts for mobile; replace web-only APIs with Expo/React Native equivalents.

**Ask First:** Adding a backend, payment provider, authentication provider, persistent database, or changing product behavior beyond the static/demo flow requires human approval. Removing large user-facing sections from the original web screens also requires approval unless the section cannot be represented safely in React Native during this migration.

**Never:** Do not port the unused shadcn/Radix web UI kit wholesale. Do not introduce DOM elements (`div`, `button`, `input`, `span`) into native screens. Do not rely on web-only CSS, Radix primitives, or `lucide-react` in native code. Do not reset or discard existing dirty-tree changes. Do not delete `srcWeb`; the user will remove it after the conversion is complete.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| First app launch | User opens `/` in the Expo app | AirConnect welcome/onboarding starts instead of the Expo template | If navigation state is missing, default to welcome |
| Skip onboarding | User taps Skip on welcome | User lands in the main AirConnect home/tab experience | Route replace prevents accidental back to skipped onboarding |
| Complete onboarding | User selects purpose, destination, date, and usage | User sees recommendation and can continue into main app | Missing selections keep continue controls disabled or show native feedback |
| Main tabs | User taps Home, Explore, My eSIMs, Profile | Expo Router tab routes render the matching native screens | Unknown route falls back to a safe main tab |
| Detail flows | User opens plan detail, checkout, success, eSIM detail | Stack navigation supports forward/back behavior without web callbacks | Back actions use `router.back()` with fallback routes where needed |

</frozen-after-approval>

## Code Map

- `srcWeb/app/App.tsx` -- current web state machine and canonical screen flow to translate into routes.
- `srcWeb/app/components/*Screen.tsx` -- source user-facing web screens to port.
- `srcWeb/app/components/ui/*` -- mostly unused web-only shadcn/Radix components; do not migrate wholesale.
- `src/app/_layout.tsx` -- current Expo Router root layout to replace with AirConnect stack/tabs structure.
- `src/app/index.tsx` and `src/app/explore.tsx` -- Expo template screens to replace.
- `src/components/app-tabs.tsx` and `.web.tsx` -- current two-tab template shell; may be replaced or removed if Expo Router group tabs are used.
- `src/app/**/*.tsx` -- Expo Router route files contain their own user-facing screen implementation; do not add non-route screen modules under `src/app`.
- `src/components/airconnect/ui/*.tsx` -- reusable native UI primitives and cards split into dedicated component files.
- `src/constants/airconnect.ts` -- shared AirConnect fixtures and typed data used by routes/components.
- `src/global.css` -- existing global CSS entry point for font variables; extend only if Uniwind setup requires it.
- `package.json` -- Expo SDK 56 dependencies already present; may need native icon package or Uniwind setup adjustment.

## Tasks & Acceptance

**Execution:**
- [x] `src/app/_layout.tsx` -- replace template layout with an AirConnect-safe root `Stack`/providers layout -- enables routed migration.
- [x] `src/app/(onboarding)/*` -- create onboarding routes for welcome, purpose, destination, date, usage, and recommendation -- replaces `srcWeb/app/App.tsx` onboarding state transitions.
- [x] `src/app/(tabs)/*` -- create main tab routes for home, explore, my eSIMs, and profile -- replaces local tab state and starter template tabs.
- [x] `src/app/plan/[id].tsx`, `src/app/checkout.tsx`, `src/app/success.tsx`, `src/app/esim/[id].tsx` -- create stack detail routes -- supports purchase and eSIM detail flows.
- [x] `src/app/**/*.tsx` -- inline each AirConnect screen into its Expo Router route file -- keeps user-facing screens in the route tree without creating extra non-route files under `src/app`.
- [x] `src/components/airconnect/ui/*.tsx` -- split reusable native UI primitives/cards into dedicated component files -- avoids a large consolidated UI module.
- [x] `src/constants/airconnect.ts` -- keep shared fixtures and typed data outside routes/components -- avoids duplicating product data.
- [x] `package.json` and related config -- add or adjust native-compatible dependencies/config only when required -- removes web-only assumptions.
- [x] Remove or orphan no-longer-used Expo starter UI imports from active routes while leaving `srcWeb` intact -- prevents stale template screens from shipping without deleting the source reference.

**Acceptance Criteria:**
- Given the app launches at `/`, when the first screen renders, then the user sees the AirConnect welcome/onboarding experience instead of the Expo starter page.
- Given the user completes or skips onboarding, when they enter the main app, then tab navigation exposes Home, Explore, My eSIMs, and Profile screens.
- Given a plan/eSIM detail entry point is tapped, when navigation occurs, then Expo Router opens the appropriate stack detail screen and native back navigation works.
- Given TypeScript compilation/lint runs, when the migration is complete, then active app code contains no DOM JSX tags or `lucide-react` imports.

## Spec Change Log

- 2026-06-15: Superseded earlier dedicated-screen-module structure after review feedback; do not consolidate screens into a single implementation file.
- 2026-06-15: Updated implementation structure after follow-up review. Screen implementations now live directly in their Expo Router route files under `src/app`; reusable UI lives under `src/components/airconnect/ui`; shared fixtures live in `src/constants/airconnect.ts`; `src/features/airconnect` has been removed.

## Design Notes

Port screens by intent rather than mechanical JSX substitution. Large web-only UI patterns should become native layouts: horizontal carousels via horizontal `ScrollView`, card grids via flex rows or `FlatList`, fixed bottom navigation via Expo Router tabs, and web alerts via `Alert.alert`. Icons should come from a React Native-compatible icon library or a tiny local adapter so screen code remains readable.

## Verification

**Commands:**
- `npm run lint` -- expected: lint completes without active-route TypeScript or JSX errors.
- `npm run web` -- expected: Expo web bundle starts and renders AirConnect routes.

**Manual checks (if no CLI):**
- Navigate onboarding, main tabs, plan detail, checkout, success, and eSIM detail in Expo Web or a simulator and confirm visible content is not the Expo starter template.

## Suggested Review Order

**Routing Shell**

- Root Stack replaces starter tabs and wires all AirConnect route groups.
  [`_layout.tsx:7`](../../src/app/_layout.tsx#L7)

- Index now sends first launch into the onboarding flow.
  [`index.tsx:3`](../../src/app/index.tsx#L3)

- Onboarding starts from file routes instead of the old web state switch.
  [`welcome.tsx:5`](../../src/app/(onboarding)/welcome.tsx#L5)

- Main app tabs expose Home, Explore, My eSIMs, and Profile.
  [`_layout.tsx:6`](../../src/app/(tabs)/_layout.tsx#L6)

**Converted Screens**

- Expo Router route files contain the React Native/Uniwind screen implementations.
  [`destination.tsx:1`](../../src/app/(onboarding)/destination.tsx#L1)
  [`travel-date.tsx:1`](../../src/app/(onboarding)/travel-date.tsx#L1)
  [`data-usage.tsx:1`](../../src/app/(onboarding)/data-usage.tsx#L1)
  [`recommendation.tsx:1`](../../src/app/(onboarding)/recommendation.tsx#L1)
  [`home.tsx:1`](../../src/app/(tabs)/home.tsx#L1)
  [`explore.tsx:1`](../../src/app/(tabs)/explore.tsx#L1)
  [`my-esims.tsx:1`](../../src/app/(tabs)/my-esims.tsx#L1)
  [`profile.tsx:1`](../../src/app/(tabs)/profile.tsx#L1)
  [`checkout.tsx:1`](../../src/app/checkout.tsx#L1)
  [`success.tsx:1`](../../src/app/success.tsx#L1)
  [`esim-details.tsx:1`](../../src/app/esim-details.tsx#L1)

- Home route binds native cards to plan and eSIM navigation.
  [`home.tsx:5`](../../src/app/(tabs)/home.tsx#L5)

- Explore route opens native plan detail screens.
  [`explore.tsx:5`](../../src/app/(tabs)/explore.tsx#L5)

- My eSIMs route opens native eSIM detail screens.
  [`my-esims.tsx:5`](../../src/app/(tabs)/my-esims.tsx#L5)

- Shared data replaces corrupted web emoji payloads with typed fixtures.
  [`airconnect.ts:11`](../../src/constants/airconnect.ts#L11)

**Review Patches**

- Plan detail preserves selected plan through checkout.
  [`[id].tsx:17`](../../src/app/plan/[id].tsx#L17)

- Checkout preserves selected plan through success.
  [`checkout.tsx:16`](../../src/app/checkout.tsx#L16)

- Detail routes use safe back fallbacks for direct entry.
  [`checkout.tsx:8`](../../src/app/checkout.tsx#L8)

- Bad eSIM IDs show native missing-record states.
  [`esim-details.tsx:28`](../../src/app/esim-details.tsx#L28)

- Plan detail uses per-plan network metadata.
  [`airconnect.ts:64`](../../src/constants/airconnect.ts#L64)

**Config**

- Uniwind Metro integration enables native `className` compilation.
  [`metro.config.js:6`](../../metro.config.js#L6)

- Tailwind then Uniwind imports satisfy the SDK 56 web bundle.
  [`global.css:1`](../../src/global.css#L1)

- `srcWeb` stays intact but outside active TypeScript checks.
  [`tsconfig.json:20`](../../tsconfig.json#L20)

- ESLint ignores archival `srcWeb` while checking active app code.
  [`eslint.config.js:8`](../../eslint.config.js#L8)
