# Investigation: Stripe Success Missing Order And Esim

## Hand-off Brief

1. **What happened.** User reports Stripe test-card checkout shows payment success, but the purchased package is missing from database-backed eSIM/order lists.
2. **Where the case stands.** Source trace confirms Stripe payment creates a pending `orders` row before opening Stripe and webhook only marks that order paid; no Stripe path creates `user_esims`.
3. **What's needed next.** Add a fulfillment step for paid payment orders, then verify the deployed Supabase project and user id match the app session if order history remains empty.

## Case Info

| Field | Value |
| --- | --- |
| Ticket | N/A |
| Date opened | 2026-07-29 |
| Status | Active |
| System | AirConnect Expo app, Supabase Edge Functions, Stripe Checkout |
| Evidence sources | User report; `src/app/checkout.tsx`; `src/lib/payments.ts`; `src/lib/purchaseQueries.ts`; `supabase/functions/stripe-payment/index.ts`; `supabase/migrations/*` |

## Problem Statement

User reported in Vietnamese: "I used Stripe test cards from https://docs.stripe.com/testing. The UI displayed successful payment, but the database does not contain data for the purchased package, and the order list also has nothing."

## Evidence Inventory

| Source | Status | Notes |
| --- | --- | --- |
| User report | Available | Stripe test checkout UI shows success; database/list observations are reported but not independently queried. |
| Stripe checkout creation code | Available | `src/app/checkout.tsx` calls `createStripeCheckoutPayment` before opening hosted checkout. |
| Stripe Supabase function | Available | Creates pending order through RPC, then Stripe Checkout session, then webhook patches order status. |
| Purchase/order query code | Available | Order history reads `orders`; My eSIMs reads `user_esims`. |
| Live Supabase data/logs | Missing | Needed to confirm whether a row exists in the deployed database and whether webhook delivery succeeded. |

## Investigation Backlog

| # | Path to Explore | Priority | Status | Notes |
| - | - | - | - | - |
| 1 | Confirm deployed `orders` row by returned `orderId` | High | Open | Stripe Checkout URL cannot be returned unless local source path created a pending row, but deployed env may differ. |
| 2 | Add paid-order fulfillment for Stripe/SePay | High | Open | Current source has no payment-provider path that inserts `user_esims`. |
| 3 | Check Stripe webhook delivery and Supabase function secrets | Medium | Open | Needed if `orders.status` stays pending after payment. |
| 4 | Remove order-history silent timeout | Medium | Open | Current screen can show empty after 3s without surfacing slow query/error. |

## Timeline of Events

| Time | Event | Source | Confidence |
| --- | --- | --- | --- |
| 2026-07-29 | User used Stripe test card and saw successful payment UI | User report | Confirmed as report |
| 2026-07-29 | App opens Stripe hosted checkout after Supabase function returns `checkoutUrl` | `src/app/checkout.tsx:282`-`src/app/checkout.tsx:299` | Confirmed |
| 2026-07-29 | Stripe function creates pending order before creating Checkout Session | `supabase/functions/stripe-payment/index.ts:155` | Confirmed |
| 2026-07-29 | Stripe webhook marks order paid for `checkout.session.completed` | `supabase/functions/stripe-payment/index.ts:133` | Confirmed |

## Confirmed Findings

### Finding 1: Stripe checkout creation depends on a pending order RPC

**Evidence:** `src/app/checkout.tsx:282`, `src/lib/payments.ts:49`, `supabase/functions/stripe-payment/index.ts:155`

**Detail:** The checkout button invokes `stripe-payment` with action `create`; the Edge Function calls `create_pending_payment_order` and only then creates a Stripe Checkout Session.

### Finding 2: Pending payment orders do not create eSIM ownership rows

**Evidence:** `supabase/migrations/20260726001000_fix_pending_payment_currency.sql:51`, `supabase/migrations/20260718000000_create_purchase_ownership.sql:159`

**Detail:** `create_pending_payment_order` inserts into `orders` only. The only confirmed insert into `user_esims` is inside `create_demo_purchase`, not the Stripe/SePay payment path.

### Finding 3: Stripe webhook only updates the order

**Evidence:** `supabase/functions/stripe-payment/index.ts:89`, `supabase/functions/stripe-payment/index.ts:133`

**Detail:** On `checkout.session.completed`, the function calls `updateOrder(orderId, "paid", object?.id)`. No fulfillment call or `user_esims` insert follows.

