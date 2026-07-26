import { Settings } from "lucide-react-native";
import type React from "react";
import { Text, View } from "react-native";

import { useI18n } from "@/lib/i18n";

export function ProfileShell({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-6 pt-14 pb-4 flex-row items-center justify-between border-b border-gray-100">
        <Text className="text-[26px] font-bold text-gray-900">
          {t("tabs.profile")}
        </Text>

        <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
          <Settings size={20} color="#4B5563" />
        </View>
      </View>

      {children}
    </View>
  );
}
