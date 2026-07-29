import { CustomLinearGradient } from "@/components/ui/CustomLinearGradient";
import { useI18n } from "@/lib/i18n";
import { Clock, Edit3, Star } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import type { ProfileUser } from "../types";

export function ProfileHeaderCard({
  profileUser,
}: {
  profileUser: ProfileUser;
}) {
  const { t, translateName } = useI18n();

  return (
    <View className="bg-white rounded-[28px] overflow-hidden border border-gray-100">
      <CustomLinearGradient
        colors={["#6915E0", "#9864E1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 96 }}
      />

      <View className="px-5 pb-5 -mt-10">
        <View className="flex-row justify-between items-end mb-3">
          <CustomLinearGradient
            colors={["#5B8DEF", "#6915E0"]}
            className="w-20 h-20 rounded-[20px] items-center justify-center"
          >
            <Text className="text-white text-xl font-bold">
              {profileUser.avatar}
            </Text>
          </CustomLinearGradient>

          <Pressable className="flex-row items-center bg-gray-100 px-4 py-2 rounded-full">
            <Edit3 size={14} color="#374151" />
            <Text className="ml-2 text-sm font-semibold text-gray-700">
              {t("profile.edit")}
            </Text>
          </Pressable>
        </View>

        <Text className="text-[20px] font-bold text-gray-900">
          {profileUser.name}
        </Text>

        <Text className="text-sm text-gray-500 mt-1">{profileUser.email}</Text>

        <View className="flex-row flex-wrap mt-3">
          <View className="flex-row items-center bg-[#F5F0FF] px-3 py-2 rounded-full mr-2 mb-2">
            <Star size={14} color="#6915E0" />
            <Text className="text-xs font-semibold text-[#6915E0] ml-1">
              {translateName(profileUser.tier)}
            </Text>
          </View>

          <View className="flex-row items-center bg-gray-100 px-3 py-2 rounded-full">
            <Clock size={12} color="#6B7280" />
            <Text className="text-xs text-gray-500 ml-1">
              {t("profile.memberSince", { date: profileUser.memberSince })}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
