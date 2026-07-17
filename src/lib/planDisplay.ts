export type PlanDisplayRow = {
  id: string;
  title: string;
  data_amount_gb?: number | string | null;
  is_unlimited: boolean;
  validity_days: number;
  price?: number | string;
  currency?: string;
  supports_5g: boolean;
  plan_countries?: {
    countries?: { name: string; iso2: string } | { name: string; iso2: string }[] | null;
  }[] | null;
  plan_regions?: {
    regions?: { name: string; slug: string } | { name: string; slug: string }[] | null;
  }[] | null;
};

function rows<T>(value: T | T[] | null | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : Number(value);
}

export function formatMoney(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);
}

export function getPlanDisplay(plan: PlanDisplayRow) {
  const country = (plan.plan_countries ?? []).flatMap((item) =>
    rows(item.countries),
  )[0];
  const region = (plan.plan_regions ?? []).flatMap((item) =>
    rows(item.regions),
  )[0];
  const amount = toNumber(plan.data_amount_gb);

  return {
    name: country?.name ?? region?.name ?? plan.title,
    flag: country?.iso2?.toUpperCase() ?? region?.slug?.toUpperCase() ?? "GL",
    data: plan.is_unlimited
      ? "Unlimited"
      : `${Number.isInteger(amount) ? amount : amount.toFixed(2)} GB`,
    validity: `${plan.validity_days} ${plan.validity_days === 1 ? "Day" : "Days"}`,
    network: plan.supports_5g ? "4G LTE / 5G" : "4G",
  };
}
