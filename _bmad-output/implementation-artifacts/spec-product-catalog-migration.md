---
title: 'Product Catalog Migration'
type: 'feature'
created: '2026-06-26'
status: 'done'
route: 'one-shot'
---

# Product Catalog Migration

## Intent

**Problem:** AirConnect needs a Supabase-backed product catalog for eSIM plans that can be sold by country, region, or both, while the Expo app remains a public client using only the publishable key.

**Approach:** Add a complete SQL migration for countries, regions, plan targeting, networks, features, RLS policies, indexes, triggers, and seed data, plus TypeScript Supabase query examples for the frontend.

## Suggested Review Order

**Database Schema**

- Catalog tables, constraints, indexes, RLS policies, triggers, and seed data.
  [`20260626000000_create_product_catalog.sql:1`](../../supabase/migrations/20260626000000_create_product_catalog.sql#L1)

**Frontend Query Examples**

- Supabase JS helpers for listing countries, regions, country/region plans, and plan details.
  [`catalogQueries.ts:1`](../../src/lib/catalogQueries.ts#L1)
