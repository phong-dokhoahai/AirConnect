# Investigation: Stripe Current Payment Flow

## Hand-off Brief

1. **What happened.** Confirmed: Stripe checkout starts from the mobile checkout screen, creates a pending `orders` row via Supabase Edge Function, opens Stripe Checkout, then relies on Stripe webhook to mark paid and fulfill the eSIM.
2. **Where the case stands.** Concluded for source-code flow; no runtime Stripe/Supabase logs were inspected.
3. **What's needed next.** If production behavior differs, inspect deployed Edge Function version and Stripe webhook delivery logs.

## Case Info

| Field | Value |
| --- | --- |
| Ticket | N/A |
| Date opened | 2026-07-31 |
| Status | Concluded |
| System | AirConnect local source, Supabase Edge Functions |
| Evidence sources | `src/app/checkout.tsx`, `src/lib/payments.ts`, `supabase/functions/stripe-payment/index.ts`, Supabase migrations, `src/app/success.tsx`, docs |

## Problem Statement

User asked: "Luồng thanh toán stripe hiện tại là gì?"

## Evidence Inventory

| Source | Status | Notes |
| --- | --- | --- |
| Checkout UI | Available | Stripe branch creates payment and opens checkout URL. |
| Payment client wrapper | Available | Invokes `stripe-payment` Edge Function. |
| Stripe Edge Function | Available | Handles create action and Stripe webhook events. |
| Database migrations | Available | Define pending order creation and paid-order fulfillment. |
| Runtime logs | Missing | Needed only to verify deployed behavior. |

## Confirmed Findings

### Finding 1: Checkout calls Stripe payment creation

**Evidence:** `src/app/checkout.tsx:282`, `src/app/checkout.tsx:299`

**Detail:** When `selectedPayment === "stripe"`, the app calls `createStripeCheckoutPayment`, then opens `payment.data.checkoutUrl` in the browser.

### Finding 2: Client wrapper invokes Supabase Edge Function

**Evidence:** `src/lib/payments.ts:48`

**Detail:** `createStripeCheckoutPayment` invokes `supabase.functions.invoke("stripe-payment")` with `action: "create"`.

### Finding 3: Edge Function creates pending order before Stripe session

**Evidence:** `supabase/functions/stripe-payment/index.ts:171`, `supabase/functions/stripe-payment/index.ts:190`, `supabase/migrations/20260726001000_fix_pending_payment_currency.sql:51`

**Detail:** The Edge Function calls `create_pending_payment_order`, which inserts an `orders` row with status `pending`, then creates a Stripe Checkout Session.

### Finding 4: Stripe session carries order metadata and redirects with orderId

**Evidence:** `supabase/functions/stripe-payment/index.ts:203`, `supabase/functions/stripe-payment/index.ts:205`, `supabase/functions/stripe-payment/index.ts:215`

**Detail:** The session success/cancel URLs include `orderId`; Stripe metadata also includes `orderId`.

### Finding 5: Webhook marks paid and fulfills eSIM

**Evidence:** `supabase/functions/stripe-payment/index.ts:151`, `supabase/functions/stripe-payment/index.ts:153`, `supabase/migrations/20260729003000_fulfill_paid_payment_order.sql:25`

**Detail:** On `checkout.session.completed`, the webhook updates the order to `paid` and calls `fulfill_paid_payment_order`, which inserts `user_esims` idempotently.

## Deduced Conclusions

### Deduction 1: Stripe flow is asynchronous after browser handoff

**Based on:** Findings 1, 4, and 5.

**Reasoning:** The app opens Stripe Checkout and shows "pending"; final state is driven by Stripe webhook, not by the immediate return from `openBrowserAsync`.

**Conclusion:** A user can land on success before the webhook has completed; success screen may show pending/awaiting fulfillment until database rows update.

## Source Code Trace

| Element | Detail |
| --- | --- |
| Entry point | `src/app/checkout.tsx:282` |
| Client wrapper | `src/lib/payments.ts:48` |
| Create order | `supabase/functions/stripe-payment/index.ts:171` |
| Create Stripe session | `supabase/functions/stripe-payment/index.ts:190` |
| Paid webhook | `supabase/functions/stripe-payment/index.ts:151` |
| Fulfillment | `supabase/migrations/20260729003000_fulfill_paid_payment_order.sql:25` |
| Success display | `src/app/success.tsx:67`, `src/app/success.tsx:181` |

## Conclusion

**Confidence:** High for local source flow.

The current Stripe flow is: checkout screen -> Supabase `stripe-payment` create action -> pending `orders` row -> Stripe Checkout Session -> browser handoff -> Stripe webhook -> order status `paid` -> `user_esims` fulfillment -> success screen reads order/eSIM by `orderId`.

## Missing Evidence

| Gap | Impact | How to Obtain |
| --- | --- | --- |
| Deployed Edge Function version | Confirms production matches local source | Check Supabase function deployment/logs. |
| Stripe webhook logs | Confirms live webhook delivery | Check Stripe dashboard event delivery. |
