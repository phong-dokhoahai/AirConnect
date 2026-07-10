---
title: 'Catalog API Data Composition'
type: 'feature'
created: '2026-06-29'
status: 'in-review'
baseline_commit: 'd3c12c87d92cf9fc73af4628371bacc2cb097c56'
context:
  - '{project-root}/AGENTS.md'
---

<frozen-after-approval reason="human-owned intent - do not modify unless human renegotiates">

## Intent

**Problem:** The app has Supabase catalog tables and low-level queries, but screens still depend on static catalog arrays and cannot consistently join country, region, plan, feature, and network data into UI-ready structures.

**Approach:** Add a small client-side catalog API that fetches catalog records from Supabase, composes nested plan data into the existing Home/Explore card shapes, and provides useful loading/error behavior when remote data is unavailable.

## Boundaries & Constraints

**Always:** Use the existing Supabase client in `src/lib/supabase.ts`, the existing table names from `src/lib/catalogQueries.ts`, and the existing UI component props where practical. Keep the implementation TypeScript-first and compatible with Expo SDK 56.

**Ask First:** Ask before changing Supabase schema, adding new packages, replacing the visual design system, or changing product pricing/business rules beyond formatting remote values.

**Never:** Do not hardcode a second source of truth for catalog data inside the new API, do not require service-role credentials in the client app, and do not remove the existing migration or Supabase setup files.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Home catalog loads | Supabase returns countries, regions, and active plans | Home receives popular destinations, regional plans, and recommended plans composed from remote data | N/A |
| Empty catalog | Supabase returns empty arrays | UI renders empty catalog sections without crashing | No thrown UI exception |
| Supabase error | Any catalog query fails | Caller receives a normalized error message and UI shows a small retry/error state | Preserve original error for console/debug where available |
| Partial joins | A plan lacks countries, regions, features, or networks | Mapper still returns a stable card using plan title and safe defaults | Missing nested arrays become empty arrays |

</frozen-after-approval>

## Code Map

- `src/lib/supabase.ts` -- Existing Supabase browser/native client with Expo SDK 56-compatible storage setup.
- `src/lib/catalogQueries.ts` -- Existing low-level Supabase queries for countries, regions, country plans, region plans, and plan details.
- `src/components/airconnect/home/types.ts` -- Existing UI-ready card contracts for home catalog sections.
- `src/components/airconnect/home/data.ts` -- Static fallback catalog arrays currently used by Home.
- `src/app/(tabs)/home.tsx` -- Home route that should consume composed catalog API data.
- `src/app/(tabs)/explore.tsx` -- Explore route with duplicated static catalog data that can consume the same composed catalog API.
- `src/app/plan/[id].tsx` -- Plan details route currently hardcoded; keep out of scope unless the new API needs shared detail types.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/catalogApi.ts` -- Add typed high-level functions that fetch Supabase catalog data and map it into UI-ready catalog groups -- centralizes composition logic.
- [x] `src/lib/catalogQueries.ts` -- Adjust or add low-level query helpers only if needed to fetch joined active plan data efficiently -- keeps Supabase select logic isolated.
- [x] `src/app/(tabs)/home.tsx` -- Replace static catalog imports with the composed catalog API plus loading/error/empty behavior -- makes Home use real catalog data.
- [x] `src/app/(tabs)/explore.tsx` -- Reuse the same API data for popular destinations, regional plans, and featured plans where practical -- removes duplicate catalog source.

**Acceptance Criteria:**
- Given seeded Supabase catalog data, when Home opens, then catalog sections render remote destinations, regions, and active plans with stable IDs and formatted prices.
- Given seeded Supabase catalog data, when Explore opens, then it shows the same catalog source instead of independently hardcoded countries/plans.
- Given Supabase returns an error, when Home or Explore opens, then the screen does not crash and shows a concise error/retry state.
- Given a plan has missing nested join rows, when catalog mapping runs, then the mapper still returns valid UI items with safe defaults.

## Verification

**Commands:**
- `npm run lint` -- expected: lint completes without new errors from changed files.
- `npx tsc --noEmit` -- expected: TypeScript validates the new API and route usage.
