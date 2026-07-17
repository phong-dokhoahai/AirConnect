import { Text, View } from "react-native";

export function AuthMessage({ message }: { message: string }) {
  return (
    <View className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
      <Text className="text-sm font-medium text-red-600">{message}</Text>
    </View>
  );
}
