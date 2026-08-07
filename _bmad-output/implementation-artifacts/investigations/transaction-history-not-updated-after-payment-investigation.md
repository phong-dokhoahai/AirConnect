# Investigation: Transaction History Not Updated After Payment

## Hand-off Brief

1. **What happened.** User reports payment succeeds, but Profile > Transaction History does not show the new transaction.
2. **Where the case stands.** Source trace found a UI stale-data path: Transaction History loaded only on mount, so an already-mounted `/orders` screen could keep showing old empty data after checkout.
3. **What's needed next.** Test by opening Transaction History after a fresh payment; if still empty, verify the exact `orders.user_id` against the signed-in app user.

## Case Info

| Field | Value |
| --- | --- |
| Ticket | N/A |
| Date opened | 2026-08-07 |
| Status | Concluded |
| System | AirConnect Profile Transaction History, Supabase orders |
| Evidence sources | User report, source code, prior investigation |

## Problem Statement

User reported in Vietnamese: after successful payment, the purchase is not saved into transaction history.

## Evidence Inventory

| Source | Status | Notes |
| --- | --- | --- |
| `src/features/profile/components/TransactionHistoryScreen.tsx` | Available | Screen queried orders only from a mount effect. |
| `src/lib/purchaseQueries.ts` | Available | `getUserOrders` reads `orders` for the current user id. |
| RLS migrations | Available | `orders` are readable only by their owner. |
| Live order row | Missing | Needed only if the UI refetch fix does not surface the transaction. |

## Confirmed Findings

### Finding 1: Transaction History filters by current auth user

**Evidence:** `src/features/profile/components/TransactionHistoryScreen.tsx:80`, `src/lib/purchaseQueries.ts:164`, `src/lib/purchaseQueries.ts:168`

**Detail:** The screen calls `getUserOrders(authUser.id)`, and the query applies `.eq("user_id", userId)`.

### Finding 2: Supabase RLS also restricts orders to the owner

**Evidence:** `supabase/migrations/20260718000000_create_purchase_ownership.sql:75`, `supabase/migrations/20260718000000_create_purchase_ownership.sql:79`

**Detail:** The select policy allows reads only when `auth.uid() = user_id`.

### Finding 3: History did not refetch on screen focus

**Evidence:** `src/features/profile/components/TransactionHistoryScreen.tsx:100`

**Detail:** Before the patch, loading ran from a normal `useEffect`. If the `/orders` route stayed mounted with an old empty result, returning to it after checkout did not force a refresh.

## Deduced Conclusions

### Deduction 1: Payment status alone does not control history visibility

**Based on:** Findings 1 and 2

**Reasoning:** History shows pending, paid, failed, and canceled orders if they belong to the current auth user. If no row appears, either the UI has stale data, the row belongs to another user, or the row does not exist.

**Conclusion:** The source-level UI issue is stale refetch, not a missing paid-status filter.

### Deduction 2: Refetch-on-focus is the smallest app-side fix

**Based on:** Finding 3

**Reasoning:** Checkout/payment happens outside the history screen. Refetching when `/orders` gains focus refreshes data after returning from payment without changing database ownership rules.

**Conclusion:** `TransactionHistoryScreen` should load orders with `useFocusEffect`.

## Source Code Trace

| Element | Detail |
| --- | --- |
| Error origin | `src/features/profile/components/TransactionHistoryScreen.tsx:100` |
| Trigger | User opens or returns to `/orders` after payment |
| Condition | `/orders` screen already had old `orders` state and did not refetch on focus |
| Related files | `src/lib/purchaseQueries.ts`, `supabase/migrations/20260718000000_create_purchase_ownership.sql` |

## Conclusion

**Confidence:** Medium

The confirmed source issue is that Transaction History could show stale results because it only fetched on mount. The patch changes it to refetch on screen focus and removes raw order logging. If the transaction still does not appear after this, the remaining data-side check is whether the order row exists under the same Supabase `user_id` as the current app session.

## Recommended Next Steps

### Diagnostic

Run this for the exact successful order:

```sql
select id, user_id, status, traveler_email, payment_method, payment_provider, created_at
from public.orders
where id = '<order-id>'
   or traveler_email = '<email>'
order by created_at desc;
```

## Reproduction Plan

1. Open Transaction History once while it is empty.
2. Complete a Stripe payment.
3. Return to Transaction History.
4. Expected after patch: screen refetches and shows the new order if it belongs to the current user.

## Side Findings

- `npm run lint` still fails on an existing unrelated lint error in `src/app/(tabs)/home.tsx:151`.
