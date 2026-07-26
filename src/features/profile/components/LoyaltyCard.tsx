import { CustomLinearGradient } from "@/components/ui/CustomLinearGradient";
import { useI18n } from "@/lib/i18n";
import { Gift } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import type { ProfileUser } from "../types";
import { SectionTitle } from "./Section";

export function LoyaltyCard({
  profileUser,
  rewardsBarWidth,
}: {
  profileUser: ProfileUser;
  rewardsBarWidth: number;
}) {
  const { t, translateName } = useI18n();

  return (
    <View className="mt-5">
      <SectionTitle title={t("profile.loyalty")} />

      <CustomLinearGradient
        colors={["#6915E0", "#9864E1"]}
        className="rounded-[28px] p-5"
      >
        <View className="flex-row justify-between mb-4">
          <View>
            <View className="flex-row items-center">
              <Gift size={16} color="#FFFFFF" />
              <Text className="text-white ml-2">{t("profile.travelRewards")}</Text>
            </View>

            <Text className="text-white text-2xl font-bold mt-2">
              {t("profile.points", {
                value: profileUser.points.toLocaleString(),
              })}
            </Text>
          </View>

          <View className="bg-white/20 px-3 py-2 rounded-full">
            <Text className="text-white text-xs font-bold">
              {translateName(profileUser.tier)}
            </Text>
          </View>
        </View>

        <View className="mb-4">
          <View className="flex-row justify-between mb-2">
            <Text className="text-xs text-white/80">
              {translateName(profileUser.tier)}
            </Text>

            <Text className="text-xs text-white/80">
              {translateName(profileUser.nextTier)}
            </Text>
          </View>

          <View className="h-2 rounded-full bg-white/20 overflow-hidden">
            <View
              className="h-full bg-white rounded-full"
              style={{ width: `${rewardsBarWidth}%` }}
            />
          </View>

          <Text className="text-xs text-white/80 mt-2">
            {t("profile.pointsToTier", {
              points: (profileUser.nextTierPoints - profileUser.points).toLocaleString(),
              tier: translateName(profileUser.nextTier),
            })}
          </Text>
        </View>

        <Pressable className="bg-white rounded-2xl py-3 items-center">
          <Text className="font-bold text-[#6915E0]">
            {t("profile.viewRewards")}
          </Text>
        </Pressable>
      </CustomLinearGradient>
    </View>
  );
}
