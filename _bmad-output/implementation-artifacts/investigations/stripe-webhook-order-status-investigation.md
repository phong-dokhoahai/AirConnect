# Investigation: Stripe Webhook Does Not Save Order Payment Status

## Hand-off Brief

1. **What happened.** User reports Stripe payment completes and webhook is returned, but the order payment status is not persisted in the database.
2. **Where the case stands.** Source shows the intended update path exists; the highest-probability gaps are deployment/runtime: Supabase JWT verification for an external Stripe webhook, old deployed function code swallowing PATCH errors, or webhook event/object not carrying `metadata.orderId`.
3. **What's needed next.** Check Stripe event delivery HTTP status/body and Supabase Edge Function logs for the exact payment time.

## Case Info

| Field | Value |
| --- | --- |
| Ticket | N/A |
| Date opened | 2026-07-31 |
| Status | Active |
| System | AirConnect Stripe payment flow, Supabase Edge Function |
| Evidence sources | User report, `supabase/functions/stripe-payment/index.ts`, `README.md`, git history, migrations |

## Problem Statement

User asked why Stripe payment completion has a webhook return, but the database does not save the payment status on the order.

## Evidence Inventory

| Source | Status | Notes |
| --- | --- | --- |
| Local Stripe function source | Available | Current source updates order on `checkout.session.completed`. |
| Deployment instructions | Available | README deploy command does not show `--no-verify-jwt`. |
| Git history | Available | Previous function version ignored failed PATCH responses. |
| Stripe delivery logs | Missing | Needed to confirm HTTP status and response body. |
| Supabase function deployment metadata | Available | `stripe-payment` is ACTIVE version 7 with `verify_jwt: true`. |
| Supabase function logs | Missing | Supabase CLI 2.110.0 exposes list/delete/download/deploy/new/serve, not logs. |

## Confirmed Findings

### Finding 1: Current source only updates DB for completed checkout sessions with metadata orderId

**Evidence:** `supabase/functions/stripe-payment/index.ts:149`, `supabase/functions/stripe-payment/index.ts:151`

**Detail:** The handler reads `object?.metadata?.orderId`; it calls `updateOrder(orderId, "paid", object?.id)` only when `orderId` exists and `event.type === "checkout.session.completed"`.

### Finding 2: The update writes status and paid_at through Supabase REST

**Evidence:** `supabase/functions/stripe-payment/index.ts:104`, `supabase/functions/stripe-payment/index.ts:113`, `supabase/functions/stripe-payment/index.ts:120`

**Detail:** `updateOrder` PATCHes `orders?id=eq.${orderId}` with `status`, `provider_payment_id`, and `paid_at`; current source throws on non-OK responses.

### Finding 3: Stripe Checkout Session creation sets orderId metadata

**Evidence:** `supabase/functions/stripe-payment/index.ts:203`, `supabase/functions/stripe-payment/index.ts:205`

**Detail:** The create path includes `success_url` with `orderId` and `metadata[orderId]`.

### Finding 4: README deploy command does not disable Supabase JWT verification

**Evidence:** `README.md:28`

**Detail:** The documented deploy command is `supabase functions deploy stripe-payment`. No repo config was found that disables JWT verification for this function.

### Finding 5: Previous deployed code could return success while DB update failed

**Evidence:** `git show HEAD -- supabase/functions/stripe-payment/index.ts`

**Detail:** Commit `eedad83` changed `updateOrder` from an unchecked `fetch` to checking `response.ok`. If production still runs the previous function, failed REST updates can be silently ignored and the webhook can still return `{ received: true }`.

### Finding 6: Deployed stripe-payment currently has JWT verification enabled

**Evidence:** `supabase functions list` output on 2026-07-31.

**Detail:** The deployed function metadata reports `slug: stripe-payment`, `status: ACTIVE`, `version: 7`, `updated_at: 2026-07-31 07:52:20 UTC`, and `verify_jwt: true`.

## Hypothesized Paths

### Hypothesis 1: Stripe webhook is blocked by Supabase JWT verification

**Status:** Open

**Theory:** The deployed function requires Supabase JWT. Stripe sends no app JWT, so the request is rejected before the handler updates `orders`.

**Supporting indicators:** README deploy command lacks `--no-verify-jwt`; no `supabase/config.toml` override exists in the repo.

