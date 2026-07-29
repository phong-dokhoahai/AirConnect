import { CustomLinearGradient } from "@/components/ui/CustomLinearGradient";
import { useI18n } from "@/lib/i18n";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  ChevronRight,
  Headphones,
  Heart,
  Mail,
  Phone,
} from "lucide-react-native";
import { Linking, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type QuickActionScreenId = "saved" | "support";

const screenConfig = {
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
  const isSupport = id === "support";

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

        {isSupport ? (
          <View className="mt-6 overflow-hidden rounded-3xl border border-gray-100 bg-white">
            <ActionRow
              icon={Phone}
              label={t("profile.quick.support.row1")}
              onPress={() => void Linking.openURL("tel:0965394575")}
            />
            <ActionRow
              icon={Mail}
              label={t("profile.quick.support.row2")}
              onPress={() =>
                void Linking.openURL(
                  `mailto:dokhoahaiphong@gmail.com?subject=${encodeURIComponent(
                    "AirConnect support",
                  )}`,
                )
              }
            />
            <ActionRow
              icon={Headphones}
              label={t("transactions.title")}
              onPress={() => router.push("/orders")}
            />
          </View>
        ) : (
          <View className="mt-6 rounded-3xl border border-gray-100 bg-white p-5">
            <Text className="text-base font-semibold text-gray-950">
              {t("profile.quick.saved.row3")}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/(tabs)/explore")}
              className="mt-4 overflow-hidden rounded-2xl"
            >
              <CustomLinearGradient
                colors={[config.from, config.to]}
                className="flex-row items-center justify-center px-5 py-4"
              >
                <Text className="text-base font-bold text-white">
                  {t("common.browsePlans")}
                </Text>
                <ChevronRight size={18} color="#FFFFFF" />
              </CustomLinearGradient>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function ActionRow({
  icon: Icon,
  label,
  onPress,
}: {
  icon: typeof Phone;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center border-b border-gray-100 px-4 py-4 last:border-b-0"
    >
      <View className="h-10 w-10 items-center justify-center rounded-2xl bg-gray-50">
        <Icon size={18} color="#6915E0" />
      </View>
      <Text className="ml-3 flex-1 text-sm font-semibold text-gray-800">
        {label}
      </Text>
      <ChevronRight size={18} color="#9CA3AF" />
    </Pressable>
  );
}
