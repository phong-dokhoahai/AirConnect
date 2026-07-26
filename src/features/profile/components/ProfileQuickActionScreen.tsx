import { CustomLinearGradient } from "@/components/ui/CustomLinearGradient";
import { useI18n } from "@/lib/i18n";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Check,
  Headphones,
  Heart,
  Package,
} from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type QuickActionScreenId = "orders" | "saved" | "support";

const screenConfig = {
  orders: {
    icon: Package,
    from: "#5B8DEF",
    to: "#6915E0",
  },
  saved: {
    icon: Heart,
    from: "#EC4899",
    to: "#9864E1",
  },
  support: {
    icon: Headphones,
    from: "#10B981",
    to: "#6915E0",
  },
};

export function ProfileQuickActionScreen({
  id,
}: {
  id: QuickActionScreenId;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const config = screenConfig[id];
  const Icon = config.icon;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 px-5 pt-3">
        <View className="mb-6 flex-row items-center">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-white"
          >
            <ArrowLeft size={20} color="#374151" />
          </Pressable>
        </View>

        <CustomLinearGradient
          colors={[config.from, config.to]}
          className="mb-5 h-16 w-16 items-center justify-center rounded-3xl"
        >
          <Icon size={28} color="#FFFFFF" />
        </CustomLinearGradient>

        <Text className="text-3xl font-bold text-gray-950">
          {t(`profile.quick.${id}.title`)}
        </Text>
        <Text className="mt-2 text-base leading-6 text-gray-500">
          {t(`profile.quick.${id}.body`)}
        </Text>

        <View className="mt-6 rounded-3xl border border-gray-100 bg-white p-4">
          {[1, 2, 3].map((row) => (
            <View
              key={row}
              className="mb-3 flex-row rounded-2xl bg-gray-50 px-4 py-3 last:mb-0"
            >
              <Check size={16} color="#6915E0" />
              <Text className="ml-3 flex-1 text-sm leading-5 text-gray-700">
                {t(`profile.quick.${id}.row${row}`)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
