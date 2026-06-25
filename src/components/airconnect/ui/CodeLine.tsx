import { Text, View } from "react-native";

export function CodeLine({ label, value }: { label: string; value: string }) {
  return (
    <View className="rounded-2xl bg-gray-50 p-4">
      <Text className="text-xs font-black uppercase text-gray-500">
        {label}
      </Text>
      <Text className="mt-1 font-mono text-sm text-gray-800">{value}</Text>
    </View>
  );
}
