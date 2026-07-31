# Investigation: Profile Order History Empty

## Hand-off Brief

1. **What happened.** User reports they completed an order, but Profile > Transaction History shows no data or useful UI.
2. **Where the case stands.** Source trace shows order history only reads rows where `orders.user_id` equals the current Supabase auth user; without checking production rows/logs, the most likely data-side cause is that the order row is missing or belongs to a different/null user.
3. **What's needed next.** Verify one order ID from the user's success/payment flow against `orders.user_id`, `status`, and the current app `authUser.id`.

## Case Info

| Field | Value |
| --- | --- |
| Ticket | N/A |
| Date opened | 2026-07-31 |
| Status | Active |
| System | AirConnect React Native / Expo app with Supabase |
| Evidence sources | Source code, Supabase migrations/functions |

## Problem Statement

User says they already ordered, but the Transaction History screen in Profile has no data or UI.

## Evidence Inventory

| Source | Status | Notes |
| --- | --- | --- |
| `src/features/profile/components/TransactionHistoryScreen.tsx` | Available | Screen calls `getUserOrders(authUser.id)` and renders empty state when `orders.length === 0`. |
| `src/lib/purchaseQueries.ts` | Available | `getUserOrders` queries `orders` filtered by `user_id`. |
| `supabase/migrations/20260726001000_fix_pending_payment_currency.sql` | Available | Payment order RPC inserts `orders.user_id` from `auth.uid()`. |
| `supabase/functions/stripe-payment/index.ts` and `supabase/functions/sepay-payment/index.ts` | Available | Edge functions forward caller authorization to the RPC that creates orders. |
| Production database row for the user's order | Missing | Needed to confirm whether the row exists and which `user_id` it has. |
| `.expo/dev/logs/start.log` | Available | Shows Stripe payment function returned concrete order IDs. |
| Anonymous REST query with publishable key | Available | Returns `[]` for all discovered order IDs because no user session is available in this shell context. |

## Confirmed Findings

### Finding 1: Transaction History only loads orders for the current auth user

**Evidence:** `src/features/profile/components/TransactionHistoryScreen.tsx:71`, `src/lib/purchaseQueries.ts:164`, `src/lib/purchaseQueries.ts:168`

**Detail:** The screen calls `getUserOrders(authUser.id)`, and `getUserOrders` applies `.eq("user_id", userId)`.

### Finding 2: An empty query result is rendered as "No transactions"

**Evidence:** `src/features/profile/components/TransactionHistoryScreen.tsx:162`, `src/features/profile/components/TransactionHistoryScreen.tsx:165`

**Detail:** If `orders.length === 0`, the UI renders the empty transaction state.

### Finding 3: Payment order creation stores `orders.user_id` from Supabase `auth.uid()`

**Evidence:** `supabase/migrations/20260726001000_fix_pending_payment_currency.sql:21`, `supabase/migrations/20260726001000_fix_pending_payment_currency.sql:51`, `supabase/migrations/20260726001000_fix_pending_payment_currency.sql:67`

**Detail:** The `create_pending_payment_order` RPC captures `auth.uid()` into `v_user_id` and inserts it into `orders.user_id`.

### Finding 4: Edge payment functions pass caller authorization into the order-creation RPC

**Evidence:** `supabase/functions/stripe-payment/index.ts:73`, `supabase/functions/stripe-payment/index.ts:224`, `supabase/functions/sepay-payment/index.ts:80`, `supabase/functions/sepay-payment/index.ts:170`

**Detail:** Stripe and SePay create orders by invoking `create_pending_payment_order` through `supabaseRpc`, using the request authorization header.

### Finding 5: Profile navigation to `/orders` is wired

**Evidence:** `src/features/profile/ProfileScreen.tsx:70`, `src/features/profile/components/SummaryCards.tsx:101`

**Detail:** Quick action presses route to `item.screen`; `/orders` is one of those screens.

### Finding 6: Local logs show Stripe created three orders

**Evidence:** `.expo/dev/logs/start.log`

**Detail:** The payment function returned order IDs `549052a2-4304-4af5-a62a-edfe701c43e9`, `b08e3c9f-374b-4ccc-b6cd-a0c60ba2504e`, and `8401a5bb-f441-431e-bd98-56691637daba`.

