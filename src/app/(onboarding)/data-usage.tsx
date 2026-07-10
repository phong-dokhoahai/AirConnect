import { router, useLocalSearchParams } from "expo-router";
import { Infinity, Smartphone, Video, Wifi } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { BackButton } from "@/components/airconnect/ui";

type IconComponent = React.ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

const usageOptions: {
  id: string;
  label: string;
  range: string;
  icon: IconComponent;
  description: string;
}[] = [
  {
    id: "light",
    label: "Light Use",
    range: "1–3 GB",
    icon: Smartphone,
    description: "Email & messaging",
  },
  {
    id: "moderate",
    label: "Moderate Use",
    range: "5–10 GB",
    icon: Wifi,
    description: "Social media & browsing",
  },
  {
    id: "heavy",
    label: "Heavy Use",
    range: "20+ GB",
    icon: Video,
    description: "Streaming & calls",
  },
  {
    id: "unlimited",
    label: "Unlimited",
    range: "No limits",
    icon: Infinity,
    description: "Maximum freedom",
  },
];

export default function DataUsageRoute() {
  const params = useLocalSearchParams<{
    purpose?: string;
    destinations?: string;
    departureDate?: string;
  }>();

  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    if (!selected) return;

    router.push({
      pathname: "/recommendation",
      params: {
        ...params,
        usage: selected,
      },
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
          How much data do you need?
        </Text>

        <View className="mx-auto w-full max-w-md gap-3">
          {usageOptions.map(({ id, label, range, icon: Icon, description }) => {
            const isSelected = selected === id;

            return (
              <Pressable
                key={id}
                onPress={() => setSelected(id)}
                className={`w-full rounded-2xl border-2 p-6 ${
                  isSelected
                    ? "border-[#7B61FF] bg-[#F5F0FF]"
                    : "border-gray-200 bg-white"
                }`}
              >
                <View className="flex-row items-start gap-4">
                  <View
                    className={`rounded-xl p-3 ${
                      isSelected ? "bg-[#7B61FF]" : "bg-gray-100"
                    }`}
                  >
                    <Icon
                      size={24}
                      color={isSelected ? "#FFFFFF" : "#4B5563"}
                      strokeWidth={2}
                    />
                  </View>

                  <View className="flex-1">
                    <Text
                      className={`mb-1 text-lg font-semibold ${
                        isSelected ? "text-[#7B61FF]" : "text-gray-900"
                      }`}
                    >
                      {label}
                    </Text>

                    <Text
                      className={`text-sm ${
                        isSelected ? "text-[#7B61FF]" : "text-gray-600"
                      }`}
                    >
                      {range}
                    </Text>

                    <Text className="mt-1 text-xs text-gray-500">
                      {description}
                    </Text>
                  </View>
                </View>
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
            Continue
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
