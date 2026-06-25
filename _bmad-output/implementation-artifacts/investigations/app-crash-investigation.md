# Investigation: app-crash

## Hand-off Brief

1. **What happened.** User reports the AirConnect app is crashing; current confirmed evidence shows the prior Expo web start failed because port 8081 was already in use.
2. **Where the case stands.** Active; Expo web has been restarted on port 8091 and needs a page load to collect runtime/bundle evidence.
3. **What's needed next.** Load the app and inspect Metro/browser output to identify the actual crash source.

## Case Info

| Field            | Value |
| ---------------- | ----- |
| Ticket           | N/A |
| Date opened      | 2026-06-19 |
| Status           | Active |
| System           | Windows PowerShell, Expo SDK 56 project, Expo web on localhost:8091 |
| Evidence sources | User report, .expo-web logs, Metro output, source code |

## Problem Statement

User-reported description: "App dang b? crash". Treating this as a hypothesis until runtime evidence confirms where and how it crashes.

## Evidence Inventory

| Source | Status | Notes |
| ------ | ------ | ----- |
| .expo-web.err.log | Available | Shows Expo could not prompt for alternate port in non-interactive mode after 8081 was occupied. |
| .expo-web.log | Available | Shows previous `expo start --web --port 8081` skipped dev server because port 8081 was used. |
| Current Metro session | Partial | Expo web started on port 8091; runtime page load pending. |
| Source code | Partial | Recent Home refactor files available for inspection. |

## Investigation Backlog

| # | Path to Explore | Priority | Status | Notes |
| - | --------------- | -------- | ------ | ----- |
| 1 | Load localhost:8091 and capture Metro/browser error | High | In Progress | Needed to confirm actual crash. |
| 2 | Inspect recent Home component imports/exports | High | Open | Recent refactor is plausible but unconfirmed. |
| 3 | Run TypeScript and targeted lint | Medium | Done | TypeScript and targeted Home ESLint passed earlier. |

## Timeline of Events

| Time | Event | Source | Confidence |
| ---- | ----- | ------ | ---------- |
| 2026-06-19 | Previous web start skipped because port 8081 was occupied. | .expo-web.log | Confirmed |
| 2026-06-19 | Expo web started on port 8091 and waited for requests. | Current Metro output | Confirmed |

## Confirmed Findings

### Finding 1: Prior web start did not launch the dev server

**Evidence:** `.expo-web.log:4`

**Detail:** The log states port 8081 was being used and Expo skipped the dev server.

## Deduced Conclusions

## Hypothesized Paths

### Hypothesis 1: The reported crash is caused by a recent Home refactor issue

**Status:** Open

**Theory:** A component import/export, route typing, or runtime rendering issue in `src/components/airconnect/home` crashes the app when the Home tab loads.

**Supporting indicators:** The user reported the crash after opening files created by the Home refactor.

**Would confirm:** Metro/browser stack trace points to `src/app/(tabs)/home.tsx` or `src/components/airconnect/home/*`.

**Would refute:** Runtime error points elsewhere, or Home renders successfully.

**Resolution:** Pending runtime evidence.

### Hypothesis 2: The perceived crash is actually a dev server startup failure from port collision

**Status:** Open

**Theory:** The app is unavailable because Expo web did not start on the expected port 8081.

**Supporting indicators:** Existing logs show port 8081 collision and skipped dev server.

**Would confirm:** App works on port 8091 with no runtime crash.

**Would refute:** App still crashes after successful server start on port 8091.

**Resolution:** Pending page load.

## Missing Evidence

| Gap | Impact | How to Obtain |
| --- | ------ | ------------- |
| Runtime stack trace | Identifies actual crashing module and condition | Load localhost:8091 and inspect Metro/browser output |

## Source Code Trace

| Element | Detail |
| ------- | ------ |
| Error origin | Pending |
| Trigger | Pending |
| Condition | Pending |
| Related files | Pending |

## Conclusion

**Confidence:** Low

The only confirmed issue so far is a previous Expo web startup failure caused by port 8081 being occupied. The app crash itself is not yet confirmed because runtime evidence is still pending.

## Recommended Next Steps

### Fix direction

Pending runtime evidence.

### Diagnostic

Load the app on port 8091 and collect Metro/browser errors.

## Reproduction Plan

1. Start Expo web on an unused port.
2. Open the Home route in a browser.
3. Capture Metro and browser console output.

## Side Findings

- Expo reports an available patch update from 56.0.11 to 56.0.12 during startup; this is not confirmed as related.

## Follow-up: 2026-06-19

### New Evidence

- Confirmed: `npx expo-doctor` initially failed because `react-native-svg` was missing, required by `lucide-react-native`.
- Confirmed: Expo SDK package validation initially reported patch mismatches for `@expo/ui`, `expo`, `expo-font`, and `expo-router`.
- Confirmed: Expo SDK 56 docs list `react-native-svg` bundled version `15.15.4` and installation via `npx expo install react-native-svg`.
- Confirmed: After installing `react-native-svg` and SDK patch versions, `npx expo-doctor` passed 21/21 checks.
- Confirmed: `npx tsc --noEmit` passed after the dependency fix.
- Confirmed: `npx expo export --platform web --output-dir dist-check-2` completed and exported `/home` successfully.
- Confirmed: A clean Expo web restart on port 8092 returned HTTP 200 for `/home`.
- Confirmed: A Metro watcher crash occurred only after installing dependencies while a dev server was still watching `node_modules`, with ENOENT under a temporary `.react-native-svg-*` folder.

### Additional Findings

- The strongest native-crash candidate was a missing native peer dependency: `react-native-svg`, used by `lucide-react-native` icons throughout the app.
- The prior port 8081 failure was a dev-server availability problem, not an app runtime crash.
- The watcher ENOENT was caused by changing `node_modules` while Metro was running; restarting Metro after install cleared that condition.

### Updated Hypotheses

- Hypothesis 1: Recent Home refactor caused a compile/render crash. Status: Refuted for web/static render. TypeScript, export, and `/home` HTTP verification pass.
- Hypothesis 2: Port collision caused perceived crash. Status: Partially confirmed as a dev-server startup issue, but not sufficient to explain native app crashes.
- Hypothesis 3: Missing `react-native-svg` caused native runtime crash when lucide icons render. Status: Confirmed as a project health defect by Expo Doctor; likely root cause for native crash outside Expo Go.

### Backlog Changes

- Done: Install `react-native-svg` via Expo-compatible version.
- Done: Patch Expo SDK package versions to expected SDK 56 patch releases.
- Done: Verify Expo Doctor, TypeScript, and web export.
- Open: If native still crashes, collect native device/simulator stack trace after a clean Metro restart.

### Updated Conclusion

**Confidence:** Medium-high

The confirmed project defect was a missing `react-native-svg` peer dependency required by `lucide-react-native`. This is a credible native crash root cause because the app renders lucide icons in the tab layout and Home components, while web can still render successfully. After installing the Expo SDK 56-compatible `react-native-svg@15.15.4` and patching Expo packages, Expo Doctor passes 21/21 and `/home` renders on a clean web server.
