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

const usdToVnd = 25000;

function getDisplayMoney(value: number, currency: string, language = "en") {
  if (language === "vi" && currency.toUpperCase() === "USD") {
    return { value: value * usdToVnd, currency: "VND", locale: "vi-VN" };
  }

  return {
    value,
    currency,
    locale: language === "vi" ? "vi-VN" : "en-US",
  };
}

export function formatMoney(value: number, currency = "USD", language = "en") {
  const display = getDisplayMoney(value, currency, language);

  return new Intl.NumberFormat(display.locale, {
    style: "currency",
    currency: display.currency,
    maximumFractionDigits: display.currency === "VND" ? 0 : undefined,
  }).format(display.value);
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
