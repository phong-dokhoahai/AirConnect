import type {
  FeaturedPlan,
  PopularDestination,
  RegionalPlan,
} from "@/components/airconnect/home/types";

import {
  getActiveCatalogPlans,
  getCountries,
  getRegions,
} from "./catalogQueries";

type QueryError = {
  message?: string;
};

type CountryRow = {
  id: string;
  name: string;
  iso2: string;
  iso3?: string | null;
};

type RegionRow = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  region_countries?: { countries?: CountryRow | CountryRow[] | null }[] | null;
};

type PlanFeatureRow = {
  id?: string;
  icon: string;
  label: string;
  sort_order: number;
};

type PlanNetworkRow = {
  id?: string;
  network_name: string;
  coverage_note?: string | null;
  network_type: string;
  countries?: Pick<CountryRow, "id" | "name" | "iso2"> | null;
};

type PlanCountryRow = {
  countries?: CountryRow | CountryRow[] | null;
};

type PlanRegionRow = {
  regions?: Omit<RegionRow, "region_countries"> | Omit<RegionRow, "region_countries">[] | null;
};

type CatalogPlanRow = {
  id: string;
  title: string;
  description?: string | null;
  data_amount_gb?: number | string | null;
  is_unlimited: boolean;
  validity_days: number;
  price: number | string;
  currency: string;
  provider_name: string;
  activation_policy: string;
  tethering_supported: boolean;
  supports_5g: boolean;
  is_active: boolean;
  plan_countries?: PlanCountryRow[] | null;
  plan_regions?: PlanRegionRow[] | null;
  plan_networks?: PlanNetworkRow[] | null;
  plan_features?: PlanFeatureRow[] | null;
};

export type CatalogData = {
  popularDestinations: PopularDestination[];
  regionalPlans: RegionalPlan[];
  featuredPlans: FeaturedPlan[];
};

export type CatalogApiResponse = {
  data: CatalogData | null;
  error: string | null;
};

const regionPresentation: Record<
  string,
  { icon: string; colors: readonly [string, string] }
> = {
  asia: { icon: "\uD83C\uDF0F", colors: ["#FB923C", "#EC4899"] },
  europe: { icon: "\uD83C\uDFF0", colors: ["#60A5FA", "#8B5CF6"] },
  global: { icon: "\uD83C\uDF0D", colors: ["#A78BFA", "#EC4899"] },
};

const destinationImages: Record<string, string> = {
  JP: "\uD83C\uDFEF",
  TH: "\uD83C\uDFDD\uFE0F",
  VN: "\uD83C\uDF3E",
  SG: "\uD83C\uDF03",
  KR: "\uD83C\uDFD9\uFE0F",
  US: "\uD83D\uDDFD",
  FR: "\uD83D\uDDFC",
  ES: "\uD83C\uDFD6\uFE0F",
  IT: "\uD83C\uDFF0",
};

function getErrorMessage(error: QueryError | null | undefined) {
  return error?.message ?? "Unable to load catalog data.";
}

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined) {
    return 0;
  }

  return typeof value === "number" ? value : Number(value);
}

function formatPrice(value: number | string, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(toNumber(value));
}

function formatData(plan: CatalogPlanRow) {
  if (plan.is_unlimited) {
    return "Unlimited";
  }

  const dataAmount = toNumber(plan.data_amount_gb);
  return `${Number.isInteger(dataAmount) ? dataAmount : dataAmount.toFixed(2)}GB`;
}

function formatValidity(days: number) {
  return `${days} ${days === 1 ? "Day" : "Days"}`;
}

function flagFromIso2(iso2: string | null | undefined) {
  const normalizedIso2 = iso2?.trim().toUpperCase();

  if (!normalizedIso2 || normalizedIso2.length !== 2) {
    return "\uD83C\uDF0D";
  }

  return normalizedIso2
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
}

function getNetworkLabel(plan: CatalogPlanRow) {
  const networkTypes = new Set(
    (plan.plan_networks ?? [])
      .map((network) => network.network_type)
      .filter(Boolean),
  );

  if (plan.supports_5g || networkTypes.has("5G")) {
    return "5G";
  }

  if (networkTypes.has("LTE")) {
    return "LTE";
  }

  return "4G";
}

