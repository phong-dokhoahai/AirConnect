---
title: 'Setup Supabase Client'
type: 'feature'
created: '2026-06-25'
status: 'done'
route: 'one-shot'
---

# Setup Supabase Client

## Intent

**Problem:** AirConnect had Supabase connection values in `.env` but no installed client, runtime initialization, or auth session persistence setup.

**Approach:** Install the Expo/Supabase dependencies, register the SQLite-backed auth storage plugin, and expose a shared Supabase client at `src/lib/supabase.ts` with React Native foreground-aware token refresh.

## Suggested Review Order

**Client Initialization**

- Shared Supabase entry point validates env and configures persisted auth sessions.
  [`supabase.ts:1`](../../src/lib/supabase.ts#L1)

- React Native AppState gates auth refresh to foreground usage.
  [`supabase.ts:26`](../../src/lib/supabase.ts#L26)

**Expo Configuration**

- Expo SQLite config plugin is registered by `expo install`.
  [`app.json:39`](../../app.json#L39)

- Supabase and React Native support packages are declared.
  [`package.json:6`](../../package.json#L6)
