import { Text, View } from "react-native";

export function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View className="flex-1 items-center">
      <Text
        className={`text-2xl font-black ${
          accent ? "text-[#6915E0]" : "text-gray-950"
        }`}
      >
        {value}
      </Text>
      <Text className="mt-1 text-xs text-gray-500">{label}</Text>
    </View>
  );
}
