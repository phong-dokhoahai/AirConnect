import { Heart } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import type { FeaturedPlan } from "./types";

export function RecommendedPlansSection({
  favorites,
  plans,
  onToggleFavorite,
  onViewDetails,
}: {
  favorites: string[];
  plans: FeaturedPlan[];
  onToggleFavorite: (planId: string) => void;
  onViewDetails: (planId: string) => void;
}) {
  return (
    <View className="px-6 mt-6">
      <Text className="text-lg font-semibold text-[#111827] mb-3">
        Recommended For You
      </Text>

      {plans.map((plan) => {
        const isFavorite = favorites.includes(plan.id);

        return (
          <Pressable
            key={plan.id}
            className="bg-white rounded-3xl p-4 border border-[#F3F4F6] mb-3"
            onPress={() => onViewDetails(plan.id)}
          >
            <View className="flex-row">
              <Text style={{ fontSize: 32 }}>{plan.flag}</Text>

              <View className="flex-1 ml-3">
                <View className="flex-row justify-between">
                  <View className="flex-1 pr-3">
                    <Text className="font-semibold text-[#111827]">
                      {plan.country}
                    </Text>

                    <Text className="text-xs text-[#6B7280] mt-1">
                      {plan.data} - {plan.validity} - {plan.network}
                    </Text>
                  </View>

                  <Pressable
                    onPress={(event) => {
                      event.stopPropagation();
                      onToggleFavorite(plan.id);
                    }}
                  >
                    <Heart
                      size={20}
                      color={isFavorite ? "#7B61FF" : "#9CA3AF"}
                      fill={isFavorite ? "#7B61FF" : "transparent"}
                    />
                  </Pressable>
                </View>

                <View className="flex-row items-center mt-4">
                  <View className="flex-row items-center flex-wrap">
                    <Text className="text-xl font-bold text-[#111827] mr-2">
                      {plan.price}
                    </Text>

                    {plan.originalPrice ? (
                      <Text className="text-sm text-[#9CA3AF] line-through mr-2">
                        {plan.originalPrice}
                      </Text>
                    ) : null}

                    {plan.savings ? (
                      <View className="bg-[#ECFDF5] px-2 py-1 rounded-full">
                        <Text className="text-xs text-[#15803D]">
                          Save {plan.savings}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                </View>
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
