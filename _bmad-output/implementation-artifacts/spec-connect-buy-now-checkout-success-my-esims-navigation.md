---
title: 'Connect Buy Now Checkout Success My eSIMs Navigation'
type: 'feature'
created: '2026-06-29'
status: 'done'
route: 'one-shot'
---

# Connect Buy Now Checkout Success My eSIMs Navigation

## Intent

**Problem:** The purchase demo flow had visible dead ends: Buy Now only showed an alert, checkout did not continue to success, and My eSIMs detail/browse actions were TODOs.

**Approach:** Wire the existing Expo Router screens together with route params, reusing the current local plan fixtures for selected-plan continuity while leaving backend payment/order creation out of scope.

## Suggested Review Order

**Purchase Handoff**

- Buy Now now opens checkout with the selected plan id.
  [`[id].tsx:1`](../../src/app/plan/[id].tsx#L1)

- Checkout reads the incoming plan id, renders selected-plan copy from fixtures, and replaces to success after local validation.
  [`checkout.tsx:1`](../../src/app/checkout.tsx#L1)

**Post-Purchase Navigation**

- Success reads plan/email params, shows the submitted email, and routes Install eSIM to the eSIM details screen.
  [`success.tsx:1`](../../src/app/success.tsx#L1)

**My eSIMs Entrypoints**

- My eSIMs View Details and empty Browse Plans actions now navigate through Expo Router.
  [`my-esims.tsx:1`](../../src/app/(tabs)/my-esims.tsx#L1)

- Profile quick action now targets the tab route for My eSIMs.
  [`profile.tsx:1`](../../src/app/(tabs)/profile.tsx#L1)
