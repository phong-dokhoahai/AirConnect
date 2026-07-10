---
title: 'Google Sign In and Sign Up'
type: 'feature'
created: '2026-06-30T00:00:00+07:00'
status: 'done'
baseline_commit: 'd3c12c87d92cf9fc73af4628371bacc2cb097c56'
context:
  - '{project-root}/AGENTS.md'
---

<frozen-after-approval reason="human-owned intent - do not modify unless human renegotiates">

## Intent

**Problem:** AirConnect currently shows a static profile and has no real sign in/sign up entry point, so users cannot authenticate before managing eSIM purchases or account settings.

**Approach:** Add Google OAuth through Supabase Auth using Expo v56-compatible AuthSession/WebBrowser redirect handling, then wire the Profile tab to show either a Google sign-in/sign-up screen or the authenticated user profile with sign out.

## Boundaries & Constraints

**Always:** Use the existing Supabase client and Expo app scheme `airconnect`. Persist Supabase sessions through the existing client storage setup. Keep auth behavior self-contained in reusable `src/lib` code where possible. Show useful loading and error states in the Profile tab.

**Ask First:** Adding email/password auth, adding database profile tables, changing the app navigation guard model, or requiring native project config beyond app scheme.

**Never:** Do not replace Supabase Auth, hardcode Google client secrets, remove existing profile sections unrelated to auth, or revert unrelated dirty worktree changes.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Google auth success | Signed-out user taps Google CTA and completes provider flow | Supabase session is exchanged, Profile tab renders authenticated user name/email | N/A |
| Provider canceled | User closes auth browser | Profile remains signed out | No destructive state change; show a short cancel/error message only when the provider returns an error |
| OAuth URL failure | Supabase does not return an auth URL | Sign-in button becomes available again | Show an actionable error message |
| Existing session | App starts with persisted Supabase session | Profile renders signed-in state without another OAuth prompt | If session loading fails, render signed-out state with error text |
| Sign out | Signed-in user taps Sign Out | Supabase session is cleared and Profile returns to Google CTA | Show error if Supabase rejects sign out |

</frozen-after-approval>

## Code Map

- `package.json` -- Expo/Supabase dependencies; needs Expo v56 auth packages.
- `app.json` -- existing app scheme used for OAuth redirects.
- `src/lib/supabase.ts` -- existing Supabase client with persisted PKCE auth sessions.
- `src/lib/installLocalStorage.ts` -- native localStorage installer backed by Expo SQLite.
- `src/lib/installLocalStorage.web.ts` -- web no-op so native storage setup does not force web SQLite bundling.
- `src/lib/auth.tsx` -- new reusable Google OAuth/session helpers.
- `src/app/_layout.tsx` -- root location for auth provider and WebBrowser completion setup.
- `src/app/(tabs)/profile.tsx` -- user-facing sign-in/sign-up, signed-in profile data, and sign out.

## Tasks & Acceptance

**Execution:**
- [x] `package.json` / `package-lock.json` -- install `expo-auth-session` and `expo-crypto` with Expo v56-compatible versions -- required by Expo AuthSession.
- [x] `src/lib/supabase.ts` / `src/lib/installLocalStorage.ts` -- enable PKCE and keep native persisted storage setup platform-scoped -- required for Supabase OAuth code exchange.
- [x] `src/lib/auth.tsx` -- add auth context/provider, session subscription, Google OAuth start/exchange flow, and sign out -- centralizes auth behavior.
- [x] `src/app/_layout.tsx` -- wrap app in auth provider -- makes session state available to screens.
- [x] `src/app/(tabs)/profile.tsx` -- replace static-only identity with Supabase user state and signed-out Google CTA -- completes user-facing feature.

**Acceptance Criteria:**
- Given no persisted session, when the user opens Profile, then they see a Google sign-in/sign-up entry point instead of static account actions.
- Given a signed-out user, when Google OAuth completes successfully, then Profile shows the authenticated user's name/email from Supabase metadata.
- Given a signed-in user, when they tap Sign Out, then Supabase clears the session and Profile returns to the signed-out Google CTA.
- Given auth is loading or fails, when Profile renders, then it shows a clear loading or error state without crashing.

## Design Notes

Use Supabase's PKCE OAuth redirect flow instead of direct Google SDK tokens. `skipBrowserRedirect: true` lets the app open the provider URL with Expo WebBrowser/AuthSession, then hand the returned callback URL back to `exchangeCodeForSession`.

## Verification

**Commands:**
- `npm run lint` -- expected: no lint errors from changed files.
- `npx tsc --noEmit` -- expected: no TypeScript errors from changed files.

## Suggested Review Order

**Auth Flow**

- Start with the provider boundary and session lifecycle.
  [`auth.tsx:66`](../../src/lib/auth.tsx#L66)

- Review redirect construction and callback code parsing together.
  [`auth.tsx:34`](../../src/lib/auth.tsx#L34)

- Check the Google OAuth start and PKCE exchange path.
  [`auth.tsx:105`](../../src/lib/auth.tsx#L105)

- Confirm Supabase uses PKCE for mobile-safe code exchange.
  [`supabase.ts:24`](../../src/lib/supabase.ts#L24)

- Confirm native keeps SQLite-backed localStorage install.
  [`installLocalStorage.ts:1`](../../src/lib/installLocalStorage.ts#L1)

**App Integration**

- Confirm the root tree exposes auth state to every route.
  [`_layout.tsx:14`](../../src/app/_layout.tsx#L14)

- Confirm the OAuth callback route exists for web and deep links.
  [`callback.tsx:1`](../../src/app/auth/callback.tsx#L1)

**Profile Experience**

- Review how Supabase user metadata becomes profile display data.
  [`profile.tsx:80`](../../src/app/(tabs)/profile.tsx#L80)

- Check the signed-out Google CTA and loading state.
  [`profile.tsx:291`](../../src/app/(tabs)/profile.tsx#L291)

- Confirm Profile switches between signed-out and signed-in states.
  [`profile.tsx:390`](../../src/app/(tabs)/profile.tsx#L390)

- Confirm Sign Out is wired to Supabase auth.
  [`profile.tsx:757`](../../src/app/(tabs)/profile.tsx#L757)

**Dependencies**

- Confirm Expo v56 auth dependencies were installed.
  [`package.json:10`](../../package.json#L10)
