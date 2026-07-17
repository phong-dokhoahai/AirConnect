import { CustomLinearGradient } from "@/components/ui/CustomLinearGradient";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  Bell,
  Calendar,
  ChevronRight,
  Search,
  Signal,
  Smartphone,
  Wifi,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutUp,
  LinearTransition,
} from "react-native-reanimated";

interface ESIMCard {
  id: string;
  flag: string;
  country: string;
  planName: string;
  data: string;
  days: string;
  status: "active" | "ready" | "expired";
  dataUsed: number;
  dataTotal: number;
  dataUnit: string;
  daysRemaining: number;
  daysTotal: number;
  expiryDate: string;
  network: string;
}

type FilterType = "all" | "active" | "ready" | "expired";

const esims: ESIMCard[] = [
  {
    id: "1",
    flag: "🇯🇵",
    country: "Japan",
    planName: "Standard Plan",
    data: "10GB",
    days: "30 Days",
    status: "active",
    dataUsed: 2.8,
    dataTotal: 10,
    dataUnit: "GB",
    daysRemaining: 18,
    daysTotal: 30,
    expiryDate: "Jun 28, 2026",
    network: "5G",
  },
  {
    id: "2",
    flag: "🇪🇺",
    country: "Europe",
    planName: "Premium Plan",
    data: "20GB",
    days: "60 Days",
    status: "ready",
    dataUsed: 0,
    dataTotal: 20,
    dataUnit: "GB",
    daysRemaining: 60,
    daysTotal: 60,
    expiryDate: "Aug 9, 2026",
    network: "4G/5G",
  },
  {
    id: "3",
    flag: "🇹🇭",
    country: "Thailand",
    planName: "Unlimited Plan",
    data: "Unlimited",
    days: "7 Days",
    status: "expired",
    dataUsed: 100,
    dataTotal: 100,
    dataUnit: "%",
    daysRemaining: 0,
    daysTotal: 7,
    expiryDate: "May 15, 2026",
    network: "4G",
  },
];

const filters: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "ready", label: "Ready to Install" },
  { key: "expired", label: "Expired" },
];

function StatusBadge({ status }: { status: ESIMCard["status"] }) {
  if (status === "active") {
    return (
      <View className="flex-row items-center px-2.5 py-1 rounded-full bg-[#ECFDF5]">
        <View className="w-1.5 h-1.5 rounded-full bg-[#10B981] mr-1.5" />
        <Text className="text-xs font-semibold text-[#059669]">Active</Text>
      </View>
    );
  }

  if (status === "ready") {
    return (
      <View className="flex-row items-center px-2.5 py-1 rounded-full bg-[#F5F0FF]">
        <Signal size={12} color="#6915E0" />
        <Text className="text-xs font-semibold text-[#6915E0] ml-1.5">
          Ready to Install
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-row items-center px-2.5 py-1 rounded-full bg-[#F3F4F6]">
      <View className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF] mr-1.5" />
      <Text className="text-xs font-semibold text-[#6B7280]">Expired</Text>
    </View>
  );
}

function DataProgressBar({
  used,
  total,
  unit,
  status,
}: {
  used: number;
  total: number;
  unit: string;
  status: ESIMCard["status"];
}) {
  const [width, setWidth] = useState(0);

  const percent = total > 0 ? Math.min((used / total) * 100, 100) : 100;
  const isUnlimited = unit === "%";
  const remaining = isUnlimited
    ? "Unlimited"
    : `${(total - used).toFixed(1)} ${unit}`;
  const totalLabel = isUnlimited ? "∞" : `${total} ${unit}`;

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(percent);
    }, 150);

    return () => clearTimeout(timer);
  }, [percent]);

  return (
    <View>
      <View className="flex-row items-center justify-between mb-1.5">
        <Text className="text-xs text-[#6B7280]">Data Remaining</Text>

        <Text className="text-xs font-semibold text-[#111827]">
          {remaining}
          <Text className="text-[#9CA3AF] font-normal"> / {totalLabel}</Text>
        </Text>
      </View>

      <View className="h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
        {status === "expired" ? (
          <View
            style={{
              height: "100%",
              width: isUnlimited ? "100%" : `${width}%`,
              borderRadius: 999,
              backgroundColor: "#D1D5DB",
            }}
          />
        ) : (
          <CustomLinearGradient
            colors={
              status === "ready"
                ? ["#6915E0", "#9864E1"]
                : ["#5B8DEF", "#6915E0"]
            }
            style={{
              height: "100%",
              width: isUnlimited ? "100%" : `${width}%`,
              borderRadius: 999,
            }}
          />
        )}
      </View>
    </View>
  );
}

