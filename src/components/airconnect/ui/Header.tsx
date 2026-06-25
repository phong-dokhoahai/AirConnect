import type React from "react";
import { Text, View } from "react-native";

import { Row } from "./Row";

export function Header({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <Row className="justify-between pt-3 pb-5">
      <View className="flex-1">
        <Text className="text-3xl font-bold text-gray-950">{title}</Text>
        {subtitle ? (
          <Text className="mt-1 text-sm text-gray-500">{subtitle}</Text>
        ) : null}
      </View>
      {right}
    </Row>
  );
}
