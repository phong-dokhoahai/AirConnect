import { CustomLinearGradient } from "@/components/ui/CustomLinearGradient";
import { useI18n } from "@/lib/i18n";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import type { QuickAction, StatItem } from "../types";
import { SectionTitle } from "./Section";

export function StatCard({ stat }: { stat: StatItem }) {
  const Icon = stat.icon;
  const { t } = useI18n();

  return (
    <View className="flex-1 bg-white rounded-3xl p-4 border border-gray-100 items-center">
      <CustomLinearGradient
        colors={[stat.from, stat.to]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="w-10 h-10 rounded-xl items-center justify-center mb-3"
      >
        <Icon size={20} color="#FFFFFF" />
      </CustomLinearGradient>

      <Text className="text-[18px] font-bold text-gray-900 mb-1">
        {stat.value}
      </Text>

      <Text className="text-xs text-center text-gray-500">
        {t(stat.labelKey)}
      </Text>
    </View>
  );
}

export function StatsRow({ stats }: { stats: StatItem[] }) {
  return (
    <View className="flex-row mt-5">
      {stats.map((item) => (
        <View key={item.labelKey} className="flex-1 mx-1">
          <StatCard stat={item} />
        </View>
      ))}
    </View>
  );
}

export function QuickActionsGrid({
  actions,
  onActionPress,
}: {
  actions: QuickAction[];
  onActionPress: (screen: string) => void;
}) {
  const { t } = useI18n();

  return (
    <View className="mt-5">
      <SectionTitle title={t("profile.quickActions")} />

      <View className="flex-row flex-wrap justify-between gap-y-3">
        {actions.map((item) => (
          <QuickActionCard
            key={item.labelKey}
            item={item}
            onActionPress={onActionPress}
          />
        ))}
      </View>
    </View>
  );
}

function QuickActionCard({
  item,
  onActionPress,
}: {
  item: QuickAction;
  onActionPress: (screen: string) => void;
}) {
  const Icon = item.icon;
  const { t } = useI18n();
  const card = (
    <>
      <CustomLinearGradient
        colors={[item.from, item.to]}
        style={{ width: 44, height: 44, borderRadius: 16 }}
        className="w-11 h-11 items-center justify-center mb-3"
      >
        <Icon size={20} color="#FFFFFF" />
      </CustomLinearGradient>

      <Text className="text-sm font-semibold text-gray-900">
        {t(item.labelKey)}
      </Text>

      <Text className="text-xs text-gray-500 mt-1">{t(item.subKey)}</Text>
    </>
  );

  if (item.screen === "/orders") {
    return (
      <Link href="/orders" asChild>
        <Pressable
          className="bg-white rounded-3xl p-4 border border-gray-100"
          style={{ width: "48%" }}
        >
          {card}
        </Pressable>
      </Link>
    );
  }

  return (
    <Pressable
      onPress={() => onActionPress(item.screen)}
      className="bg-white rounded-3xl p-4 border border-gray-100"
      style={{ width: "48%" }}
    >
      {card}
    </Pressable>
  );
}