function ESIMCardItem({
  esim,
  index,
  onViewDetails,
}: {
  esim: ESIMCard;
  index: number;
  onViewDetails?: (id: string) => void;
}) {
  const borderColor =
    esim.status === "active"
      ? "border-[#D1FAE5]"
      : esim.status === "ready"
        ? "border-[#E9D5FF]"
        : "border-[#F3F4F6]";

  const topColors: [string, string] =
    esim.status === "active"
      ? ["rgba(52,211,153,0.18)", "rgba(255,255,255,0)"]
      : esim.status === "ready"
        ? ["rgba(168,85,247,0.18)", "rgba(255,255,255,0)"]
        : ["rgba(229,231,235,0.6)", "rgba(255,255,255,0)"];

  const daysPercent =
    esim.daysTotal > 0 ? (esim.daysRemaining / esim.daysTotal) * 100 : 0;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).duration(300)}
      exiting={FadeOutUp.duration(200)}
      layout={LinearTransition.duration(250)}
      className={`bg-white rounded-3xl border ${borderColor} overflow-hidden mb-4`}
    >
      <CustomLinearGradient colors={topColors} style={{ height: 4 }} />

      <View className="p-5">
        <View className="flex-row items-center mb-4">
          <Text style={{ fontSize: 36, lineHeight: 42 }}>{esim.flag}</Text>

          <View className="flex-1 ml-3">
            <View className="flex-row items-center mb-0.5">
              <Text className="font-bold text-[#111827]">{esim.country}</Text>
              <Text className="text-[#D1D5DB] mx-2">·</Text>
              <Text className="text-xs text-[#6B7280] font-medium">
                {esim.planName}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Wifi size={12} color="#6B7280" />
              <Text className="text-xs text-[#6B7280] ml-1">{esim.data}</Text>
              <Text className="text-[#D1D5DB] mx-1.5">·</Text>
              <Text className="text-xs text-[#6B7280]">{esim.days}</Text>
              <Text className="text-[#D1D5DB] mx-1.5">·</Text>
              <Text className="text-xs text-[#6915E0] font-medium">
                {esim.network}
              </Text>
            </View>
          </View>

          <StatusBadge status={esim.status} />
        </View>

        <DataProgressBar
          used={esim.dataUsed}
          total={esim.dataTotal}
          unit={esim.dataUnit}
          status={esim.status}
        />

        {esim.status !== "expired" && (
          <View className="mt-3 flex-row items-center">
            <View className="flex-1 h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden">
              <CustomLinearGradient
                colors={
                  esim.status === "ready"
                    ? ["#6915E0", "#9864E1"]
                    : ["#5B8DEF", "#6915E0"]
                }
                style={{
                  height: "100%",
                  width: `${daysPercent}%`,
                  borderRadius: 999,
                }}
              />
            </View>

            <Text className="text-xs text-[#6B7280] ml-2">
              {esim.daysRemaining} days left
            </Text>
          </View>
        )}

        <View className="mt-4 flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Calendar size={14} color="#6B7280" />

            <Text className="text-xs text-[#6B7280] ml-1.5" numberOfLines={1}>
              {esim.status === "expired" ? "Expired" : "Expires"}{" "}
              {esim.expiryDate}
            </Text>
          </View>

          <Pressable
            onPress={() => onViewDetails?.(esim.id)}
            className="flex-row items-center ml-3"
          >
            <Text className="text-xs font-semibold text-[#6915E0]">
              View Details
            </Text>
            <ChevronRight size={14} color="#6915E0" />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

