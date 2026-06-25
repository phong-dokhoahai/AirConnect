import { View } from "react-native";

export function ProgressBar({
  value,
  tone = "bg-[#6915E0]",
}: {
  value: number;
  tone?: string;
}) {
  return (
    <View className="h-2 overflow-hidden rounded-full bg-gray-100">
      <View
        className={`h-full rounded-full ${tone}`}
        style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
      />
    </View>
  );
}
