import { router, useLocalSearchParams } from "expo-router";
import { Search } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { Button, Flag } from "@/components/airconnect/ui";
import { countries } from "@/constants/airconnect";

export default function DestinationRoute() {
  const params = useLocalSearchParams<{ purpose?: string }>();
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return countries;

    return countries.filter((country) =>
      country.name.toLowerCase().includes(keyword),
    );
  }, [query]);

  const toggle = (id: string) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const handleContinue = () => {
    if (!selected.length) return;

    router.push({
      pathname: "/data-usage",
      params: {
        purpose: params.purpose,
        destinations: selected.join(","),
      },
    });
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pt-16 pb-8"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-center text-3xl font-semibold text-gray-950">
          Where are you going?
        </Text>

        <View className="mt-7 flex-row items-center rounded-2xl bg-gray-50 px-4 py-3">
          <Search size={20} color="#9CA3AF" />

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search destinations..."
            placeholderTextColor="#9CA3AF"
            className="ml-3 flex-1 text-base text-gray-900"
          />
        </View>

        <Text className="mb-3 mt-6 text-sm font-bold text-gray-500">
          Popular Destinations
        </Text>

        <View className="flex-row flex-wrap justify-between gap-y-3">
          {filtered.map((country) => {
            const isSelected = selected.includes(country.id);

            return (
              <Pressable
                key={country.id}
                onPress={() => toggle(country.id)}
                className={`w-[48%] items-center rounded-3xl border-2 p-4 ${
                  isSelected
                    ? "border-[#6915E0] bg-purple-50"
                    : "border-gray-100 bg-white"
                }`}
              >
                <Flag value={country.flag} />

                <Text
                  className={`mt-3 text-center font-bold ${
                    isSelected ? "text-[#6915E0]" : "text-gray-950"
                  }`}
                >
                  {country.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View className="px-6 pb-8">
        <Button
          label={selected.length ? `Continue (${selected.length})` : "Continue"}
          disabled={!selected.length}
          onPress={handleContinue}
        />
      </View>
    </View>
  );
}