**Would confirm:** Stripe event delivery shows 401/403, or Supabase logs show JWT/auth rejection. Deployment metadata already confirms `verify_jwt: true`.

**Would refute:** Stripe delivery shows 200 from handler body `{ "received": true }` and Supabase logs show handler execution.

### Hypothesis 2: Production is still running old function code

**Status:** Open

**Theory:** The deployed `stripe-payment` is older than commit `eedad83`; failed REST PATCH responses are swallowed.

**Supporting indicators:** Git history shows the old code did not check PATCH response status.

**Would confirm:** Deployed source/log behavior lacks the `response.ok` error path or latest function deploy has not been run.

**Would refute:** Supabase function logs show current error throwing code from `eedad83`.

### Hypothesis 3: Webhook event does not carry the expected orderId path

**Status:** Open

**Theory:** Handler receives a Stripe event, but `event.data.object.metadata.orderId` is empty or the event type is not `checkout.session.completed`, so it returns `{ received: true }` without updating DB.

**Supporting indicators:** Current code intentionally no-ops when `orderId` is missing or event type differs.

**Would confirm:** Supabase logs or captured event payload show missing `metadata.orderId` or a different event type.

**Would refute:** Payload shows `type=checkout.session.completed` and `data.object.metadata.orderId=<existing order id>`.

## Source Code Trace

| Element | Detail |
| --- | --- |
| Webhook entry | `supabase/functions/stripe-payment/index.ts:132` |
| Signature verification | `supabase/functions/stripe-payment/index.ts:133` |
| Required metadata | `supabase/functions/stripe-payment/index.ts:149` |
| Paid branch | `supabase/functions/stripe-payment/index.ts:151` |
| DB PATCH | `supabase/functions/stripe-payment/index.ts:104` |
| Fulfillment after paid | `supabase/functions/stripe-payment/index.ts:153` |

## Conclusion

**Confidence:** Medium after re-check.

Production `stripe-payment` was rechecked after the user's change and now has `verify_jwt: false` on version 8. JWT is no longer the active blocker. The next strongest source finding is that the deployed handler returns success for ignored event types or missing `metadata.orderId`, so Stripe can show delivery success while no database update runs.

## Recommended Next Steps

### Diagnostic

1. In Stripe Dashboard, open the delivered webhook event and check HTTP status/body.
2. In Supabase Edge Function logs for `stripe-payment`, check whether the handler logged/errored at that timestamp.
3. Confirm latest code was deployed after commit `eedad83`.
4. Confirm the delivered Stripe event type is `checkout.session.completed`, not only `payment_intent.succeeded`.
5. Deploy the local hardening patch in `supabase/functions/stripe-payment/index.ts`, then resend the Stripe webhook event.

## Follow-up: 2026-07-31

### New Evidence

- `supabase functions list --output json` reports `stripe-payment` version 8 with `verify_jwt: false`.
- Current deployed/local handler only updates DB for `checkout.session.completed` with `data.object.metadata.orderId`; otherwise it returns a successful response without changing DB.

### Additional Findings

- Local patch prepared in `supabase/functions/stripe-payment/index.ts`:
  - returns 400 for payment-related events missing `orderId`,
  - detects PATCH requests that update zero `orders` rows,
  - adds `payment_intent_data.metadata.orderId` for newly created Stripe PaymentIntents,
  - handles `payment_intent.succeeded` when metadata is present.

### Updated Conclusion

JWT was confirmed fixed. The remaining likely cause is webhook payload mismatch: Stripe may be delivering an event type the function ignores, or a payment-related object without the expected `metadata.orderId`.

## Follow-up: 2026-07-31 #2

### New Evidence

- Deployed `stripe-payment` with the local hardening patch using `supabase functions deploy stripe-payment --project-ref kcuexslfkdzwwhtzfwro --no-verify-jwt --use-api`.
- `supabase functions list --output json` reports `stripe-payment` ACTIVE version 9 with `verify_jwt: false`.

### Updated Conclusion

The live function now fails visibly for payment events missing `orderId`, detects zero-row order updates, supports `payment_intent.succeeded` when metadata exists, and sets PaymentIntent metadata for newly created Stripe Checkout Sessions.

## Follow-up: 2026-07-31 #3

### New Evidence

