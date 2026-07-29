import { Text, View } from "react-native";

import { useI18n } from "@/lib/i18n";

export function SectionHeader({
  title,
  showSeeAll = true,
}: {
  title: string;
  showSeeAll?: boolean;
}) {
  const { t } = useI18n();

  return (
    <View className="flex-row items-center justify-between mb-3">
      <Text className="text-lg font-semibold text-[#111827]">{title}</Text>

      {/* {showSeeAll ? (
        <Pressable className="flex-row items-center">
          <Text className="text-[#7B61FF] mr-1">{t("common.seeAll")}</Text>
          <ChevronRight size={16} color="#7B61FF" />
        </Pressable>
      ) : null} */}
    </View>
  );
}
