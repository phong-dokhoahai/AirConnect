import { ChevronRight } from "lucide-react-native";
import { Pressable, Switch, Text, View } from "react-native";

import type { SettingRow } from "../types";

export function SettingItem({
  item,
  onPress,
}: {
  item: SettingRow;
  onPress?: () => void;
}) {
  const Icon = item.icon;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-4 border-b border-gray-50"
    >
      <View
        className={`w-10 h-10 rounded-xl items-center justify-center ${
          item.danger ? "bg-red-50" : "bg-[#F5F0FF]"
        }`}
      >
        <Icon size={18} color={item.danger ? "#EF4444" : "#6915E0"} />
      </View>

      <View className="flex-1 ml-3">
        <Text
          className={`text-sm font-semibold ${
            item.danger ? "text-red-500" : "text-gray-900"
          }`}
        >
          {item.label}
        </Text>

        {!!item.sub && (
          <Text className="text-xs text-gray-500 mt-1">{item.sub}</Text>
        )}
      </View>

      {item.toggle ? (
        <Switch value={!!item.toggled} />
      ) : !item.danger ? (
        <ChevronRight size={18} color="#9CA3AF" />
      ) : null}
    </Pressable>
  );
}
