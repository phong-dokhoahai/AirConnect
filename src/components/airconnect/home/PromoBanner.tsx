import { LinearGradient } from "expo-linear-gradient";
import { Globe } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

export function PromoBanner() {
  return (
    <View className="px-6 mt-6">
      <LinearGradient
        colors={["#5B8DEF", "#7B61FF"]}
        style={{
          borderRadius: 24,
          padding: 24,
        }}
      >
        <View className="flex-row justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-2xl font-semibold text-white">
              Travel Smarter
            </Text>

            <Text className="text-2xl font-semibold text-white">
              with eSIM
            </Text>

            <Text className="text-white mt-2 mb-4">
              Instant activation in over 200 countries.
            </Text>

            <Pressable className="bg-white self-start px-5 py-3 rounded-xl">
              <Text className="font-medium text-[#7B61FF]">
                Explore Plans
              </Text>
            </Pressable>
          </View>

          <Globe size={72} color="rgba(255,255,255,0.25)" />
        </View>
      </LinearGradient>
    </View>
  );
}
