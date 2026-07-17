---
id: SPEC-google-auth-store
companions: []
sources:
  - ../../implementation-artifacts/spec-google-auth.md
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability only.

# Google Auth Store

## Why

Google authentication is already implemented, but downstream account, checkout, and eSIM ownership flows need one reliable app-level source for the signed-in user's session and profile identity. This prevents screens from re-deriving login state independently and makes startup, sign-in, and sign-out behavior consistent.

## Capabilities

- id: CAP-1
  intent: The app can save the authenticated Supabase session and Google-backed user identity into a shared auth store after Google sign-in succeeds.
  success: After a successful Google login, any screen reading the auth store receives the same non-null session and user without starting another OAuth request.

- id: CAP-2
  intent: The app can rehydrate the auth store from the persisted Supabase session when the app starts.
  success: Given a valid persisted session, opening the app loads the store into a signed-in state and exposes a completed initialization state without user interaction.

- id: CAP-3
  intent: The app can clear stored login information when the user signs out or Supabase reports the session is no longer valid.
  success: After sign-out, all auth store consumers receive `session: null`, `user: null`, and the Profile tab returns to the signed-out Google CTA.

- id: CAP-4
  intent: The app can expose normalized profile display data from the stored auth user for account UI consumers.
  success: Profile consumers can read display name, email, avatar URL, and member-since source data from the shared auth state without duplicating Supabase metadata parsing.

## Constraints

- Supabase Auth remains the source of truth for session validity; the app store mirrors it and must not invent a separate authentication authority.
- The implementation must keep Expo v56-compatible Supabase PKCE/session persistence already used by the Google auth flow.
- Stored auth data must not include Google client secrets or raw provider tokens beyond the Supabase session already managed by Supabase.
- The store must support loading, signing-in, signed-in, signed-out, and error states so screens do not guess from nullable user data alone.
- Do not add a new state-management dependency unless the codebase already has one or the implementation cannot stay simple without it.

## Non-goals

- Adding email/password, Apple, or other auth providers.
- Creating or syncing a database-backed user profile table.
- Adding route guards or changing the navigation model.
- Persisting checkout, order, or eSIM ownership data in the auth store.

## Success signal

- A manual or automated auth flow can demonstrate: fresh app launch restores an existing login into the shared store, Google sign-in updates every consumer, and sign-out clears every consumer. Profile should no longer need to own separate login identity state.

## Assumptions

- "Store" means an app-level auth state store available to screens, not a new Supabase database table.
- Normalized profile display data should be derived from Supabase `user_metadata`, `email`, and `created_at`, matching the current Profile behavior.

## Open Questions

- Should the store API replace the current `useAuth` context name, or should `useAuth` remain the public hook backed by the store internally?
