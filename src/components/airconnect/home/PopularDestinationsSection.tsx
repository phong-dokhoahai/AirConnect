import { Pressable, ScrollView, Text, View } from "react-native";

import { SectionHeader } from "./SectionHeader";
import type { PopularDestination } from "./types";

export function PopularDestinationsSection({
  destinations,
}: {
  destinations: PopularDestination[];
}) {
  return (
    <View className="mt-6">
      <View className="px-6">
        <SectionHeader title="Popular Destinations" />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24 }}
      >
        {destinations.map((item) => (
          <Pressable
            key={item.id}
            className="bg-white rounded-3xl p-4 mr-3 border border-[#F3F4F6]"
            style={{ width: 130 }}
          >
            <Text style={{ fontSize: 36 }}>{item.image}</Text>
            <Text style={{ fontSize: 24 }}>{item.flag}</Text>

            <Text
              className="font-semibold text-[#111827] mt-2"
              numberOfLines={2}
            >
              {item.name}
            </Text>

            <Text className="text-[#7B61FF] text-sm mt-1">
              From {item.price}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
