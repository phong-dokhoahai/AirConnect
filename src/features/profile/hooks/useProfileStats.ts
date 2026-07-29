import { getUserEsims } from "@/lib/purchaseQueries";
import { toNumber, type PlanDisplayRow } from "@/lib/planDisplay";
import { useEffect, useState } from "react";

type ProfileStats = {
  countriesConnected: string;
  totalDataUsed: string;
  esimsPurchased: string;
};

type UserEsimStatsRow = {
  data_used_gb: number | string | null;
  esim_plans?: PlanDisplayRow | PlanDisplayRow[] | null;
};

const emptyStats: ProfileStats = {
  countriesConnected: "0",
  totalDataUsed: "0 GB",
  esimsPurchased: "0",
};

function rows<T>(value: T | T[] | null | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function formatGb(value: number) {
  return `${Number.isInteger(value) ? value : value.toFixed(1)} GB`;
}

function countryKeys(plan: PlanDisplayRow) {
  return (plan.plan_countries ?? [])
    .flatMap((item) => rows(item.countries))
    .map((country) => country.iso2 || country.name);
}

export function useProfileStats(userId?: string) {
  const [stats, setStats] = useState(emptyStats);

  useEffect(() => {
    let isMounted = true;

    if (!userId) return;
    const currentUserId = userId;

    async function loadStats() {
      try {
        const { data, error } = await getUserEsims(currentUserId);

        if (!isMounted) return;

        if (error) {
          console.error("Profile stats load failed", error);
          setStats(emptyStats);
          return;
        }

        const esims = (data ?? []) as unknown as UserEsimStatsRow[];
        const countries = new Set(
          esims.flatMap((esim) => rows(esim.esim_plans).flatMap(countryKeys)),
        );
        const dataUsed = esims.reduce(
          (total, esim) => total + toNumber(esim.data_used_gb),
          0,
        );

        setStats({
          countriesConnected: String(countries.size),
          totalDataUsed: formatGb(dataUsed),
          esimsPurchased: String(esims.length),
        });
      } catch (error) {
        if (!isMounted) return;
        console.error("Profile stats load failed", error);
        setStats(emptyStats);
      }
    }

    void loadStats();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  return userId ? stats : emptyStats;
}
