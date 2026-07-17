import { CustomLinearGradient } from "@/components/ui/CustomLinearGradient";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  ChevronRight,
  Filter,
  Heart,
  Mic,
  Search,
  X,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import type {
  FeaturedPlan,
  PopularDestination,
  RegionalPlan,
} from "@/components/airconnect/home/types";
import { getCatalogData } from "@/lib/catalogApi";

const recentSearches = ["Japan", "Thailand", "Europe", "South Korea"];

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

export default function ExploreRoute() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearchesList, setRecentSearchesList] = useState(recentSearches);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [catalog, setCatalog] = useState<CatalogState>(emptyCatalog);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const removeRecentSearch = (search: string) => {
    setRecentSearchesList((prev) => prev.filter((s) => s !== search));
  };

  const toggleFavorite = (planId: string) => {
    setFavorites((prev) =>
      prev.includes(planId)
        ? prev.filter((id) => id !== planId)
        : [...prev, planId],
    );
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
        <View className="bg-white px-6 pt-14 pb-6">
          <View className="flex-row items-center mb-6">
            <Pressable onPress={() => router.back()} className="mr-4 p-2">
              <ArrowLeft size={24} color="#111827" />
            </Pressable>

            <Text className="text-2xl font-semibold text-[#111827]">
              Explore eSIMs
            </Text>
          </View>

          <View className="relative">
            <View className="absolute left-4 top-4 z-10">
              <Search size={20} color="#9CA3AF" />
            </View>

            <TextInput
              placeholder="Search country, region, or destination"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="bg-[#F3F4F6] rounded-2xl pl-12 pr-12 py-4 text-[#111827]"
            />

            <Pressable className="absolute right-4 top-4">
              <Mic size={20} color="#9CA3AF" />
            </Pressable>
          </View>
        </View>

        {recentSearchesList.length > 0 && (
          <View className="px-6 mt-6">
            <Text className="text-sm font-medium text-[#6B7280] mb-3">
              Recent Searches
            </Text>

            <View className="flex-row flex-wrap">
              {recentSearchesList.map((search) => (
                <View
                  key={search}
                  className="flex-row items-center bg-white border border-[#E5E7EB] rounded-full px-4 py-2 mr-2 mb-2"
                >
                  <Text className="text-sm text-[#374151] mr-2">{search}</Text>

                  <Pressable onPress={() => removeRecentSearch(search)}>
                    <X size={14} color="#9CA3AF" />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        )}

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

        <View className="px-6 mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-[#111827]">
              Popular Destinations
            </Text>

            <Pressable className="flex-row items-center">
              <Text className="text-sm font-medium text-[#7B61FF] mr-1">
                See All
              </Text>
              <ChevronRight size={16} color="#7B61FF" />
            </Pressable>
          </View>

          <View className="flex-row flex-wrap justify-between gap-y-3">
            {catalog.popularDestinations.map((destination) => (
              <Pressable
                key={destination.id}
                style={{ width: "48%" }}
                className="bg-white rounded-2xl p-4 border border-[#F3F4F6]"
              >
                <Text style={{ fontSize: 32 }}>{destination.flag}</Text>

                <Text className="font-semibold text-[#111827] mt-3 mb-1">
                  {destination.name}
                </Text>

                <Text className="text-sm font-medium text-[#7B61FF]">
                  From {destination.price}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="mt-6">
          <View className="px-6 mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-[#111827]">
              Regional Plans
            </Text>

            <Pressable className="flex-row items-center">
              <Text className="text-sm font-medium text-[#7B61FF] mr-1">
                See All
              </Text>
              <ChevronRight size={16} color="#7B61FF" />
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
          >
            {catalog.regionalPlans.map((region) => (
              <Pressable
                key={region.id}
                className="bg-white rounded-2xl p-4 mr-3 border border-[#F3F4F6]"
                style={{ width: 160 }}
              >
                <CustomLinearGradient
                  colors={region.colors}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{region.icon}</Text>
                </CustomLinearGradient>

                <Text className="font-semibold text-[#111827] mb-1">
                  {region.name}
                </Text>

                <Text className="text-xs text-[#6B7280] mb-2">
                  {region.countries} countries
                </Text>

                <Text className="text-sm font-medium text-[#7B61FF]">
                  From {region.price}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View className="px-6 mt-6">
          <Text className="text-lg font-semibold text-[#111827] mb-3">
            Featured Plans
          </Text>

          {catalog.featuredPlans.map((plan) => (
            <View
              key={plan.id}
              className="bg-white rounded-2xl p-4 border border-[#F3F4F6] mb-3"
            >
              <View className="flex-row">
                <Text style={{ fontSize: 28 }}>{plan.flag}</Text>

                <View className="flex-1 ml-3">
                  <View className="flex-row justify-between">
                    <View className="flex-1">
                      <Text className="font-semibold text-[#111827]">
                        {plan.country}
                      </Text>

                      <Text className="text-xs text-[#6B7280] mt-1">
                        {plan.data} - {plan.validity} - {plan.network}
                      </Text>
                    </View>

                    <Pressable onPress={() => toggleFavorite(plan.id)}>
                      <Heart
                        size={20}
                        color={
                          favorites.includes(plan.id) ? "#7B61FF" : "#9CA3AF"
                        }
                        fill={
                          favorites.includes(plan.id)
                            ? "#7B61FF"
                            : "transparent"
                        }
                      />
                    </Pressable>
                  </View>

                  <View className="flex-row items-center justify-between mt-4">
                    <View className="flex-row items-center flex-wrap">
                      <Text className="text-xl font-bold text-[#111827] mr-2">
                        {plan.price}
                      </Text>

                      <Text className="text-sm text-[#9CA3AF] line-through mr-2">
                        {plan.originalPrice}
                      </Text>

                      <View className="bg-[#ECFDF5] px-2 py-1 rounded-full">
                        <Text className="text-xs font-medium text-[#15803D]">
                          Save {plan.savings}
                        </Text>
                      </View>
                    </View>

                    <Pressable
                      className="px-4 py-2 rounded-xl border-2 border-[#7B61FF]"
                      onPress={() =>
                        router.push({
                          pathname: "/plan/[id]",
                          params: { id: plan.id },
                        })
                      }
                    >
                      <Text className="text-sm font-medium text-[#7B61FF]">
                        View Details
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Pressable
        onPress={() => setShowFilterModal(true)}
        style={{
          position: "absolute",
          right: 24,
          bottom: 32,
        }}
      >
        <CustomLinearGradient
          colors={["#5B8DEF", "#7B61FF"]}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Filter size={24} color="#FFFFFF" />
        </CustomLinearGradient>
      </Pressable>

      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-end"
          onPress={() => setShowFilterModal(false)}
        >
          <Pressable className="bg-white rounded-t-3xl p-6" onPress={() => {}}>
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-semibold text-[#111827]">
                Filter Plans
              </Text>

              <Pressable onPress={() => setShowFilterModal(false)}>
                <X size={24} color="#4B5563" />
              </Pressable>
            </View>

            <Text className="text-sm font-medium text-[#374151] mb-2">
              Price Range
            </Text>

            <View className="flex-row mb-4">
              <TextInput
                placeholder="Min"
                keyboardType="numeric"
                value={minPrice}
                onChangeText={setMinPrice}
                className="flex-1 bg-[#F3F4F6] rounded-xl px-4 py-3 mr-2"
              />

              <TextInput
                placeholder="Max"
                keyboardType="numeric"
                value={maxPrice}
                onChangeText={setMaxPrice}
                className="flex-1 bg-[#F3F4F6] rounded-xl px-4 py-3"
              />
            </View>

            <Text className="text-sm font-medium text-[#374151] mb-2">
              Data Amount
            </Text>

            <View className="flex-row justify-between mb-4">
              {["1-5GB", "5-10GB", "10GB+"].map((option) => (
                <Pressable
                  key={option}
                  style={{ width: "31%" }}
                  className="bg-[#F3F4F6] rounded-xl py-3 items-center"
                >
                  <Text className="text-sm text-[#374151]">{option}</Text>
                </Pressable>
              ))}
            </View>

            <Text className="text-sm font-medium text-[#374151] mb-2">
              Network Type
            </Text>

            <View className="flex-row justify-between mb-6">
              {["4G", "5G", "4G/5G"].map((option) => (
                <Pressable
                  key={option}
                  style={{ width: "31%" }}
                  className="bg-[#F3F4F6] rounded-xl py-3 items-center"
                >
                  <Text className="text-sm text-[#374151]">{option}</Text>
                </Pressable>
              ))}
            </View>

            <View className="flex-row">
              <Pressable className="flex-1 bg-[#F3F4F6] rounded-2xl py-4 mr-2 items-center">
                <Text className="font-medium text-[#374151]">Reset</Text>
              </Pressable>

              <Pressable
                className="flex-1 bg-[#7B61FF] rounded-2xl py-4 items-center"
                onPress={() => setShowFilterModal(false)}
              >
                <Text className="font-medium text-white">Apply Filters</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
