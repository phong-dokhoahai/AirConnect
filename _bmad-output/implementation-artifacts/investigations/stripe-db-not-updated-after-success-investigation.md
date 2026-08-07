# Investigation: Stripe DB Not Updated After Success

## Hand-off Brief

1. **What happened.** User reports Stripe payment can finish and the app can reach success while database payment/fulfillment state is not updated.
2. **Where the case stands.** Confirmed source regression: current `stripe-payment` lost the webhook order-id fallbacks and REST update checks previously added in `b4f0034`.
3. **What's needed next.** Deploy the patched Supabase Edge Function and run one Stripe test payment or resend the latest webhook event.

## Case Info

| Field | Value |
| --- | --- |
| Ticket | N/A |
| Date opened | 2026-08-07 |
| Status | Concluded |
| System | AirConnect Stripe Checkout, Supabase Edge Function, Supabase orders/user_esims |
| Evidence sources | User report, source code, git history, prior investigations |

## Problem Statement

User reported in Vietnamese: Stripe payment flow is failing; after payment completes, the app shows success but the database is not updated. User also noted this had clearly been fixed and working before.

## Evidence Inventory

| Source | Status | Notes |
| --- | --- | --- |
| User report | Available | Payment success with missing DB update; prior fix reportedly regressed. |
| `supabase/functions/stripe-payment/index.ts` | Available | Current HEAD had weaker webhook handling than prior fixed commit. |
| Git history | Available | `b4f0034 fix bug payment` contained the missing hardening. |
| Prior investigations | Available | Existing reports document webhook/order status and missing eSIM fulfillment history. |
| Live Stripe/Supabase logs | Missing | Needed only to confirm production deployment/runtime after patch. |

## Confirmed Findings

### Finding 1: The current webhook had regressed to direct metadata-only order lookup

**Evidence:** `supabase/functions/stripe-payment/index.ts:185`

**Detail:** Before the fix in this working tree, the handler only read `object?.metadata?.orderId`. That misses Stripe event shapes where `orderId` is on the PaymentIntent metadata or where the Checkout Session id must be mapped back through `orders.provider_payment_id`.

### Finding 2: The current DB update had regressed to unchecked PATCH

**Evidence:** `supabase/functions/stripe-payment/index.ts:114`

**Detail:** Before the fix in this working tree, `updateOrder` awaited `fetch` but did not check `response.ok` or whether any row was returned. A failed update could be invisible to the function flow.

### Finding 3: Prior fixed commit had both missing protections

**Evidence:** `git diff b4f0034..HEAD -- supabase/functions/stripe-payment/index.ts`

**Detail:** The diff showed removal of `StripeEventObject`, `getOrderId`, `findOrderIdByProviderPaymentId`, `getPaymentIntentOrderId`, `response.ok` checks, and zero-row detection.

### Finding 4: Fulfillment still depends on the webhook update path

**Evidence:** `supabase/functions/stripe-payment/index.ts:199`, `supabase/functions/stripe-payment/index.ts:200`, `supabase/migrations/20260729003000_fulfill_paid_payment_order.sql:21`

**Detail:** The webhook marks the order `paid`, then calls `fulfill_paid_payment_order`; the database function refuses to fulfill unless the order status is already `paid`.

## Deduced Conclusions

### Deduction 1: The user's "fixed before" premise matches git history

**Based on:** Findings 1, 2, and 3

**Reasoning:** The exact missing logic exists in `b4f0034` and was absent from HEAD. The symptom is the same class documented in prior Stripe investigations.

**Conclusion:** This is a regression, not a brand-new flow requirement.

### Deduction 2: A successful UI return is not proof that DB fulfillment ran

**Based on:** Finding 4

**Reasoning:** Stripe redirects the user through `success_url`, but `orders.status` and `user_esims` are changed by the webhook path. If the webhook cannot resolve/update the order, the user can see success while DB remains pending/unfulfilled.

**Conclusion:** The fix belongs in the webhook handler, not the success screen.

## Source Code Trace

| Element | Detail |
| --- | --- |
| Error origin | `supabase/functions/stripe-payment/index.ts:185` webhook object parsing and `supabase/functions/stripe-payment/index.ts:114` order update |
| Trigger | Stripe sends `checkout.session.completed`, `payment_intent.succeeded`, or `charge.succeeded` after hosted checkout |
| Condition | Event lacks direct `data.object.metadata.orderId`, or REST PATCH fails/updates zero rows |
| Related files | `src/app/checkout.tsx`, `src/app/success.tsx`, `src/lib/purchaseQueries.ts`, `supabase/migrations/20260729003000_fulfill_paid_payment_order.sql` |

## Conclusion

**Confidence:** High

The root cause is a source regression in `supabase/functions/stripe-payment/index.ts`: webhook order resolution and DB update error detection were removed after the previous Stripe payment fix. The patch restores the prior hardening so payment events can resolve the order via direct metadata, PaymentIntent metadata, or stored Checkout Session id, and DB update failures are no longer silently ignored.

## Recommended Next Steps

### Fix direction

Deploy `stripe-payment` to Supabase, then resend a recent Stripe test webhook or run a fresh test checkout.

### Diagnostic

Check the affected order row after deploy:

```sql
select id, status, provider_payment_id, paid_at
from public.orders
where id = '<order-id>';
```

Then confirm fulfillment:

```sql
select id, order_id, status
from public.user_esims
where order_id = '<order-id>';
```

## Reproduction Plan

1. Sign in with Google.
2. Buy one plan with Stripe test card.
3. Capture `orderId` from the success URL/screen.
4. Confirm `orders.status = 'paid'`.
5. Confirm one `user_esims` row exists for that `order_id`.

## Side Findings

- `npm run lint` currently fails on an existing unrelated React hooks lint error in `src/app/(tabs)/home.tsx:151`.
