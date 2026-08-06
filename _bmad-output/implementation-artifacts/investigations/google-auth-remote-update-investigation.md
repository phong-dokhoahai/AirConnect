# Investigation: Google auth remote update failure

## Hand-off Brief

1. **What happened.** User reports that after Google sign-in the Android app shows `java.IOException: fail to download remote update`; local source shows Google auth returns through the `airconnect://auth/callback` deep link.
2. **Where the case stands.** Active; evidence points to Expo Updates native metadata being present in Android while app config has no `updates.url`.
3. **What's needed next.** Apply the minimal Expo Updates config cleanup, rebuild Android, and capture Logcat if the native error remains.

## Case Info

| Field | Value |
| --- | --- |
| Ticket | N/A |
| Date opened | 2026-08-06 |
| Status | Active |
| System | Android Expo/React Native app in `C:\Projects\AirConnect` |
| Evidence sources | User report, local source, Expo config, Android manifest, version control |

## Problem Statement

User reports: "khi tôi đăng nhập google xong thì app báo java.IOException: fail to download remote update".

## Evidence Inventory

| Source | Status | Notes |
| --- | --- | --- |
| User report | Partial | Exact error text available; no Logcat stack trace yet. |
| Google auth source | Available | `src/lib/auth.tsx` uses Supabase OAuth and `WebBrowser.openAuthSessionAsync`. |
| Expo app config | Available | `app.json` has `scheme: "airconnect"` and no `updates` block. |
| Android manifest | Available | Manifest contains Expo Updates metadata including `ENABLED=false` and `CHECK_ON_LAUNCH=ALWAYS`. |
| Expo config plugin source | Available | Local plugin source shows default update check mode is `ALWAYS`, while update URL is removed when absent. |
| Version control | Available | Commit `baaca1f` introduced Google auth callback config; it did not add OTA update config. |

## Investigation Backlog

| # | Path to Explore | Priority | Status | Notes |
| - | --- | --- | --- | --- |
| 1 | Confirm built APK manifest matches local Android manifest | High | Open | Requires device/APK or Gradle manifest inspection after rebuild. |
| 2 | Capture full Android Logcat stack trace | High | Open | Needed to confirm exact native module throwing `IOException`. |
| 3 | Rebuild after adding explicit `updates.checkAutomatically: "NEVER"` or regenerating native project | High | Open | Confirms stale/default Updates metadata is the trigger. |

## Timeline of Events

| Time | Event | Source | Confidence |
| --- | --- | --- | --- |
| 2026-07-17 | Google auth support added, including native redirect and `expo-web-browser` plugin. | `git show baaca1f` | Confirmed |
| Unknown | User signs in with Google and app returns through `airconnect://auth/callback`. | `src/lib/auth.tsx:20`, `android/app/src/main/AndroidManifest.xml:28` | Deduced |
| Unknown | Android reports remote update download failure. | User report | Confirmed |

## Confirmed Findings

### Finding 1: Google auth uses a native deep link callback

**Evidence:** `src/lib/auth.tsx:20`, `src/lib/auth.tsx:37`, `src/lib/auth.tsx:155`, `android/app/src/main/AndroidManifest.xml:28`

**Detail:** The app opens a Supabase Google OAuth URL in `WebBrowser.openAuthSessionAsync`, then receives the callback on the `airconnect` scheme.

### Finding 2: The app config does not configure OTA updates

**Evidence:** `app.json:8`, `app.json:27`, `app.json:42`

**Detail:** `app.json` defines the app scheme and plugins, but the scan found no `expo.updates.url`, `runtimeVersion`, or explicit update policy.

### Finding 3: Android native manifest contains Expo Updates metadata

**Evidence:** `android/app/src/main/AndroidManifest.xml:15`, `android/app/src/main/AndroidManifest.xml:17`, `android/app/src/main/AndroidManifest.xml:18`