### Finding 7: Querying those order IDs without a user session returns no rows

**Evidence:** REST query to `/rest/v1/orders?...&id=eq.<order-id>` using the project publishable key returned HTTP 200 with `[]` for all three IDs.

**Detail:** This matches Supabase RLS behavior for callers that are not the owner of the row.

## Deduced Conclusions

### Deduction 1: If a user sees no transactions after ordering, either the order query returns zero rows or the screen is not mounted as the expected signed-in user

**Based on:** Findings 1 and 2.

**Reasoning:** The screen has no separate local cache. It renders from the Supabase result of `orders where user_id = current auth user id`.

**Conclusion:** The symptom cannot be explained by payment status alone; pending, paid, failed, and canceled orders should all appear if they belong to the current user.

### Deduction 2: A successful payment/orderId is not enough to prove the row will appear in Profile history

**Based on:** Findings 1, 3, and 4.

**Reasoning:** The row appears in history only if it exists under the same `user_id` as the current app session. If order creation ran with a missing/different JWT, or the user later signed into another account, history returns empty.

**Conclusion:** The strongest suspected cause is user ownership mismatch or missing order row, not a pure UI rendering issue.

## Hypothesized Paths

### Hypothesis 1: The order belongs to a different Supabase user than the current Profile session

**Status:** Open

**Theory:** Checkout created the order using `auth.uid()` from one session, but Profile is currently signed in as another user.

**Would confirm:** Production SQL shows `orders.user_id != current authUser.id` for the order ID shown on Success/payment.

**Would refute:** SQL shows the order row has the same `user_id` as current app session and query still returns empty/error.

### Hypothesis 2: The order was never inserted

**Status:** Open

**Theory:** Payment UI or external payment step succeeded/continued, but `create_pending_payment_order` failed or was never called.

**Would confirm:** No row exists in `orders` for the payment code/order ID/email/time window.

**Would refute:** Row exists.

### Hypothesis 3: The history query errors in production

**Status:** Open

**Theory:** Relationship selection or RLS causes an error. Current UI now exposes retry/error, but previous behavior could look empty.

**Would confirm:** Supabase response error from `getUserOrders`.

**Would refute:** Query returns `data: []` with `error: null`.

## Missing Evidence

| Gap | Impact | How to Obtain |
| --- | --- | --- |
| Actual order ID/payment code/email/time window | Confirms row existence and ownership | Inspect Success screen order ID, payment provider dashboard, or Supabase `orders` table |
| Current app `authUser.id` at Profile screen | Confirms ownership match | Log/display `authUser.id` or inspect Supabase session |
| Supabase response for `getUserOrders` | Distinguishes empty result from query error | Temporarily log `{ data, error }` in `loadOrders` |

## Source Code Trace

| Element | Detail |
| --- | --- |
| Error origin | Empty UI path at `TransactionHistoryScreen.tsx:162` |
| Trigger | Open Profile > Transaction History |
| Condition | `getUserOrders(authUser.id)` returns `[]` or error clears `orders` |
| Related files | `src/lib/purchaseQueries.ts`, payment Edge Functions, payment order RPC |

## Conclusion

**Confidence:** Medium-High

The code path shows the history screen is not showing "all orders by email"; it only shows orders owned by the current Supabase user ID. Local logs confirm order IDs were created by the Stripe flow, but querying them from this shell without the app user's session returns no rows. The remaining question is whether Profile is using the same session/user ID that created those orders.

## Recommended Next Steps

### Diagnostic

Run these checks for the exact order/payment you completed:

```sql
select id, user_id, status, traveler_email, payment_method, payment_provider, provider_payment_id, created_at
from public.orders
where id = '<order-id>'
   or traveler_email = '<your-email>'
order by created_at desc;
```

Then compare `orders.user_id` with the current app session user ID.

## Reproduction Plan

1. Sign in as user A.
2. Complete checkout and record Success screen `orderId`.
3. Open Profile > Transaction History.
4. Query Supabase for that `orderId` and compare `orders.user_id` to user A's auth user ID.

## Side Findings

- The previous 3-second timeout in the Transaction History screen could make a slow query look like an empty order history. That was removed in the current working tree.
