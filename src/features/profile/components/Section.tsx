import type React from "react";
import { Text, View } from "react-native";

export function SectionTitle({ title }: { title: string }) {
  return (
    <View className="px-1 mb-2">
      <Text className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
        {title}
      </Text>
    </View>
  );
}

export function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View>
      <SectionTitle title={title} />

      <View className="bg-white rounded-[24px] border border-gray-100 overflow-hidden">
        {children}
      </View>
    </View>
  );
}
