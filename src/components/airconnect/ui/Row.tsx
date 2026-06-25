import type React from "react";
import { View } from "react-native";

export function Row({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View className={`flex-row items-center ${className}`}>{children}</View>
  );
}
