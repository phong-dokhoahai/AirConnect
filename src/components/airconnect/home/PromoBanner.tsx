import { CustomLinearGradient } from "@/components/ui/CustomLinearGradient";
import { useI18n } from "@/lib/i18n";
import { Globe } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

export function PromoBanner() {
  const { t } = useI18n();

  return (
    <View className="px-6 mt-6">
      <CustomLinearGradient
        colors={["#5B8DEF", "#7B61FF"]}
        style={{
          borderRadius: 24,
          padding: 24,
        }}
      >
        <View className="flex-row justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-2xl font-semibold text-white">
              {t("home.travelSmarter")}
            </Text>

            <Text className="text-2xl font-semibold text-white">
              {t("home.withEsim")}
            </Text>

            <Text className="text-white mt-2 mb-4">
              {t("home.instantCountries")}
            </Text>

            <Pressable className="bg-white self-start px-5 py-3 rounded-xl">
              <Text className="font-medium text-[#7B61FF]">
                {t("common.browsePlans")}
              </Text>
            </Pressable>
          </View>

          <Globe size={72} color="rgba(255,255,255,0.25)" />
        </View>
      </CustomLinearGradient>
    </View>
  );
}
