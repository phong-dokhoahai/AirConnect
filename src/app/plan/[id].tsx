import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Heart,
  Phone,
  QrCode,
  Share2,
  Signal,
  Wifi,
  Zap,
} from "lucide-react-native";
import React, { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

type IconComponent = React.ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

const features: {
  icon: IconComponent;
  label: string;
  color: string;
}[] = [
  { icon: Zap, label: "Instant Activation", color: "#7B61FF" },
  { icon: QrCode, label: "QR Code Delivery", color: "#5B8DEF" },
  { icon: Signal, label: "5G Support", color: "#7B61FF" },
  { icon: Wifi, label: "Hotspot Support", color: "#5B8DEF" },
  { icon: Phone, label: "Keep Your Number", color: "#7B61FF" },
];

const networks = [
  { name: "NTT Docomo", coverage: "Nationwide", quality: "Excellent" },
  { name: "SoftBank", coverage: "Major Cities", quality: "Great" },
  { name: "KDDI", coverage: "Nationwide", quality: "Excellent" },
];

const faqs = [
  {
    question: "How does eSIM work?",
    answer:
      "An eSIM is a digital SIM that lets you activate a cellular plan without a physical SIM card. Simply scan the QR code we send you, and you're connected instantly.",
  },
  {
    question: "When does activation start?",
    answer:
      "Your plan activates when you first connect to a mobile network in the destination country. The validity period starts from this moment.",
  },
  {
    question: "Can I use hotspot?",
    answer:
      "Yes! This plan includes full hotspot/tethering support, so you can share your connection with other devices.",
  },
  {
    question: "Is my device compatible?",
    answer:
      "Most modern smartphones support eSIM, including iPhone XS and newer, Google Pixel 3 and newer, and Samsung Galaxy S20 and newer. Check your device settings to confirm.",
  },
];

const relatedPlans = [
  {
    id: "1",
    data: "5GB",
    validity: "7 Days",
    network: "4G/5G",
    price: "$5.99",
    savings: "20%",
  },
  {
    id: "2",
    data: "20GB",
    validity: "30 Days",
    network: "5G",
    price: "$14.99",
    savings: "30%",
  },
  {
    id: "3",
    data: "Unlimited",
    validity: "15 Days",
    network: "5G",
    price: "$24.99",
    savings: "15%",
  },
];

export default function PlanDetailRoute() {
  const router = useRouter();

  const [isFavorite, setIsFavorite] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleShare = () => {
    Alert.alert("Share", "Share functionality coming soon!");
  };

  const handleBuyNow = () => {
    Alert.alert("Checkout", "Proceeding to checkout...");
    // TODO: router.push("/checkout")
  };

  const handleAddToWishlist = () => {
    Alert.alert("Wishlist", "Added to wishlist!");
  };

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <View className="absolute top-0 left-0 right-0 z-20 px-6 pt-12 pb-6">
        <LinearGradient
          colors={["rgba(0,0,0,0.4)", "rgba(0,0,0,0)"]}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
          }}
        />

        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="p-2.5 rounded-full bg-white/90"
          >
            <ArrowLeft size={20} color="#111827" />
          </Pressable>

          <View className="flex-row items-center">
            <Pressable
              onPress={() => setIsFavorite((prev) => !prev)}
              className="p-2.5 rounded-full bg-white/90 mr-2"
            >
              <Heart
                size={20}
                color={isFavorite ? "#7B61FF" : "#111827"}
                fill={isFavorite ? "#7B61FF" : "transparent"}
              />
            </Pressable>

            <Pressable
              onPress={handleShare}
              className="p-2.5 rounded-full bg-white/90"
            >
              <Share2 size={20} color="#111827" />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 220 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["#5B8DEF", "#7B61FF"]}
          style={{
            height: 256,
            overflow: "hidden",
          }}
        >
          <View className="absolute inset-0 opacity-20">
            <Text
              style={{
                position: "absolute",
                top: 40,
                right: 40,
                fontSize: 88,
              }}
            >
              🏯
            </Text>

            <Text
              style={{
                position: "absolute",
                bottom: 40,
                left: 40,
                fontSize: 64,
              }}
            >
              🗾
            </Text>
          </View>

          <View className="absolute bottom-6 left-6 right-6">
            <Text style={{ fontSize: 72, marginBottom: 12 }}>🇯🇵</Text>
            <Text className="text-3xl font-bold text-white">Japan</Text>
          </View>
        </LinearGradient>

        <View className="px-6 -mt-8 z-10">
          <View className="bg-white rounded-3xl p-6 border border-[#F3F4F6]">
            <View className="absolute top-4 right-4 px-3 py-1.5 bg-[#ECFDF5] rounded-full">
              <Text className="text-[#15803D] text-xs font-semibold">
                Save 25%
              </Text>
            </View>

            <View className="flex-row mb-6">
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold text-[#111827] mb-1">
                  10GB
                </Text>

                <Text className="text-xs text-[#4B5563]">Data</Text>
              </View>

              <View className="flex-1 items-center border-x border-[#E5E7EB]">
                <Text className="text-2xl font-bold text-[#111827] mb-1">
                  15 Days
                </Text>

                <Text className="text-xs text-[#4B5563]">Validity</Text>
              </View>

              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold text-[#7B61FF] mb-1">
                  5G
                </Text>

                <Text className="text-xs text-[#4B5563]">Network</Text>
              </View>
            </View>

            <View className="pt-4 border-t border-[#F3F4F6] flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-[#4B5563] mb-1">Total Price</Text>

                <View className="flex-row items-baseline">
                  <Text className="text-3xl font-bold text-[#111827] mr-2">
                    $8.99
                  </Text>

                  <Text className="text-lg text-[#9CA3AF] line-through">
                    $11.99
                  </Text>
                </View>
              </View>

              <View className="items-end">
                <Text className="text-xs text-[#4B5563] mb-1">Per GB</Text>

                <Text className="text-lg font-semibold text-[#7B61FF]">
                  $0.90
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="px-6 mt-6">
          <Text className="text-xl font-semibold text-[#111827] mb-4">
            What's Included
          </Text>

          <View className="flex-row flex-wrap justify-between gap-y-3">
            {features.map(({ icon: Icon, label, color }) => (
              <View
                key={label}
                style={{ width: "48%" }}
                className="bg-white rounded-2xl p-4 border border-[#F3F4F6]"
              >
                <View className="w-10 h-10 rounded-xl bg-[#F5F0FF] items-center justify-center mb-3">
                  <Icon size={20} color={color} />
                </View>

                <Text className="text-sm font-medium text-[#111827]">
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="px-6 mt-6">
          <Text className="text-xl font-semibold text-[#111827] mb-4">
            Network Coverage
          </Text>

          <View className="bg-white rounded-2xl p-5 border border-[#F3F4F6]">
            {networks.map((network, index) => (
              <View key={network.name}>
                {index > 0 && <View className="h-px bg-[#F3F4F6] my-4" />}

                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-semibold text-[#111827] mb-1">
                      {network.name}
                    </Text>

                    <View className="flex-row items-center">
                      <Text className="text-xs text-[#4B5563]">
                        {network.coverage}
                      </Text>

                      <Text className="text-xs text-[#9CA3AF] mx-2">•</Text>

                      <Text className="text-xs text-[#16A34A] font-medium">
                        {network.quality}
                      </Text>
                    </View>
                  </View>

                  <Check size={20} color="#16A34A" />
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className="px-6 mt-6">
          <Text className="text-xl font-semibold text-[#111827] mb-4">
            Plan Details
          </Text>

          <View className="bg-white rounded-2xl p-5 border border-[#F3F4F6]">
            {[
              ["Data", "10GB"],
              ["Validity", "15 Days"],
              ["Activation Policy", "On First Use"],
              ["Speed", "5G / 4G LTE"],
            ].map(([label, value], index) => (
              <View key={label}>
                {index > 0 && <View className="h-px bg-[#F3F4F6] my-4" />}

                <View className="flex-row justify-between">
                  <Text className="text-[#4B5563]">{label}</Text>
                  <Text className="font-semibold text-[#111827]">{value}</Text>
                </View>
              </View>
            ))}

            <View className="h-px bg-[#F3F4F6] my-4" />

            <View className="flex-row justify-between">
              <Text className="text-[#4B5563]">Tethering Support</Text>

              <View className="flex-row items-center">
                <Check size={16} color="#16A34A" />
                <Text className="font-semibold text-[#16A34A] ml-1">
                  Enabled
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="px-6 mt-6">
          <Text className="text-xl font-semibold text-[#111827] mb-4">
            Frequently Asked Questions
          </Text>

          <View className="bg-white rounded-2xl border border-[#F3F4F6] overflow-hidden">
            {faqs.map((faq, index) => (
              <View key={faq.question}>
                {index > 0 && <View className="h-px bg-[#F3F4F6]" />}

                <Pressable
                  onPress={() => toggleFaq(index)}
                  className="px-5 py-4 flex-row items-center justify-between"
                >
                  <Text className="font-medium text-[#111827] flex-1 pr-4">
                    {faq.question}
                  </Text>

                  {expandedFaq === index ? (
                    <ChevronUp size={20} color="#9CA3AF" />
                  ) : (
                    <ChevronDown size={20} color="#9CA3AF" />
                  )}
                </Pressable>

                {expandedFaq === index && (
                  <View className="px-5 pb-4">
                    <Text className="text-sm text-[#4B5563] leading-5">
                      {faq.answer}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        <View className="mt-6 mb-6">
          <View className="px-6 mb-4">
            <Text className="text-xl font-semibold text-[#111827]">
              More Plans for Japan
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
          >
            {relatedPlans.map((plan) => (
              <Pressable
                key={plan.id}
                className="bg-white rounded-2xl p-4 border border-[#F3F4F6] mr-3"
                style={{ width: 176 }}
              >
                <View className="absolute top-3 right-3 px-2 py-1 bg-[#ECFDF5] rounded-full">
                  <Text className="text-[#15803D] text-xs font-semibold">
                    -{plan.savings}
                  </Text>
                </View>

                <View className="mb-3">
                  <Text className="text-2xl font-bold text-[#111827] mb-1">
                    {plan.data}
                  </Text>

                  <Text className="text-xs text-[#4B5563]">
                    {plan.validity}
                  </Text>
                </View>

                <View className="mb-3">
                  <Text className="text-xs text-[#7B61FF] font-medium">
                    {plan.network}
                  </Text>
                </View>

                <Text className="text-xl font-bold text-[#111827]">
                  {plan.price}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <View className="border-t border-[#E5E7EB] bg-white px-6 py-4">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-sm text-[#4B5563]">Total Price</Text>
            <Text className="text-2xl font-bold text-[#111827]">$8.99</Text>
          </View>

          <View className="items-end">
            <Text className="text-xs text-[#16A34A] font-medium">Save 25%</Text>

            <Text className="text-sm text-[#9CA3AF] line-through">$11.99</Text>
          </View>
        </View>

        <View className="flex-row">
          <Pressable
            onPress={handleAddToWishlist}
            className="flex-1 py-3.5 bg-white border-2 border-[#7B61FF] rounded-2xl items-center mr-3"
          >
            <Text className="text-[#7B61FF] font-medium">Add to Wishlist</Text>
          </Pressable>

          <Pressable
            onPress={handleBuyNow}
            className="flex-1 py-3.5 bg-[#7B61FF] rounded-2xl items-center"
          >
            <Text className="text-white font-medium">Buy Now</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
