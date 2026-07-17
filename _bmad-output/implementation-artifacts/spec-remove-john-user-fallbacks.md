---
title: 'Remove John User Fallbacks'
type: 'bugfix'
created: '2026-07-17'
status: 'done'
route: 'one-shot'
---

# Remove John User Fallbacks

## Intent

**Problem:** Checkout, success, and home header still exposed fake "John" identity data after Google login became the app identity source.

**Approach:** Reuse the existing auth/profile helpers for signed-in user display data, and replace hard-coded John fallbacks with neutral copy when no authenticated user/email is available.

## Suggested Review Order

**Auth Identity Binding**

- Home entry point now passes Google profile data into the header.
  [`home.tsx:36`](../../src/app/%28tabs%29/home.tsx#L36)

- Header renders caller-provided name and initials instead of John.
  [`HomeHeader.tsx:5`](../../src/components/airconnect/home/HomeHeader.tsx#L5)

**Checkout Delivery Identity**

- Checkout uses auth profile/email as submit fallback without extra state effects.
  [`checkout.tsx:123`](../../src/app/checkout.tsx#L123)

- Checkout placeholders are neutral or real auth values, never John examples.
  [`checkout.tsx:228`](../../src/app/checkout.tsx#L228)

**Success Delivery Copy**

- Success removes the John email default and falls back to auth email.
  [`success.tsx:66`](../../src/app/success.tsx#L66)