function rows<T>(value: T | T[] | null | undefined): T[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function getPlanCountries(plan: CatalogPlanRow) {
  return (plan.plan_countries ?? [])
    .flatMap((entry) => rows(entry.countries))
    .filter((country): country is CountryRow => Boolean(country));
}

function getPlanRegions(plan: CatalogPlanRow) {
  return (plan.plan_regions ?? [])
    .flatMap((entry) => rows(entry.regions))
    .filter((region): region is Omit<RegionRow, "region_countries"> =>
      Boolean(region),
    );
}

function getLowestPriceForCountry(country: CountryRow, plans: CatalogPlanRow[]) {
  return plans.find((plan) =>
    getPlanCountries(plan).some((planCountry) => planCountry.id === country.id),
  );
}

function getLowestPriceForRegion(region: RegionRow, plans: CatalogPlanRow[]) {
  return plans.find((plan) =>
    getPlanRegions(plan).some((planRegion) => planRegion.id === region.id),
  );
}

function mapPopularDestinations(
  countries: CountryRow[],
  plans: CatalogPlanRow[],
): PopularDestination[] {
  return countries.map((country) => {
    const plan = getLowestPriceForCountry(country, plans);
    const iso2 = country.iso2.toUpperCase();

    return {
      id: iso2.toLowerCase(),
      name: country.name,
      flag: flagFromIso2(iso2),
      price: plan ? formatPrice(plan.price, plan.currency) : "Check plans",
      image: destinationImages[iso2] ?? "\uD83C\uDF0D",
    };
  });
}

function mapRegionalPlans(
  regions: RegionRow[],
  plans: CatalogPlanRow[],
): RegionalPlan[] {
  return regions.map((region) => {
    const plan = getLowestPriceForRegion(region, plans);
    const presentation = regionPresentation[region.slug] ?? {
      icon: "\uD83D\uDDFA\uFE0F",
      colors: ["#4ADE80", "#14B8A6"] as const,
    };

    return {
      id: region.slug,
      name: region.name,
      countries: (region.region_countries ?? []).flatMap((entry) =>
        rows(entry.countries),
      ).length,
      price: plan ? formatPrice(plan.price, plan.currency) : "Check plans",
      icon: presentation.icon,
      colors: presentation.colors,
    };
  });
}

function mapFeaturedPlans(plans: CatalogPlanRow[]): FeaturedPlan[] {
  return plans.map((plan) => {
    const [country] = getPlanCountries(plan);
    const [region] = getPlanRegions(plan);
    const displayName = country?.name ?? region?.name ?? plan.title;
    const price = toNumber(plan.price);
    const originalPrice = price > 0 ? price * 1.25 : price;

    return {
      id: plan.id,
      flag: country ? flagFromIso2(country.iso2) : "\uD83C\uDF0D",
      country: displayName,
      data: formatData(plan),
      validity: formatValidity(plan.validity_days),
      network: getNetworkLabel(plan),
      price: formatPrice(plan.price, plan.currency),
      originalPrice: formatPrice(originalPrice, plan.currency),
      savings: "20%",
    };
  });
}

export async function getCatalogData(): Promise<CatalogApiResponse> {
  const [countriesResult, regionsResult, plansResult] = await Promise.all([
    getCountries(),
    getRegions(),
    getActiveCatalogPlans(),
  ]);

  const error =
    countriesResult.error ?? regionsResult.error ?? plansResult.error ?? null;

  if (error) {
    console.error("Catalog load failed", error);
    return { data: null, error: getErrorMessage(error) };
  }

  const countries = (countriesResult.data ?? []) as CountryRow[];
  const regions = (regionsResult.data ?? []) as unknown as RegionRow[];
  const plans = (plansResult.data ?? []) as unknown as CatalogPlanRow[];

  return {
    data: {
      popularDestinations: mapPopularDestinations(countries, plans).slice(0, 9),
      regionalPlans: mapRegionalPlans(regions, plans),
      featuredPlans: mapFeaturedPlans(plans).slice(0, 6),
    },
    error: null,
  };
}