function EmptyState({ onBrowse }: { onBrowse?: () => void }) {
  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      exiting={FadeOut.duration(200)}
      className="items-center justify-center px-8 py-16"
    >
      <View className="relative mb-6">
        <View className="w-28 h-28 rounded-3xl bg-[#F5F0FF] items-center justify-center">
          <Smartphone size={56} color="rgba(105,21,224,0.3)" />
        </View>

        <CustomLinearGradient
          colors={["#5B8DEF", "#6915E0"]}
          style={{
            position: "absolute",
            top: -8,
            right: -8,
            width: 40,
            height: 40,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Signal size={20} color="#FFFFFF" />
        </CustomLinearGradient>
      </View>

      <Text className="font-bold text-[#111827] mb-2">No eSIMs yet</Text>

      <Text className="text-sm text-[#6B7280] mb-8 text-center leading-5">
        Purchase your first eSIM and stay connected anywhere in the world.
      </Text>

      <Pressable onPress={onBrowse}>
        <CustomLinearGradient
          colors={["#6915E0", "#9864E1"]}
          style={{
            paddingHorizontal: 24,
            paddingVertical: 14,
            borderRadius: 16,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text className="text-white font-semibold mr-2">Browse Plans</Text>
          <ArrowRight size={16} color="#FFFFFF" />
        </CustomLinearGradient>
      </Pressable>
    </Animated.View>
  );
}

export default function MyESIMsRoute() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    return esims.filter((e) => {
      const matchFilter =
        activeFilter === "all" ||
        (activeFilter === "active" && e.status === "active") ||
        (activeFilter === "ready" && e.status === "ready") ||
        (activeFilter === "expired" && e.status === "expired");

      const matchSearch =
        searchQuery === "" ||
        e.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.planName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchFilter && matchSearch;
    });
  }, [activeFilter, searchQuery]);

  const activeCount = esims.filter((e) => e.status === "active").length;

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <View className="bg-white px-6 pt-14 pb-5">
        <View className="flex-row items-start justify-between mb-1">
          <View>
            <Text className="font-bold text-[#111827] text-[26px]">
              My eSIMs
            </Text>

            <Text className="text-sm text-[#6B7280] mt-0.5">
              Manage your active and upcoming plans
            </Text>
          </View>

          <View className="flex-row items-center mt-1">
            <Pressable className="relative w-10 h-10 rounded-full bg-[#F3F4F6] items-center justify-center mr-2">
              <Bell size={20} color="#4B5563" />

              {activeCount > 0 && (
                <View className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#6915E0]" />
              )}
            </Pressable>

            <CustomLinearGradient
              colors={["#5B8DEF", "#6915E0"]}
              style={{
                width: 40,
                height: 40,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text className="text-white font-bold text-sm">J</Text>
            </CustomLinearGradient>
          </View>
        </View>

        {activeCount > 0 && (
          <View className="mt-3 flex-row items-center self-start bg-[#ECFDF5] px-3 py-1.5 rounded-full">
            <View className="w-2 h-2 rounded-full bg-[#10B981] mr-2" />
            <Text className="text-xs font-semibold text-[#047857]">
              {activeCount} plan{activeCount > 1 ? "s" : ""} active
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-4 pb-3">
          <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 border border-[#F3F4F6]">
            <Search size={16} color="#9CA3AF" />

            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search country or region"
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-3 text-sm text-[#374151]"
            />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: 16,
          }}
        >
          {filters.map((f) => {
            const isActive = activeFilter === f.key;

            return (
              <Pressable
                key={f.key}
                onPress={() => setActiveFilter(f.key)}
                style={{ marginRight: 8 }}
              >
                {isActive ? (
                  <CustomLinearGradient
                    colors={["#6915E0", "#9864E1"]}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 999,
                    }}
                  >
                    <Text className="text-white text-sm font-semibold">
                      {f.label}
                    </Text>
                  </CustomLinearGradient>
                ) : (
                  <View className="px-4 py-2 rounded-full bg-white border border-[#E5E7EB]">
                    <Text className="text-[#4B5563] text-sm font-medium">
                      {f.label}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="px-6">
          {filtered.length > 0 ? (
            filtered.map((esim, index) => (
              <ESIMCardItem
                key={esim.id}
                esim={esim}
                index={index}
                onViewDetails={(id) => {
                  router.push({ pathname: "/esim-details", params: { id } });
                }}
              />
            ))
          ) : searchQuery !== "" ? (
            <Animated.View
              key="no-results"
              entering={FadeIn.duration(250)}
              exiting={FadeOut.duration(200)}
              className="py-12 items-center"
            >
              <Text className="text-[#9CA3AF] text-sm">
                No eSIMs found for &quot;{searchQuery}&quot;
              </Text>
            </Animated.View>
          ) : (
            <EmptyState
              key="empty"
              onBrowse={() => {
                router.push("/(tabs)/explore");
              }}
            />
          )}
        </View>
      </ScrollView>

    </View>
  );
}
