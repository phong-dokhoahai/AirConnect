import { router } from "expo-router";
import {
  Briefcase,
  GraduationCap,
  Home,
  Laptop,
  Palmtree,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { BackButton } from "@/components/airconnect/ui";
import { useI18n } from "@/lib/i18n";

const purposes = [
  { id: "vacation", labelKey: "onboarding.vacation", icon: Palmtree },
  { id: "business", labelKey: "onboarding.business", icon: Briefcase },
  { id: "study", labelKey: "onboarding.study", icon: GraduationCap },
  { id: "long-term", labelKey: "onboarding.longTerm", icon: Home },
  { id: "digital-nomad", labelKey: "onboarding.digitalNomad", icon: Laptop },
];

export default function TravelPurposeRoute() {
  const { t } = useI18n();
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    if (!selected) return;

    router.push({
      pathname: "/destination",
      params: { purpose: selected },
    });
  };

  return (
    <View className="flex-1 bg-white">
      <View className="absolute left-6 top-14 z-10">
        <BackButton />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pt-16 pb-8"
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-8 text-center text-3xl font-semibold text-gray-900">
          {t("onboarding.purposeTitle")}
        </Text>

        <View className="mx-auto w-full max-w-md gap-3">
          {purposes.map(({ id, labelKey, icon: Icon }) => {
            const isSelected = selected === id;

            return (
              <Pressable
                key={id}
                onPress={() => setSelected(id)}
                className={`w-full flex-row items-center gap-4 rounded-2xl border-2 p-6 ${
                  isSelected
                    ? "border-[#7B61FF] bg-[#7B61FF]/5"
                    : "border-gray-200 bg-white"
                }`}
              >
                <View
                  className={`rounded-xl p-3 ${
                    isSelected ? "bg-[#7B61FF]" : "bg-gray-100"
                  }`}
                >
                  <Icon size={24} color={isSelected ? "#FFFFFF" : "#4B5563"} />
                </View>

                <Text
                  className={`text-lg font-medium ${
                    isSelected ? "text-[#7B61FF]" : "text-gray-900"
                  }`}
                >
                  {t(labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View className="px-6 pb-8">
        <Pressable
          onPress={handleContinue}
          disabled={!selected}
          className={`w-full rounded-2xl px-6 py-4 ${
            selected ? "bg-[#7B61FF]" : "bg-gray-100"
          }`}
        >
          <Text
            className={`text-center font-medium ${
              selected ? "text-white" : "text-gray-400"
            }`}
          >
            {t("common.continue")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
