# Investigation: Checkout Payment UI

## Hand-off Brief

1. **What happened.** SePay checkout does not show bank-account selection because the frontend only receives a payment code and shows a toast, while Stripe opens the returned checkout URL in an in-app browser/web view.
2. **Where the case stands.** Root cause is confirmed from `src/app/checkout.tsx`, `src/lib/payments.ts`, Supabase functions, and payment migrations.
3. **What's needed next.** Decide the intended provider behavior: render a local SePay transfer panel, or return/open a provider checkout URL.

## Case Info

| Field | Value |
| --- | --- |
| Ticket | N/A |
| Date opened | 2026-07-26 |
| Status | Concluded |
| System | AirConnect Expo app |
| Evidence sources | `src/app/checkout.tsx`, `src/lib/payments.ts`, `supabase/functions/*`, `supabase/migrations/*` |

## Problem Statement

User reported:

- SePay payment does not show UI for selecting payment account.
- Stripe payment shows account selection on the website and does not open inside the app.

## Confirmed Findings

### Finding 1: SePay frontend only creates a pending order and shows a toast

**Evidence:** `src/app/checkout.tsx:206`, `src/app/checkout.tsx:220`

**Detail:** The SePay branch calls `createSepayPendingPayment(paymentInput)` and then sets `checkout.sepayPending` with `data.paymentCode`. It does not navigate, open a URL, or render bank account data.

### Finding 2: SePay API response has no bank account or payment URL

**Evidence:** `src/lib/payments.ts:35`, `supabase/functions/sepay-payment/index.ts:144`

**Detail:** The typed response contains `orderId`, `amount`, `currency`, and `paymentCode` only. The Supabase function returns exactly those fields.

### Finding 3: Database payment intent stores only the provider payment code

**Evidence:** `supabase/migrations/20260726000000_create_payment_intents.sql:93`, `supabase/migrations/20260726000000_create_payment_intents.sql:95`

**Detail:** `create_pending_payment_order` builds an `AC...` payment code and stores it in `provider_payment_id`. No bank account, QR URL, or account-selection metadata is modeled.

### Finding 4: Stripe intentionally opens a hosted checkout URL

**Evidence:** `src/app/checkout.tsx:181`, `src/app/checkout.tsx:198`, `supabase/functions/stripe-payment/index.ts:196`

**Detail:** The Stripe branch calls `createStripeCheckoutPayment`, requires `checkoutUrl`, then calls `WebBrowser.openBrowserAsync(payment.data.checkoutUrl)`. The Stripe function creates a Checkout Session and returns `checkoutUrl`.

## Conclusion

**Confidence:** High

The current behavior matches the implementation. SePay has no UI because the app/backend do not provide or render account-selection/bank-transfer details. Stripe opens Stripe-hosted checkout because the implementation uses Stripe Checkout Session URL via `WebBrowser.openBrowserAsync`.

## Recommended Next Steps

### Fix direction

For SePay, add the minimum missing contract: return static configured bank transfer fields or QR info from `sepay-payment`, extend `SepayPaymentResponse`, then render those fields in `checkout.tsx`.

For Stripe, if the expected behavior is "external app/browser" instead of in-app browser, replace `openBrowserAsync` with platform linking for the checkout URL. If the expected behavior is "native app payment sheet", this needs a different Stripe integration, not the current hosted Checkout Session flow.

### Documentation Impact

No product docs were changed. This investigation file documents the current diagnosis.
