import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import {
  HomeHeader,
  PopularDestinationsSection,
  PromoBanner,
  RecommendedPlansSection,
  RegionalPlansSection,
} from "@/components/airconnect/home";
import type {
  FeaturedPlan,
  PopularDestination,
  RegionalPlan,
} from "@/components/airconnect/home/types";
import { getProfileUser } from "@/features/profile/utils";
import { useAuth } from "@/lib/auth";
import { getCatalogData } from "@/lib/catalogApi";

type CatalogState = {
  popularDestinations: PopularDestination[];
  regionalPlans: RegionalPlan[];
  featuredPlans: FeaturedPlan[];
};

const emptyCatalog: CatalogState = {
  popularDestinations: [],
  regionalPlans: [],
  featuredPlans: [],
};

export default function HomeRoute() {
  const router = useRouter();
  const { user: authUser } = useAuth();

  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [catalog, setCatalog] = useState<CatalogState>(emptyCatalog);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";

    return "Good Evening";
  }, []);
  const profileUser = authUser ? getProfileUser(authUser) : null;

  const toggleFavorite = (planId: string) => {
    setFavorites((prev) =>
      prev.includes(planId)
        ? prev.filter((id) => id !== planId)
        : [...prev, planId],
    );
  };

  const viewPlanDetails = (planId: string) => {
    router.push({ pathname: "/plan/[id]", params: { id: planId } });
  };

  const loadCatalog = useCallback(async () => {
    setIsCatalogLoading(true);
    setCatalogError(null);

    const result = await getCatalogData();

    if (result.error) {
      setCatalog(emptyCatalog);
      setCatalogError(result.error);
    } else {
      setCatalog(result.data ?? emptyCatalog);
    }

    setIsCatalogLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsCatalogLoading(true);
      setCatalogError(null);

      const result = await getCatalogData();

      if (!isMounted) {
        return;
      }

      if (result.error) {
        setCatalog(emptyCatalog);
        setCatalogError(result.error);
      } else {
        setCatalog(result.data ?? emptyCatalog);
      }

      setIsCatalogLoading(false);
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader
          greeting={greeting}
          userName={profileUser?.name ?? "Traveler"}
          avatar={profileUser?.avatar ?? "AC"}
          search={search}
          onSearchChange={setSearch}
        />
        <PromoBanner />

        {isCatalogLoading ? (
          <View className="mx-6 mt-6 rounded-2xl border border-[#F3F4F6] bg-white p-4">
            <Text className="text-sm font-medium text-[#4B5563]">
              Loading catalog...
            </Text>
          </View>
        ) : null}

        {catalogError ? (
          <View className="mx-6 mt-6 rounded-2xl border border-[#FEE2E2] bg-white p-4">
            <Text className="text-sm font-semibold text-[#991B1B]">
              {catalogError}
            </Text>

            <Pressable className="mt-3 self-start" onPress={loadCatalog}>
              <Text className="text-sm font-semibold text-[#7B61FF]">
                Retry
              </Text>
            </Pressable>
          </View>
        ) : null}

        <PopularDestinationsSection
          destinations={catalog.popularDestinations}
        />
        <RegionalPlansSection
          plans={catalog.regionalPlans}
          onViewDetails={viewPlanDetails}
        />
        <RecommendedPlansSection
          favorites={favorites}
          plans={catalog.featuredPlans}
          onToggleFavorite={toggleFavorite}
          onViewDetails={viewPlanDetails}
        />
      </ScrollView>
    </View>
  );
}
