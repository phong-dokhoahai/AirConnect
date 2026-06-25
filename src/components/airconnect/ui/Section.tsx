import type React from "react";
import { Text, View } from "react-native";

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mt-6">
      <Text className="mb-3 text-xl font-bold text-gray-950">{title}</Text>
      <View className="rounded-3xl bg-white p-5">{children}</View>
    </View>
  );
}
