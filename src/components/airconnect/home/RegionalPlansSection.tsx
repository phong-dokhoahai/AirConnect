import { CustomLinearGradient } from "@/components/ui/CustomLinearGradient";
import { useI18n } from "@/lib/i18n";
import { Pressable, Text, View } from "react-native";

import { SectionHeader } from "./SectionHeader";
import type { RegionalPlan } from "./types";

export function RegionalPlansSection({
  plans,
  onViewDetails,
}: {
  plans: RegionalPlan[];
  onViewDetails: (planId: string) => void;
}) {
  const { t, translateName } = useI18n();

  return (
    <View className="px-6 mt-6">
      <SectionHeader title={t("home.regionalPlans")} />

      <View className="flex-row flex-wrap justify-between gap-y-3">
        {plans.map((item) => (
          <Pressable
            key={item.id}
            style={{ width: "48%" }}
            className="bg-white rounded-3xl p-4 border border-[#F3F4F6]"
            disabled={!item.planId}
            onPress={() => item.planId && onViewDetails(item.planId)}
          >
            <CustomLinearGradient
              colors={item.colors}
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 22 }}>{item.icon}</Text>
            </CustomLinearGradient>

            <Text className="font-semibold text-[#111827]">
              {translateName(item.name)}
            </Text>

            <Text className="text-xs text-[#6B7280] mt-1">
              {item.data && item.validity && item.network
                ? `${item.data} - ${item.validity} - ${item.network}`
                : t("home.countriesCount", { count: item.countries })}
            </Text>

            <Text className="text-[#7B61FF] mt-2 font-medium">
              {item.price}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
