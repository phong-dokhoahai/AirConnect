import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

import {
  ActiveEsimCard,
  featuredPlans,
  HomeHeader,
  PopularDestinationsSection,
  popularDestinations,
  PromoBanner,
  RecommendedPlansSection,
  regionalPlans,
  RegionalPlansSection,
} from "@/components/airconnect/home";

export default function HomeRoute() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";

    return "Good Evening";
  }, []);

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

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader
          greeting={greeting}
          search={search}
          onSearchChange={setSearch}
        />
        <PromoBanner />
        <ActiveEsimCard onViewDetails={() => viewPlanDetails("1")} />
        <PopularDestinationsSection destinations={popularDestinations} />
        <RegionalPlansSection plans={regionalPlans} />
        <RecommendedPlansSection
          favorites={favorites}
          plans={featuredPlans}
          onToggleFavorite={toggleFavorite}
          onViewDetails={viewPlanDetails}
        />
      </ScrollView>
    </View>
  );
}
