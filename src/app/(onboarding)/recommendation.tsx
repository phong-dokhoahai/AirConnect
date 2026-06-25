import { router } from "expo-router";
import { Check, Globe, Signal, Zap } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-xl bg-white/10 p-3">
      <Text className="mb-1 text-xs text-white/70">{label}</Text>
      <Text className="text-lg font-semibold text-white">{value}</Text>
    </View>
  );
}

function FeatureRow({ text }: { text: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <Check size={16} color="#FFFFFF" />
      <Text className="text-sm text-white/90">{text}</Text>
    </View>
  );
}

function NetworkRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-sm text-gray-600">{label}</Text>
      <Text className="text-sm font-medium text-gray-900">{value}</Text>
    </View>
  );
}

export default function RecommendationRoute() {
  const handleBuyNow = () => {
    router.push("/checkout");
  };

  const handleBrowseMore = () => {
    router.push("/(tabs)/explore");
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pt-16 pb-8"
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-8 text-center text-3xl font-semibold text-gray-900">
          Recommended for Your Trip
        </Text>

        <View className="mx-auto w-full max-w-md">
          <View className="relative mb-6 rounded-3xl bg-[#7B61FF] p-6">
            <View className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1">
              <Text className="text-xs font-semibold text-[#7B61FF]">
                Save 30%
              </Text>
            </View>

            <View className="mb-6 flex-row items-start gap-4">
              <Text className="text-5xl">🇯🇵</Text>

              <View className="flex-1">
                <Text className="mb-1 text-2xl font-semibold text-white">
                  Japan
                </Text>

                <View className="flex-row items-center gap-2">
                  <Signal size={16} color="#FFFFFF" />
                  <Text className="text-sm text-white/90">4G/5G Coverage</Text>
                </View>
              </View>
            </View>

            <View className="mb-6 flex-row gap-4">
              <InfoBox label="Data" value="10 GB" />
              <InfoBox label="Validity" value="15 Days" />
            </View>

            <View className="mb-6 gap-2">
              <FeatureRow text="Instant activation" />
              <FeatureRow text="No physical SIM needed" />
              <FeatureRow text="Keep your number" />
            </View>

            <View className="flex-row items-end justify-between">
              <View>
                <Text className="text-sm text-white/70">Total Price</Text>
                <Text className="text-3xl font-bold text-white">$8.99</Text>
              </View>

              <Text className="text-sm text-white/70 line-through">$12.99</Text>
            </View>
          </View>

          <View className="mb-6 flex-row items-center justify-center gap-2">
            <Zap size={16} color="#7B61FF" />
            <Text className="text-sm text-gray-600">
              Activation in under 2 minutes
            </Text>
          </View>

          <View className="mb-6 rounded-2xl bg-gray-50 p-4">
            <View className="mb-3 flex-row items-center gap-2">
              <Globe size={20} color="#7B61FF" />
              <Text className="font-semibold text-gray-900">
                Network Details
              </Text>
            </View>

            <View className="gap-2">
              <NetworkRow label="Carrier" value="NTT Docomo" />
              <NetworkRow label="Speed" value="4G LTE / 5G" />
              <NetworkRow label="Coverage" value="Nationwide" />
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="gap-3 px-6 pb-8">
        <Pressable
          onPress={handleBuyNow}
          className="w-full rounded-2xl bg-[#7B61FF] px-6 py-4"
        >
          <Text className="text-center font-medium text-white">Buy Now</Text>
        </Pressable>

        <Pressable
          onPress={handleBrowseMore}
          className="w-full rounded-2xl border-2 border-gray-200 bg-white px-6 py-4"
        >
          <Text className="text-center font-medium text-gray-700">
            Browse More Plans
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
