import { LinearGradient } from "expo-linear-gradient";
import { Zap } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

export function ActiveEsimCard({ onViewDetails }: { onViewDetails: () => void }) {
  return (
    <View className="px-6 mt-6">
      <Text className="text-lg font-semibold text-[#111827] mb-3">
        My eSIM
      </Text>

      <View className="bg-white rounded-3xl p-5 border border-[#F3F4F6]">
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-row items-center">
            <Text style={{ fontSize: 32 }}>{"\uD83C\uDDEF\uD83C\uDDF5"}</Text>

            <View className="ml-3">
              <Text className="font-semibold text-[#111827]">Japan eSIM</Text>

              <View className="flex-row items-center mt-1">
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    backgroundColor: "#22C55E",
                  }}
                />

                <Text className="text-xs text-[#16A34A] ml-2">Active</Text>
              </View>
            </View>
          </View>

          <Zap size={20} color="#7B61FF" />
        </View>

        <Text className="text-sm text-[#6B7280] mb-1">Data Remaining</Text>

        <View className="flex-row justify-between mb-2">
          <Text className="text-sm text-[#6B7280]" />
          <Text className="font-semibold text-[#111827]">7.2GB / 10GB</Text>
        </View>

        <View
          style={{
            height: 8,
            backgroundColor: "#E5E7EB",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <LinearGradient
            colors={["#5B8DEF", "#7B61FF"]}
            style={{
              width: "72%",
              height: "100%",
            }}
          />
        </View>

        <View className="flex-row justify-between mt-4">
          <Text className="text-sm text-[#6B7280]">Days Remaining</Text>

          <Text className="font-semibold text-[#111827]">12 Days</Text>
        </View>

        <Pressable
          className="bg-[#F3F4F6] rounded-xl py-3 mt-4 items-center"
          onPress={onViewDetails}
        >
          <Text className="font-medium text-[#374151]">View Details</Text>
        </Pressable>
      </View>
    </View>
  );
}
