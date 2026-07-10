import { supabase } from './supabase';

export async function getCountries() {
  return supabase
    .from('countries')
    .select('id, name, iso2, iso3')
    .order('name', { ascending: true });
}

export async function getRegions() {
  return supabase
    .from('regions')
    .select(
      `
      id,
      name,
      slug,
      description,
      region_countries (
        countries (
          id,
          name,
          iso2
        )
      )
    `,
    )
    .order('name', { ascending: true });
}

export async function getActiveCatalogPlans() {
  return supabase
    .from('esim_plans')
    .select(
      `
      id,
      title,
      description,
      data_amount_gb,
      is_unlimited,
      usage_tier,
      validity_days,
      price,
      currency,
      provider_name,
      activation_policy,
      tethering_supported,
      supports_5g,
      is_active,
      plan_countries (
        countries (
          id,
          name,
          iso2,
          iso3
        )
      ),
      plan_regions (
        regions (
          id,
          name,
          slug,
          description
        )
      ),
      plan_networks (
        id,
        network_name,
        coverage_note,
        network_type,
        countries (
          id,
          name,
          iso2
        )
      ),
      plan_features (
        id,
        icon,
        label,
        sort_order
      )
    `,
    )
    .eq('is_active', true)
    .order('price', { ascending: true });
}

export async function getActiveRecommendationPlans() {
  return supabase
    .from('esim_plans')
    .select(
      `
      id,
      title,
      description,
      data_amount_gb,
      is_unlimited,
      usage_tier,
      validity_days,
      price,
      currency,
      provider_name,
      activation_policy,
      tethering_supported,
      supports_5g,
      is_active,
      plan_countries (
        countries (
          id,
          name,
          iso2,
          iso3
        )
      ),
      plan_regions (
        regions (
          id,
          name,
          slug,
          description,
          region_countries (
            countries (
              id,
              name,
              iso2,
              iso3
            )
          )
        )
      ),
      plan_networks (
        id,
        network_name,
        coverage_note,
        network_type,
        countries (
          id,
          name,
          iso2
        )
      ),
      plan_features (
        id,
        icon,
        label,
        sort_order
      )
    `,
    )
    .eq('is_active', true)
    .order('price', { ascending: true });
}

export async function getPlansByCountryIso2(iso2: string) {
  const normalizedIso2 = iso2.trim().toUpperCase();

  const { data: country, error: countryError } = await supabase
    .from('countries')
    .select(
      `
      id,
      region_countries (
        region_id
      )
    `,
    )
    .eq('iso2', normalizedIso2)
    .single();

  if (countryError) {
    return { data: null, error: countryError };
  }

  const regionIds = country.region_countries.map((region) => region.region_id);

  const planSelect = `
    id,
    title,
    description,
    data_amount_gb,
    is_unlimited,
    validity_days,
    price,
    currency,
    provider_name,
    activation_policy,
    tethering_supported,
    supports_5g,
    plan_features (
      icon,
      label,
      sort_order
    )
  `;

  const [countryPlans, regionalPlans] = await Promise.all([
    supabase
      .from('esim_plans')
      .select(
        `
        ${planSelect},
        plan_countries!inner (
          country_id
        )
      `,
      )
      .eq('is_active', true)
      .eq('plan_countries.country_id', country.id),
    regionIds.length === 0
      ? Promise.resolve({ data: [], error: null })
      : supabase
          .from('esim_plans')
          .select(
            `
            ${planSelect},
            plan_regions!inner (
              region_id
            )
          `,
          )
          .eq('is_active', true)
          .in('plan_regions.region_id', regionIds),
  ]);

  if (countryPlans.error) {
    return { data: null, error: countryPlans.error };
  }

  if (regionalPlans.error) {
    return { data: null, error: regionalPlans.error };
  }

  const plansById = new Map(
    [...countryPlans.data, ...regionalPlans.data].map((plan) => [plan.id, plan]),
  );

  return {
    data: Array.from(plansById.values()).sort((firstPlan, secondPlan) => {
      return firstPlan.price - secondPlan.price;
    }),
    error: null,
  };
}

export async function getCountryOnlyPlansByIso2(iso2: string) {
  const normalizedIso2 = iso2.trim().toUpperCase();

  return supabase
    .from('esim_plans')
    .select(
      `
      id,
      title,
      description,
      data_amount_gb,
      is_unlimited,
      validity_days,
      price,
      currency,
      provider_name,
      activation_policy,
      tethering_supported,
      supports_5g,
      plan_features (
        icon,
        label,
        sort_order
      ),
      plan_countries!inner (
        countries!inner (
          id,
          name,
          iso2
        )
      )
    `,
    )
    .eq('is_active', true)
    .eq('plan_countries.countries.iso2', normalizedIso2)
    .order('price', { ascending: true });
}

export async function getPlansByRegionSlug(slug: string) {
  const normalizedSlug = slug.trim().toLowerCase();

  return supabase
    .from('esim_plans')
    .select(
      `
      id,
      title,
      description,
      data_amount_gb,
      is_unlimited,
      validity_days,
      price,
      currency,
      provider_name,
      activation_policy,
      tethering_supported,
      supports_5g,
      plan_features (
        icon,
        label,
        sort_order
      ),
      plan_regions!inner (
        regions!inner (
          id,
          name,
          slug
        )
      )
    `,
    )
    .eq('is_active', true)
    .eq('plan_regions.regions.slug', normalizedSlug)
    .order('price', { ascending: true });
}

export async function getPlanDetails(planId: string) {
  return supabase
    .from('esim_plans')
    .select(
      `
      id,
      title,
      description,
      data_amount_gb,
      is_unlimited,
      validity_days,
      price,
      currency,
      provider_name,
      activation_policy,
      tethering_supported,
      supports_5g,
      is_active,
      plan_countries (
        countries (
          id,
          name,
          iso2,
          iso3
        )
      ),
      plan_regions (
        regions (
          id,
          name,
          slug,
          description
        )
      ),
      plan_networks (
        id,
        network_name,
        coverage_note,
        network_type,
        countries (
          id,
          name,
          iso2
        )
      ),
      plan_features (
        id,
        icon,
        label,
        sort_order
      )
    `,
    )
    .eq('id', planId)
    .eq('is_active', true)
    .order('sort_order', {
      referencedTable: 'plan_features',
      ascending: true,
    })
    .single();
}