### Finding 4: Order history can show empty when the query is merely slow

**Evidence:** `src/features/profile/components/TransactionHistoryScreen.tsx:35`, `src/features/profile/components/TransactionHistoryScreen.tsx:79`

**Detail:** The screen races `getUserOrders` against a 3000ms timeout. Timeout sets `orders` to `[]` with no error, so a slow query is rendered as empty history.

## Deduced Conclusions

### Deduction 1: Missing purchased package/eSIM is explained by source code

**Based on:** Findings 2 and 3

**Reasoning:** My eSIMs reads `user_esims`; Stripe payment completion never inserts `user_esims`; therefore a successful Stripe payment can still leave My eSIMs empty.

**Conclusion:** The missing purchased package is a confirmed implementation gap, not a Stripe test-card issue.

### Deduction 2: Completely missing orders needs live data confirmation

**Based on:** Findings 1 and 4

**Reasoning:** Source requires pending order creation before a checkout URL is returned, but the order list can silently show empty on timeout and live deployment can differ from local source.

**Conclusion:** "No order exists" is still unconfirmed without querying the deployed `orders` table by returned `orderId` or checking Supabase function logs.

## Hypothesized Paths

### Hypothesis 1: Stripe purchase is paid but unfulfilled

**Status:** Confirmed

**Theory:** Stripe session completed, webhook updated `orders.status`, but no `user_esims` row was created.

**Supporting indicators:** There is no Stripe fulfillment path in source.

**Would confirm:** A paid `orders` row with no matching `user_esims` row.

**Would refute:** A matching `user_esims` row exists in deployed database.

**Resolution:** Confirmed by source trace; live data would confirm whether the user's exact transaction reached paid.

### Hypothesis 2: Order history is falsely empty because the query timed out

**Status:** Open

**Theory:** `orders` exists, but the 3-second race returns `null` and renders empty.

**Supporting indicators:** The screen intentionally sets `orders` empty when the timeout wins.

**Would confirm:** Supabase has the order while app history shows empty after a slow query.

**Would refute:** The deployed `orders` table has no row for the Stripe-created `orderId`.

**Resolution:** Pending live data check.

## Missing Evidence

| Gap | Impact | How to Obtain |
| --- | --- | --- |
| Stripe Checkout Session id or app-returned `orderId` | Confirms whether a pending order was created and which row to inspect | Copy `orderId` from success URL/logs or Stripe session metadata. |
| Supabase Edge Function logs for `stripe-payment` | Confirms webhook delivery and update errors | Check Supabase logs around the test payment time. |
| Deployed database row for `orders.id = orderId` | Resolves whether order is absent, pending, paid, or hidden by UI/RLS | Query Supabase SQL editor or table editor. |

## Source Code Trace

| Element | Detail |
| --- | --- |
| Error origin | Fulfillment missing after `checkout.session.completed` in `supabase/functions/stripe-payment/index.ts:133` |
| Trigger | User completes Stripe Checkout from `src/app/checkout.tsx:299` |
| Condition | Payment-provider flow creates `orders` pending, webhook updates status, no code inserts `user_esims` |
| Related files | `src/lib/payments.ts`, `src/lib/purchaseQueries.ts`, `src/features/profile/components/TransactionHistoryScreen.tsx`, purchase/payment migrations |

## Conclusion

**Confidence:** Medium

The missing eSIM/package is confirmed from source: Stripe payment completion does not create `user_esims`. The claim that the order is absent from the database is not fully confirmed because local source creates a pending order before Stripe opens, and the order-history UI can display empty on timeout.

## Recommended Next Steps

### Fix direction

Add one database-side fulfillment function that inserts `user_esims` for a paid order, call it from Stripe webhook after marking paid, and reuse it for SePay if immediate post-payment fulfillment is intended.

### Diagnostic

Check the deployed Supabase `orders` table by Stripe session metadata `orderId`; if no row exists, verify the app and function are pointed at the same Supabase project and the latest migrations/functions are deployed.

## Reproduction Plan

1. Sign in with Google.
2. Buy a plan with Stripe test card `4242 4242 4242 4242`.
3. Capture `orderId` from the success URL.
4. Query `orders` and `user_esims` by that `orderId`.
5. Expected current source result: `orders` exists as `pending` or `paid`; `user_esims` is absent.

## Side Findings

- `docs/ai-rules/PROJECT.md` currently says payment webhooks must not create/unlock purchased products; a separate fulfillment service is expected but absent in source.
