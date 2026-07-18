import { CustomLinearGradient } from "@/components/ui/CustomLinearGradient";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useAuth } from "@/lib/auth";
import { getPlanDetails } from "@/lib/catalogQueries";

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

type CountryRow = {
  id: string;
  name: string;
  iso2: string;
  iso3?: string | null;
};

type RegionRow = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

type PlanDetails = {
  id: string;
  title: string;
  description?: string | null;
  data_amount_gb?: number | string | null;
  is_unlimited: boolean;
  validity_days: number;
  price: number | string;
  original_price?: number | string | null;
  discount_percent?: number | null;
  currency: string;
  provider_name: string;
  activation_policy: string;
  tethering_supported: boolean;
  supports_5g: boolean;
  plan_countries?: { countries?: CountryRow | CountryRow[] | null }[] | null;
  plan_regions?: { regions?: RegionRow | RegionRow[] | null }[] | null;
  plan_networks?: {
    id?: string;
    network_name: string;
    coverage_note?: string | null;
    network_type: string;
    countries?: Pick<CountryRow, "id" | "name" | "iso2"> | null;
  }[] | null;
  plan_features?: {
    id?: string;
    icon: string;
    label: string;
    sort_order: number;
  }[] | null;
};

function rows<T>(value: T | T[] | null | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : Number(value);
}

function formatPrice(value: number | string, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(toNumber(value));
}

function formatData(plan: PlanDetails) {
  if (plan.is_unlimited) return "Unlimited";

  const amount = toNumber(plan.data_amount_gb);
  return `${Number.isInteger(amount) ? amount : amount.toFixed(2)}GB`;
}

function formatValidity(days: number) {
  return `${days} ${days === 1 ? "Day" : "Days"}`;
}

function flagFromIso2(iso2: string | null | undefined) {
  const normalizedIso2 = iso2?.trim().toUpperCase();

  if (!normalizedIso2 || normalizedIso2.length !== 2) return "\uD83C\uDF0D";

  return normalizedIso2
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
}

function getNetworkLabel(plan: PlanDetails) {
  const networkTypes = new Set(
    (plan.plan_networks ?? [])
      .map((network) => network.network_type)
      .filter(Boolean),
  );

  if (plan.supports_5g || networkTypes.has("5G")) return "5G";
  if (networkTypes.has("LTE")) return "LTE";
  return "4G";
}

