import { Pressable, Text, View } from "react-native";

import type { ESIM } from "@/constants/airconnect";
import { Flag } from "./Flag";
import { ProgressBar } from "./ProgressBar";
import { Row } from "./Row";
import { StatusBadge } from "./StatusBadge";

export function ESIMCard({
  esim,
  onViewDetails,
}: {
  esim: ESIM;
  onViewDetails: (id: string) => void;
}) {
  const dataPercent = esim.dataTotal
    ? Math.min((esim.dataUsed / esim.dataTotal) * 100, 100)
    : 0;
  return (
    <Pressable
      onPress={() => onViewDetails(esim.id)}
      className="rounded-3xl border border-gray-100 bg-white p-5"
    >
      <Row className="items-start justify-between gap-3">
        <Row className="flex-1 gap-3">
          <Flag value={esim.flag} />
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-950">
              {esim.country}
            </Text>
            <Text className="mt-1 text-sm text-gray-500">
              {esim.planName} - {esim.data} - {esim.network}
            </Text>
          </View>
        </Row>
        <StatusBadge status={esim.status} />
      </Row>
      <View className="mt-5">
        <Row className="mb-2 justify-between">
          <Text className="text-sm text-gray-500">Data Remaining</Text>
          <Text className="text-sm font-bold text-gray-900">
            {esim.data === "Unlimited"
              ? "Unlimited"
              : `${(esim.dataTotal - esim.dataUsed).toFixed(1)}GB`}
          </Text>
        </Row>
        <ProgressBar
          value={esim.data === "Unlimited" ? 100 : 100 - dataPercent}
          tone={esim.status === "expired" ? "bg-gray-300" : "bg-[#6915E0]"}
        />
      </View>
      <Row className="mt-4 justify-between">
        <Text className="text-sm text-gray-500">Expires {esim.expiryDate}</Text>
        <Text className="font-semibold text-[#6915E0]">Details</Text>
      </Row>
    </Pressable>
  );
}
