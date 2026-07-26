import { getData } from "country-list";
import { router, useLocalSearchParams } from "expo-router";
import { MoreHorizontal, Search } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { BackButton, Button, Flag } from "@/components/airconnect/ui";
import { useI18n } from "@/lib/i18n";

type DestinationCountry = {
  id: string;
  name: string;
  flag: string;
  group: string;
};

const popularCountries: DestinationCountry[] = [
  { id: "jp", name: "Japan", flag: "JP", group: "Asia" },
  { id: "th", name: "Thailand", flag: "TH", group: "Asia" },
  { id: "vn", name: "Vietnam", flag: "VN", group: "Asia" },
  { id: "sg", name: "Singapore", flag: "SG", group: "Asia" },
  { id: "kr", name: "South Korea", flag: "KR", group: "Asia" },
  { id: "fr", name: "France", flag: "FR", group: "Popular" },
  { id: "es", name: "Spain", flag: "ES", group: "Popular" },
  { id: "it", name: "Italy", flag: "IT", group: "Popular" },
  { id: "us", name: "United States", flag: "US", group: "Popular" },
];

const popularCountryIds = new Set(popularCountries.map((country) => country.id));

const allDestinationCountries: DestinationCountry[] = [
  ...popularCountries,
  ...getData()
    .map((country) => ({
      id: country.code.toLowerCase(),
      name: country.name,
      flag: country.code,
      group: "All",
    }))
    .filter((country) => !popularCountryIds.has(country.id))
    .sort((first, second) => first.name.localeCompare(second.name)),
];

export default function DestinationRoute() {
  const { t, translateName } = useI18n();
  const params = useLocalSearchParams<{ purpose?: string }>();
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showAllDestinations, setShowAllDestinations] = useState(false);

  const destinationCountries = showAllDestinations
    ? allDestinationCountries
    : popularCountries;

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return destinationCountries;

    return destinationCountries.filter((country) =>
      [country.name, country.flag, country.group].some((value) =>
        value.toLowerCase().includes(keyword),
      ),
    );
  }, [destinationCountries, query]);

  const toggle = (id: string) => {
    setSelected((current) => (current === id ? null : id));
  };

  const handleContinue = () => {
    if (!selected) return;

    router.push({
      pathname: "/data-usage",
      params: {
        purpose: params.purpose,
        destinations: selected,
      },
    });
  };

  return (
    <View className="flex-1 bg-white">
      <View className="absolute left-6 top-14 z-10">
        <BackButton />
      </View>

      <View className="px-6 pt-16">
        <Text className="text-center text-3xl font-semibold text-gray-950">
          {t("onboarding.destinationTitle")}
        </Text>

        <View className="mt-7 flex-row items-center rounded-2xl bg-gray-50 px-4 py-3">
          <Search size={20} color="#9CA3AF" />

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t("onboarding.searchDestinations")}
            placeholderTextColor="#9CA3AF"
            className="ml-3 flex-1 text-base text-gray-900"
          />
        </View>

        <Text className="mb-3 mt-6 text-sm font-bold text-gray-500">
          {showAllDestinations
            ? t("onboarding.allDestinations")
            : t("onboarding.popularAsiaDestinations")}
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerClassName="pb-8"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row flex-wrap justify-between gap-y-3">
          {filtered.map((country) => {
            const isSelected = selected === country.id;

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
                  {translateName(country.name)}
                </Text>
              </Pressable>
            );
          })}

          {!showAllDestinations && !query.trim() ? (
            <Pressable
              onPress={() => setShowAllDestinations(true)}
              accessibilityLabel={t("onboarding.showAllDestinations")}
              accessibilityRole="button"
              className="w-[48%] items-center rounded-3xl border-2 border-gray-100 bg-white p-4"
            >
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
                <MoreHorizontal size={26} color="#4B5563" />
              </View>

              <Text className="mt-3 text-center font-bold text-gray-950">
                {t("onboarding.more")}
              </Text>
            </Pressable>
          ) : null}
        </View>

        {!filtered.length ? (
          <View className="items-center rounded-2xl bg-gray-50 p-6">
            <Text className="text-center font-medium text-gray-900">
              {t("onboarding.noDestination")}
            </Text>
            <Text className="mt-1 text-center text-sm text-gray-500">
              {t("onboarding.tryDestination")}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <View className="px-6 pb-8">
        <Button
          label={t("common.continue")}
          disabled={!selected}
          onPress={handleContinue}
        />
      </View>
    </View>
  );
}
