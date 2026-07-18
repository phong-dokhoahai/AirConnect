---
title: 'Persist Purchased eSIMs'
type: 'feature'
created: '2026-07-18'
status: 'done'
baseline_commit: '251c23193366630fe67a1ecd5c341e05af98cf04'
context:
  - '{project-root}/docs/ai-rules/PROJECT.md'
  - '{project-root}/docs/ai-rules/api.md'
  - '{project-root}/docs/ai-rules/code.md'
---

<frozen-after-approval reason="human-owned intent - do not modify unless human renegotiates">

## Intent

**Problem:** Signed-in users can complete the current checkout demo, but no database record links the authenticated user to the purchased plan, so My eSIMs cannot show real purchases.

**Approach:** Add minimal Supabase purchase ownership tables, write a client-side demo purchase flow that creates a paid order and ready eSIM for the signed-in user, then load Success and My eSIMs from those persisted rows.

## Boundaries & Constraints

**Always:** Require an authenticated Supabase user before purchase creation. Keep catalog data in existing `esim_plans` tables and link purchases with `plan_id`. Use RLS so users can only read/create their own `orders` and `user_esims`. Preserve current Expo Router flow and current visual design.

**Ask First:** Integrating a real payment provider, storing payment card data, adding provider-issued QR/eSIM credentials, or changing Supabase Auth.

**Never:** Do not let the client mark arbitrary existing orders paid after creation. Do not expose another user's purchases. Do not keep rendering My eSIMs mock purchases once user purchase rows exist.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Signed-in purchase | Auth user completes checkout for active `planId` | App creates `orders` row with `paid` status, creates `user_esims` row with `ready` status, routes to success by `orderId` | If insert fails, keep user on checkout and show an inline error |
| Signed-out checkout | No auth session reaches checkout | Checkout shows Google sign-in gate and does not create rows | Google errors render in the sign-in gate |
| Missing plan | `planId` absent or inactive | Checkout shows existing unavailable state | No purchase mutation is attempted |
| Success by order | Success receives valid `orderId` for current user | Success shows persisted order/eSIM details and links to the purchased eSIM detail | If order/eSIM cannot load, show unavailable state |
| My eSIMs list | Signed-in user opens My eSIMs | Screen loads only that user's `user_esims`, supports loading/empty/error states, and renders persisted cards | Retry is available on load failure |

</frozen-after-approval>

## Code Map

- `supabase/migrations/*_create_product_catalog.sql` -- Current public catalog schema/RLS pattern to extend with ownership tables.
- `src/lib/auth.tsx` -- Existing auth store; supplies signed-in user/session for purchase gating.
- `src/lib/catalogQueries.ts` -- Existing Supabase query module; add purchase creation and owned eSIM queries here or a tiny adjacent `purchaseQueries.ts`.
- `src/lib/planDisplay.ts` -- Existing plan display formatter; reuse for checkout, success, and My eSIMs card data.
- `src/app/checkout.tsx` -- Complete Purchase entry point; replace demo route with persisted order/eSIM creation.
- `src/app/success.tsx` -- Post-purchase screen; load by `orderId` and display persisted delivery/order data.
- `src/app/(tabs)/my-esims.tsx` -- Owned eSIM list; replace mock `esims` array with query results for the signed-in user.
- `docs/ai-rules/PROJECT.md` -- Product source of truth; update implemented purchase persistence behavior.

## Tasks & Acceptance

**Execution:**
- [x] `supabase/migrations/20260718000000_create_purchase_ownership.sql` -- create `orders` and `user_esims` with FK links to `auth.users` and `esim_plans`, status checks, indexes, timestamps, own-row RLS read policies, and transactional demo purchase RPC.
- [x] `src/lib/catalogQueries.ts` or `src/lib/purchaseQueries.ts` -- add `createDemoPurchase(user, plan, traveler)` and `getUserEsims(userId)` / `getOrderWithEsim(orderId)` helpers using existing Supabase client.
- [x] `src/app/checkout.tsx` -- add purchase pending/error state, disable Complete Purchase while pending, create the persisted purchase, and route to `/success` with `orderId`.
- [x] `src/app/success.tsx` -- prefer `orderId`; load persisted order/eSIM data and keep a legacy `planId` fallback only if needed for existing route compatibility.
- [x] `src/app/(tabs)/my-esims.tsx` -- remove hardcoded `esims` data path for signed-in users, fetch owned eSIM rows, render loading/error/empty/list states, and keep signed-out Google CTA.
- [x] `docs/ai-rules/PROJECT.md` -- document that checkout creates a persisted purchased eSIM visible in My eSIMs.

**Acceptance Criteria:**
- Given a signed-in user and valid plan, when they complete checkout, then a row exists in `orders` and a linked row exists in `user_esims` for that same user and plan.
- Given a signed-in user completes checkout, when success opens, then it reads the persisted order/eSIM instead of trusting only route params.
- Given a signed-in user opens My eSIMs after purchase, then the purchased eSIM appears from Supabase data.
- Given a different signed-in user opens My eSIMs, then they cannot see another user's purchases.
- Given purchase creation is pending or fails, when the user taps Complete Purchase, then the button is disabled while pending and an error state is shown on failure.

## Spec Change Log

## Design Notes

This is a demo purchase persistence path, not real payment settlement. The safe demo boundary is one Supabase RPC that creates the paid `orders` row and ready `user_esims` row in the same transaction; real payment later replaces only that RPC/webhook boundary.

## Verification

**Commands:**
- `npm run lint` -- expected: no lint errors.
- `npx tsc --noEmit` -- expected: no TypeScript errors.
- `npx eslint "src/app/checkout.tsx" "src/app/success.tsx" "src/app/(tabs)/my-esims.tsx" "src/lib/purchaseQueries.ts" "src/components/airconnect/ui/Toast.tsx" "src/components/airconnect/ui/index.ts"` -- expected: no lint errors in changed files.
- `rg -n "const esims:|Japan.*Standard Plan|orderId" src/app/(tabs)/my-esims.tsx src/app/checkout.tsx src/app/success.tsx` -- expected: no signed-in mock list remains; checkout/success use `orderId`.

## Suggested Review Order

**Purchase Boundary**

- Start here: transactional RPC owns paid order and eSIM creation.
  [`20260718000000_create_purchase_ownership.sql:91`](../../supabase/migrations/20260718000000_create_purchase_ownership.sql#L91)

- Client calls the RPC instead of inserting ownership rows directly.
  [`purchaseQueries.ts:40`](../../src/lib/purchaseQueries.ts#L40)

- Checkout validates, shows pending/errors, toasts, then routes by order.
  [`checkout.tsx:141`](../../src/app/checkout.tsx#L141)

**Persisted Success**

- Success requires both persisted order and linked eSIM before rendering.
  [`success.tsx:69`](../../src/app/success.tsx#L69)

- Install route preserves plan detail compatibility while carrying eSIM identity.
  [`success.tsx:258`](../../src/app/success.tsx#L258)

**Owned eSIM List**

- Purchased cards use `user_esims.id` while keeping plan id separately.
  [`my-esims.tsx:128`](../../src/app/(tabs)/my-esims.tsx#L128)

- First fetch loading prevents signed-in users seeing fake empty state.
  [`my-esims.tsx:433`](../../src/app/(tabs)/my-esims.tsx#L433)

**Supporting UX**

- Shared toast satisfies API mutation feedback without native alerts.
  [`Toast.tsx:8`](../../src/components/airconnect/ui/Toast.tsx#L8)

