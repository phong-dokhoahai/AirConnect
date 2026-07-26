---
title: 'Language Switch in Settings'
type: 'feature'
created: '2026-07-25'
status: 'done'
baseline_commit: '80b66df030f7fed7ef7b15ecc46af0394088bf2c'
context:
  - '{project-root}/docs/ai-rules/ui.md'
  - '{project-root}/docs/ai-rules/code.md'
  - '{project-root}/docs/ai-rules/documentation.md'
---

<frozen-after-approval reason="human-owned intent -- do not modify unless human renegotiates">

## Intent

**Problem:** Profile settings currently show a static "Language & Region" row, so users cannot choose or switch app language from settings.

**Approach:** Add a small language preference inside Profile settings, support English and Vietnamese, persist the selected language locally, and immediately reflect the chosen language in the Profile settings UI.

## Boundaries & Constraints

**Always:** Reuse existing Profile components and patterns. Keep the change local to Profile/settings unless a tiny shared helper is already needed. Persist the selection with the local storage already installed by the app. Keep English as the default when there is no saved preference or the saved value is invalid.

**Ask First:** Adding a full i18n dependency, translating every screen, syncing language preference to Supabase, or adding a separate settings route.

**Never:** Do not introduce a new UI library. Do not change unrelated checkout, payment, auth, catalog, or Supabase code. Do not rewrite the Profile screen layout.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Default language | No saved language exists | Profile settings render in English and Language row shows English | Use English fallback |
| Switch language | User presses Language row | Language changes to the next supported option and visible Profile/settings labels update | Save selected code locally |
| Persisted language | Saved language is `vi` before screen opens | Profile settings render Vietnamese labels and Language row shows Tiếng Việt | N/A |
| Invalid saved language | Saved language is unknown | Profile settings render in English | Ignore invalid value and overwrite on next valid switch |

</frozen-after-approval>

## Code Map

- `src/features/profile/ProfileScreen.tsx` -- Composes Profile UI and passes preference state into settings sections.
- `src/features/profile/hooks/useProfilePreferences.ts` -- Owns local Profile settings state and should load/save language preference.
- `src/features/profile/components/SettingsSections.tsx` -- Renders Account, Preferences, Security, Support, and Account Actions rows.
- `src/features/profile/components/SettingItem.tsx` -- Existing reusable row component for pressable setting items.
- `src/features/profile/types.ts` -- Feature-local types for setting rows and profile data.
- `src/features/profile/constants.ts` -- Feature-local static options and labels.

## Tasks & Acceptance

**Execution:**
- [x] `src/features/profile/types.ts` -- add `LanguageCode` and optional `accessibilityLabel` on setting rows -- keeps language state typed and improves pressable accessibility.
- [x] `src/features/profile/constants.ts` -- add supported language options and Profile/settings translations -- keeps static data outside JSX.
- [x] `src/features/profile/hooks/useProfilePreferences.ts` -- load, persist, and expose selected language plus a switch handler -- keeps state logic out of UI.
- [x] `src/features/profile/components/SettingItem.tsx` -- pass accessibility metadata to the existing pressable row -- supports translated interactive labels without new components.
- [x] `src/features/profile/components/SettingsSections.tsx` -- render labels from current translations and wire the Language row to switch language -- implements the user-facing setting.
- [x] `src/features/profile/ProfileScreen.tsx` -- pass language preference props to settings sections -- connects state to UI.
- [x] `docs/ai-rules/PROJECT.md` -- update Profile section only if needed to note the implemented language setting -- keeps docs aligned without creating duplicate docs.

**Acceptance Criteria:**
- Given a signed-in user with no saved language, when Profile settings opens, then the settings screen uses English and the Language row shows English.
- Given a signed-in user on Profile settings, when they press Language & Region, then the language toggles between English and Vietnamese and visible Profile/settings labels update immediately.
- Given Vietnamese was selected previously, when the app/Profile screen reloads, then Profile settings renders Vietnamese labels without another tap.
- Given local storage contains an unsupported language code, when Profile settings opens, then it falls back to English without crashing.

## Verification

**Commands:**
- `npm run lint` -- expected: no lint errors from touched files.

## Suggested Review Order

**Preference Flow**

- Entry point wires persisted language state into settings UI.
  [`ProfileScreen.tsx:75`](../../src/features/profile/ProfileScreen.tsx#L75)

- Hook owns fallback, validation, switching, and local persistence.
  [`useProfilePreferences.ts:9`](../../src/features/profile/hooks/useProfilePreferences.ts#L9)

- Language row reuses existing settings UI and toggles EN/VI.
  [`SettingsSections.tsx:147`](../../src/features/profile/components/SettingsSections.tsx#L147)

**Copy And Accessibility**

- Supported language list and Profile copy stay feature-local.
  [`constants.ts:73`](../../src/features/profile/constants.ts#L73)

- Pressable rows now announce translated label plus current value.
  [`SettingItem.tsx:14`](../../src/features/profile/components/SettingItem.tsx#L14)

- Types keep language codes and row accessibility explicit.
  [`types.ts:37`](../../src/features/profile/types.ts#L37)

**Documentation**

- Profile docs note EN/VI local language setting.
  [`PROJECT.md:516`](../../docs/ai-rules/PROJECT.md#L516)
