import { Text, View } from "react-native";

export function Badge({
  label,
  tone = "bg-purple-50 text-[#6915E0]",
}: {
  label: string;
  tone?: string;
}) {
  return (
    <View className={`rounded-full px-3 py-1 ${tone}`}>
      <Text className="text-xs font-bold">{label}</Text>
    </View>
  );
}