**Detail:** The manifest has `expo.modules.updates.ENABLED=false`, `EXPO_UPDATES_CHECK_ON_LAUNCH=ALWAYS`, and launch wait `0`.

### Finding 4: Expo config plugin defaults update checks to ALWAYS

**Evidence:** `node_modules/@expo/config-plugins/build/utils/Updates.js:186`, `node_modules/@expo/config-plugins/build/utils/Updates.js:200`

**Detail:** If no explicit `updates.checkAutomatically` is configured, the plugin returns `ALWAYS`.

## Deduced Conclusions

### Deduction 1: The Google login is probably the trigger point, not the update downloader

**Based on:** Findings 1, 2, 3, 4.

**Reasoning:** The JS auth flow contains no Expo Updates API calls. Returning from Google auth through the deep link can foreground or relaunch the Android activity, which is when native launch/update behavior is likely to surface. The native manifest contains update-check metadata even though the JS/app config does not intentionally use OTA.

**Conclusion:** The reported timing after Google login is consistent with a native app resume/relaunch exposing an Expo Updates configuration problem.

## Hypothesized Paths

### Hypothesis 1: Stale/default Expo Updates native metadata causes an attempted remote update check after auth callback

**Status:** Open

**Theory:** Android is attempting a remote update check during launch/resume because `CHECK_ON_LAUNCH=ALWAYS` is present, but no valid OTA setup exists for this project/build, causing the `IOException`.

**Supporting indicators:** Manifest has Updates metadata; app config has no OTA URL; auth flow itself does not download updates.

**Would confirm:** Logcat stack points to `expo.modules.updates` during or after `airconnect://auth/callback`, or the error disappears after disabling update checks/regenerating manifest.

**Would refute:** Logcat stack points to Supabase/network code or Google Play Services rather than Expo Updates.

**Resolution:** Open.

## Missing Evidence

| Gap | Impact | How to Obtain |
| --- | --- | --- |
| Full Logcat stack trace | Confirms exact Java class throwing the `IOException`. | `adb logcat` while reproducing Google sign-in. |
| Built APK merged manifest | Confirms what metadata is actually shipped to the device. | Inspect build intermediates or decompile installed APK. |

## Source Code Trace

| Element | Detail |
| --- | --- |
| Error origin | Hypothesized native Expo Updates module; exact class needs Logcat. |
| Trigger | Return from `WebBrowser.openAuthSessionAsync` via `airconnect://auth/callback`. |
| Condition | Android manifest carries update-check metadata without intentional OTA update config. |
| Related files | `src/lib/auth.tsx`, `app.json`, `android/app/src/main/AndroidManifest.xml`, `node_modules/@expo/config-plugins/build/utils/Updates.js` |

## Conclusion

**Confidence:** Medium

The evidence does not show Google auth downloading a remote update. It shows Google auth can relaunch/foreground the app through a deep link, while Android contains Expo Updates launch-check metadata that is not backed by an explicit update URL/runtime policy in `app.json`.

## Recommended Next Steps

### Fix direction

Add explicit `expo.updates.checkAutomatically: "NEVER"` for this non-OTA app or regenerate native Android config so stale/default Updates metadata stops requesting remote updates. Rebuild the Android app after changing config.

### Diagnostic

Capture Logcat if the error persists after rebuild; the stack trace should confirm whether `expo.modules.updates` is still involved.

## Reproduction Plan

1. Build/install Android app.
2. Start app signed out.
3. Tap Google sign-in.
4. Complete OAuth and return to `airconnect://auth/callback`.
5. Observe whether native update error appears.

## Side Findings

- `expo-updates` is not listed as a direct dependency in `package.json`, but Expo config plugin history still reports an unversioned `expo-updates` plugin during `npx expo config --type prebuild`.

## Follow-up: 2026-08-06

### New Evidence

### Additional Findings

### Updated Hypotheses

### Backlog Changes

### Updated Conclusion