- Remote DB read-only query showed 20 Stripe orders and all are still `pending`.
- Latest Stripe orders after version 9 deploy still have `provider_payment_id` values like `AC...`, so the webhook has not reached a successful `updateOrder` call.

### Additional Findings

- JWT is no longer the blocker: deployed `stripe-payment` remains version 9 with `verify_jwt: false`.
- A second local patch is prepared but not deployed:
  - stores Stripe Checkout Session id on the order immediately after session creation,
  - falls back from `checkout.session.completed` object id to `orders.provider_payment_id`,
  - handles `charge.succeeded` by fetching PaymentIntent metadata from Stripe.

### Updated Conclusion

The database evidence shows the update path is still not being hit. The most likely remaining causes are webhook event type mismatch (`charge.succeeded` or another non-handled event), missing metadata on the delivered event, or Stripe endpoint configuration pointing at a different event/URL than expected.

## Follow-up: 2026-07-31 #4

### New Evidence

- Attempted to inspect Stripe locally, but Stripe CLI/config is unavailable on this machine (`~/.stripe` does not exist).
- Confirmed app/project target from `.env`: `EXPO_PUBLIC_SUPABASE_URL=https://kcuexslfkdzwwhtzfwro.supabase.co`.
- Confirmed Supabase linked project ref: `kcuexslfkdzwwhtzfwro`.

### Missing Evidence

| Gap | Impact | How to Obtain |
| --- | --- | --- |
| Stripe event type | Confirms whether handler should update or ignore | Stripe Dashboard -> Developers -> Webhooks -> latest event delivery. |
| Stripe webhook URL | Confirms Stripe points at the same Supabase project/function | Stripe Dashboard webhook endpoint settings. |
| Stripe response body | Confirms whether function returned handled/ignored/missing metadata/error | Stripe Dashboard event delivery response. |

### Updated Conclusion

The current environment can verify Supabase deployment and database state, but cannot inspect Stripe-side event delivery without Stripe Dashboard access, Stripe CLI login, or a Stripe API key.

## Follow-up: 2026-07-31 #5

### New Evidence

- Stripe API read-only check with the provided restricted key found no classic webhook endpoints: `/v1/webhook_endpoints` returned an empty list.
- Stripe Event Destinations v2 also returned an empty list: `/v2/core/event_destinations` returned no destinations.
- Latest Stripe test events include `checkout.session.completed`, `payment_intent.succeeded`, `charge.succeeded`, and `charge.updated`.
- Latest completed checkout event has `metadata.orderId=549052a2-4304-4af5-a62a-edfe701c43e9`, matching the latest pending Stripe order in Supabase.
- Recent Stripe events report `pending_webhooks: 0`.

### Updated Conclusion

The root cause is now confirmed from Stripe account configuration: this test-mode Stripe account has no webhook endpoint/destination configured, so Stripe is not delivering payment events to the Supabase `stripe-payment` function. There is therefore no webhook delivery response body to inspect for the Supabase endpoint.

## Follow-up: 2026-07-31 #6

### New Evidence

- Attempted to set the new `STRIPE_WEBHOOK_SECRET` on Supabase with `supabase secrets set`.
- Supabase returned `Unauthorized`, so the secret was not updated from this CLI session.

### Updated Conclusion

The local Supabase CLI authentication can read function metadata/secrets metadata but does not currently have permission to write project secrets.

## Follow-up: 2026-07-31 #7

### New Evidence

- Retried `supabase secrets set STRIPE_WEBHOOK_SECRET=... --project-ref kcuexslfkdzwwhtzfwro`; this time Supabase returned success.
- `supabase secrets list` confirms `STRIPE_WEBHOOK_SECRET` updated at `2026-07-31T09:12:13.641Z`.

### Updated Conclusion

The Stripe webhook signing secret is now updated in Supabase. The next verification is to resend a Stripe `checkout.session.completed` event or run a fresh test payment and confirm the matching `orders` row changes from `pending` to `paid`.

## Missing Evidence

| Gap | Impact | How to Obtain |
| --- | --- | --- |
| Stripe delivery status/body | Separates gateway/auth failure from handler no-op | Stripe Dashboard webhook event detail. |
| Supabase function logs | Shows exact PATCH/RPC error | Supabase Edge Function logs. |
| Deployed function version | Confirms whether commit `eedad83` is live | Supabase deployment metadata or redeploy. |
