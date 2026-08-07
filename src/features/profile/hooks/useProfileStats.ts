import { getUserEsims, getUserOrders } from "@/lib/purchaseQueries";
import { toNumber, type PlanDisplayRow } from "@/lib/planDisplay";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

type ProfileStats = {
  activeEsims: string;
  countriesConnected: string;
  ordersCount: string;
  totalDataUsed: string;
  esimsPurchased: string;
};

type UserEsimStatsRow = {
  status: string;
  data_used_gb: number | string | null;
  esim_plans?: PlanDisplayRow | PlanDisplayRow[] | null;
};

const emptyStats: ProfileStats = {
  activeEsims: "0",
  countriesConnected: "0",
  ordersCount: "0",
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

  const loadStats = useCallback(() => {
    let isMounted = true;

    if (!userId) {
      return () => {
        isMounted = false;
      };
    }

    const currentUserId = userId;

    async function loadStats() {
      try {
        const [esimsResult, ordersResult] = await Promise.all([
          getUserEsims(currentUserId),
          getUserOrders(currentUserId),
        ]);

        if (!isMounted) return;

        if (esimsResult.error || ordersResult.error) {
          console.error("Profile stats load failed", esimsResult.error ?? ordersResult.error);
          setStats(emptyStats);
          return;
        }

        const esims = (esimsResult.data ?? []) as unknown as UserEsimStatsRow[];
        const orders = ordersResult.data ?? [];
        const countries = new Set(
          esims.flatMap((esim) => rows(esim.esim_plans).flatMap(countryKeys)),
        );
        const dataUsed = esims.reduce(
          (total, esim) => total + toNumber(esim.data_used_gb),
          0,
        );

        setStats({
          activeEsims: String(esims.filter((esim) => esim.status !== "expired").length),
          countriesConnected: String(countries.size),
          ordersCount: String(orders.length),
          totalDataUsed: formatGb(dataUsed),
          esimsPurchased: String(orders.filter((order) => order.status === "paid").length),
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

  useFocusEffect(loadStats);

  return userId ? stats : emptyStats;
}