export default function PlanDetailRoute() {
  const router = useRouter();
  const { user: authUser, initializing, signingIn, signInWithGoogle } = useAuth();
  const { id = "1" } = useLocalSearchParams<{ id?: string }>();

  const [plan, setPlan] = useState<PlanDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPlan() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const { data, error } = await getPlanDetails(id);

        if (!isMounted) return;

        if (error || !data) {
          console.error("Plan details load failed", error);
          setPlan(null);
          setLoadError("Unable to load this plan.");
        } else {
          setPlan(data as unknown as PlanDetails);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Plan details load failed", error);
        setPlan(null);
        setLoadError("Unable to load this plan.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadPlan();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const [country] =
    plan?.plan_countries?.flatMap((entry) => rows(entry.countries)) ?? [];
  const [region] =
    plan?.plan_regions?.flatMap((entry) => rows(entry.regions)) ?? [];
  const destinationName = country?.name ?? region?.name ?? plan?.title ?? "Plan";
  const destinationFlag = country ? flagFromIso2(country.iso2) : "\uD83C\uDF0D";
  const dataLabel = plan ? formatData(plan) : "-";
  const validityLabel = plan ? formatValidity(plan.validity_days) : "-";
  const networkLabel = plan ? getNetworkLabel(plan) : "-";
  const priceLabel = plan ? formatPrice(plan.price, plan.currency) : "-";
  const originalPrice = plan ? toNumber(plan.original_price) : 0;
  const originalPriceLabel =
    plan && originalPrice > toNumber(plan.price)
      ? formatPrice(originalPrice, plan.currency)
      : null;
  const savingsLabel =
    plan && (plan.discount_percent ?? 0) > 0
      ? `Save ${plan.discount_percent}%`
      : null;
  const perGbLabel =
    plan && !plan.is_unlimited && toNumber(plan.data_amount_gb) > 0
      ? formatPrice(
          toNumber(plan.price) / toNumber(plan.data_amount_gb),
          plan.currency,
        )
      : "-";
  const networkRows = plan?.plan_networks?.length
    ? plan.plan_networks.map((network) => ({
        name: network.network_name,
        coverage: network.coverage_note ?? network.countries?.name ?? "Coverage",
        quality: network.network_type,
      }))
    : networks;
  const includedFeatures = plan?.plan_features?.length
    ? [...plan.plan_features]
        .sort((first, second) => first.sort_order - second.sort_order)
        .map((feature) => feature.label)
    : features.map((feature) => feature.label);
  const detailRows = [
    ["Data", dataLabel],
    ["Validity", validityLabel],
    ["Activation Policy", plan?.activation_policy ?? "-"],
    ["Speed", networkLabel],
  ];

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleShare = () => {
    Alert.alert("Share", "Share functionality coming soon!");
  };

  const handleBuyNow = async () => {
    if (!plan) return;

    if (!authUser) {
      const session = await signInWithGoogle();

      if (!session) return;
    }

    router.push({ pathname: "/checkout", params: { planId: plan.id } });
  };

  const handleAddToWishlist = () => {
    Alert.alert("Wishlist", "Added to wishlist!");
  };

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <View className="absolute top-0 left-0 right-0 z-20 px-6 pt-12 pb-6">
        <CustomLinearGradient
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
        {isLoading ? (
          <View className="px-6 pt-28">
            <View className="items-center rounded-2xl border border-[#F3F4F6] bg-white p-5">
              <ActivityIndicator color="#7B61FF" />
              <Text className="mt-3 text-sm font-medium text-[#4B5563]">
                Loading plan...
              </Text>
            </View>
          </View>
        ) : null}

        {!isLoading && loadError ? (
          <View className="px-6 pt-28">
            <View className="rounded-2xl border border-[#FEE2E2] bg-white p-5">
              <Text className="text-sm font-semibold text-[#991B1B]">
                {loadError}
              </Text>
            </View>
          </View>
        ) : null}

        {plan ? (
          <>
        <CustomLinearGradient
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
            <Text style={{ fontSize: 72, marginBottom: 12 }}>
              {destinationFlag}
            </Text>
            <Text className="text-3xl font-bold text-white">
              {destinationName}
            </Text>
          </View>
        </CustomLinearGradient>

        <View className="px-6 -mt-8 z-10">
          <View className="bg-white rounded-3xl p-6 border border-[#F3F4F6]">
            {savingsLabel ? (
              <View className="absolute top-4 right-4 px-3 py-1.5 bg-[#ECFDF5] rounded-full">
                <Text className="text-[#15803D] text-xs font-semibold">
                  {savingsLabel}
                </Text>
              </View>
            ) : null}

            <View className="flex-row mb-6">
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold text-[#111827] mb-1">
                  {dataLabel}
                </Text>

                <Text className="text-xs text-[#4B5563]">Data</Text>
              </View>

              <View className="flex-1 items-center border-x border-[#E5E7EB]">
                <Text className="text-2xl font-bold text-[#111827] mb-1">
                  {validityLabel}
                </Text>

                <Text className="text-xs text-[#4B5563]">Validity</Text>
              </View>

              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold text-[#7B61FF] mb-1">
                  {networkLabel}
                </Text>

                <Text className="text-xs text-[#4B5563]">Network</Text>
              </View>
            </View>

            <View className="pt-4 border-t border-[#F3F4F6] flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-[#4B5563] mb-1">Total Price</Text>

                <View className="flex-row items-baseline">
                  <Text className="text-3xl font-bold text-[#111827] mr-2">
                    {priceLabel}
                  </Text>

                  {originalPriceLabel ? (
                    <Text className="text-lg text-[#9CA3AF] line-through">
                      {originalPriceLabel}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View className="items-end">
                <Text className="text-xs text-[#4B5563] mb-1">Per GB</Text>

                <Text className="text-lg font-semibold text-[#7B61FF]">
                  {perGbLabel}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="px-6 mt-6">
          <Text className="text-xl font-semibold text-[#111827] mb-4">
            {"What's Included"}
          </Text>

          <View className="flex-row flex-wrap justify-between gap-y-3">
            {includedFeatures.map((label, index) => {
              const { icon: Icon, color } = features[index % features.length];

              return (
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
              );
            })}
          </View>
        </View>

        <View className="px-6 mt-6">
          <Text className="text-xl font-semibold text-[#111827] mb-4">
            Network Coverage
          </Text>

          <View className="bg-white rounded-2xl p-5 border border-[#F3F4F6]">
            {networkRows.map((network, index) => (
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
            {detailRows.map(([label, value], index) => (
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
                  {plan.tethering_supported ? "Enabled" : "Disabled"}
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
              More Plans for {destinationName}
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
          </>
        ) : null}
      </ScrollView>

      <View className="border-t border-[#E5E7EB] bg-white px-6 py-4">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-sm text-[#4B5563]">Total Price</Text>
            <Text className="text-2xl font-bold text-[#111827]">
              {priceLabel}
            </Text>
          </View>

          {savingsLabel || originalPriceLabel ? (
            <View className="items-end">
              {savingsLabel ? (
                <Text className="text-xs text-[#16A34A] font-medium">
                  {savingsLabel}
                </Text>
              ) : null}

              {originalPriceLabel ? (
                <Text className="text-sm text-[#9CA3AF] line-through">
                  {originalPriceLabel}
                </Text>
              ) : null}
            </View>
          ) : null}
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
            disabled={!plan || initializing || signingIn}
            className={`flex-1 py-3.5 rounded-2xl items-center ${
              !plan || initializing || signingIn
                ? "bg-gray-300"
                : "bg-[#7B61FF]"
            }`}
          >
            <Text className="text-white font-medium">Buy Now</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
