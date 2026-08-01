---
title: 'Add Argentina eSIM Plans'
type: 'feature'
created: '2026-08-01'
status: 'done'
route: 'one-shot'
---

# Add Argentina eSIM Plans

## Intent

**Problem:** Argentina is missing from the Supabase catalog, so users cannot discover or buy Argentina-specific eSIM plans.

**Approach:** Add a forward-only seed migration that upserts Argentina, links it to Global, and creates four active country plans using the existing light, moderate, heavy, and unlimited usage tiers.

## Suggested Review Order

**Database Seed**

- Argentina country, Global membership, display marker, four plans, plan-country joins, one network, standard features, and initial discount metadata.
  [`../../supabase/migrations/20260801000000_seed_argentina_esim_plans.sql:1`](../../supabase/migrations/20260801000000_seed_argentina_esim_plans.sql#L1)
