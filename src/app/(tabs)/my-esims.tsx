import { CustomLinearGradient } from "@/components/ui/CustomLinearGradient";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  Bell,
  Calendar,
  ChevronRight,
  Globe,
  Search,
  Signal,
  Smartphone,
  Wifi,
  X,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutUp,
  LinearTransition,
} from "react-native-reanimated";

import { Flag } from "@/components/airconnect/ui";
import { getProfileUser } from "@/features/profile/utils";
import { useAuth } from "@/lib/auth";
import { useI18n, type LanguageCode } from "@/lib/i18n";
import {
  getPlanDisplay,
  toNumber,
  type PlanDisplayRow,
} from "@/lib/planDisplay";
import { getUserEsims } from "@/lib/purchaseQueries";

interface ESIMCard {
  id: string;
  planId: string;
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

type UserEsimRow = {
  id: string;
  order_id: string;
  status: string;
  data_used_gb: number | string;
  expires_at: string | null;
  created_at: string;
  esim_plans?: PlanDisplayRow | PlanDisplayRow[] | null;
};

type FilterType = "all" | "active" | "ready" | "expired";


const filters: { key: FilterType; labelKey: string }[] = [
  { key: "all", labelKey: "common.all" },
  { key: "active", labelKey: "common.active" },
  { key: "ready", labelKey: "common.readyToInstall" },
  { key: "expired", labelKey: "common.expired" },
];

function firstRow<T>(value: T | T[] | null | undefined) {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function formatDate(value: string | null, language: LanguageCode) {
  if (!value) return language === "vi" ? "Chưa bắt đầu" : "Not started";

  return new Date(value).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDaysRemaining(value: string | null) {
  if (!value) return 0;

  const diff = new Date(value).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

function normalizeStatus(
  status: string,
  expiresAt: string | null,
): ESIMCard["status"] {
  if (status === "expired") return "expired";

  if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) {
    return "expired";
  }

  return status === "active" ? "active" : "ready";
}

function toCard(row: UserEsimRow, language: LanguageCode): ESIMCard | null {
  const plan = firstRow(row.esim_plans);

  if (!plan) return null;

  const display = getPlanDisplay(plan);
  const status = normalizeStatus(row.status, row.expires_at);
  const isUnlimited = plan.is_unlimited;
  const dataTotal = isUnlimited ? 100 : toNumber(plan.data_amount_gb);
  const dataUsed = isUnlimited
    ? 0
    : Math.min(toNumber(row.data_used_gb), dataTotal);

  return {
    id: row.id,
    planId: plan.id,
    flag: display.flag,
    country: display.name,
    planName: plan.title,
    data: display.data,
    days: display.validity,
    status,
    dataUsed,
    dataTotal,
    dataUnit: isUnlimited ? "%" : "GB",
    daysRemaining:
      status === "ready" && !row.expires_at
        ? plan.validity_days
        : status === "expired"
          ? 0
          : getDaysRemaining(row.expires_at),
    daysTotal: plan.validity_days,
    expiryDate: formatDate(row.expires_at, language),
    network: display.network,
  };
}

function StatusBadge({ status }: { status: ESIMCard["status"] }) {
  const { t } = useI18n();

  if (status === "active") {
    return (
      <View className="flex-row items-center px-2.5 py-1 rounded-full bg-[#ECFDF5]">
        <View className="w-1.5 h-1.5 rounded-full bg-[#10B981] mr-1.5" />
        <Text className="text-xs font-semibold text-[#059669]">
          {t("common.active")}
        </Text>
      </View>
    );
  }

  if (status === "ready") {
    return (
      <View className="flex-row items-center px-2.5 py-1 rounded-full bg-[#F5F0FF]">
        <Signal size={12} color="#6915E0" />
        <Text className="text-xs font-semibold text-[#6915E0] ml-1.5">
          {t("common.readyToInstall")}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-row items-center px-2.5 py-1 rounded-full bg-[#F3F4F6]">
      <View className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF] mr-1.5" />
      <Text className="text-xs font-semibold text-[#6B7280]">
        {t("common.expired")}
      </Text>
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
  const { t } = useI18n();
  const [width, setWidth] = useState(0);

  const percent = total > 0 ? Math.min((used / total) * 100, 100) : 100;
  const isUnlimited = unit === "%";
  const remaining = isUnlimited
    ? t("common.unlimited")
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
        <Text className="text-xs text-[#6B7280]">
          {t("myEsims.dataRemaining")}
        </Text>

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
  onViewDetails?: (esim: ESIMCard) => void;
}) {
  const { t, translateName } = useI18n();
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
          <Flag value={esim.flag} />

          <View className="flex-1 ml-3">
            <View className="flex-row items-center mb-0.5">
              <Text className="font-bold text-[#111827]">
                {translateName(esim.country)}
              </Text>
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
              {t("myEsims.daysLeft", { count: esim.daysRemaining })}
            </Text>
          </View>
        )}

        <View className="mt-4 flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Calendar size={14} color="#6B7280" />

            <Text className="text-xs text-[#6B7280] ml-1.5" numberOfLines={1}>
              {esim.status === "expired"
                ? t("common.expired")
                : t("common.expires")}{" "}
              {esim.expiryDate}
            </Text>
          </View>

          <Pressable
            onPress={() => onViewDetails?.(esim)}
            className="flex-row items-center ml-3"
          >
            <Text className="text-xs font-semibold text-[#6915E0]">
              {t("common.viewDetails")}
            </Text>
            <ChevronRight size={14} color="#6915E0" />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

function EmptyState({ onBrowse }: { onBrowse?: () => void }) {
  const { t } = useI18n();

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

      <Text className="font-bold text-[#111827] mb-2">
        {t("myEsims.noEsims")}
      </Text>

      <Text className="text-sm text-[#6B7280] mb-8 text-center leading-5">
        {t("myEsims.noEsimsBody")}
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
          <Text className="text-white font-semibold mr-2">
            {t("common.browsePlans")}
          </Text>
          <ArrowRight size={16} color="#FFFFFF" />
        </CustomLinearGradient>
      </Pressable>
    </Animated.View>
  );
}

export default function MyESIMsRoute() {
  const router = useRouter();
  const { language, t, translateName } = useI18n();
  const {
    user: authUser,
    initializing,
    signingIn,
    error,
    signInWithGoogle,
  } = useAuth();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [esims, setEsims] = useState<ESIMCard[]>([]);
  const [isEsimsLoading, setIsEsimsLoading] = useState(Boolean(authUser));
  const [hasLoadedEsims, setHasLoadedEsims] = useState(false);
  const [esimsError, setEsimsError] = useState<string | null>(null);
  const loadRequestId = React.useRef(0);

  const loadEsims = React.useCallback(async () => {
    const requestId = loadRequestId.current + 1;
    loadRequestId.current = requestId;

    if (!authUser) {
      setEsims([]);
      setIsEsimsLoading(false);
      setHasLoadedEsims(false);
      return;
    }

    setIsEsimsLoading(true);
    setHasLoadedEsims(false);
    setEsimsError(null);

    try {
      const { data, error } = await getUserEsims(authUser.id);

      if (requestId !== loadRequestId.current) return;

      if (error) {
        console.error("My eSIMs load failed", error);
        setEsimsError(error.message);
        setEsims([]);
        return;
      }

      setEsims(
        ((data ?? []) as unknown as UserEsimRow[])
          .map((row) => toCard(row, language))
          .filter((card): card is ESIMCard => Boolean(card)),
      );
    } catch (error) {
      if (requestId !== loadRequestId.current) return;

      console.error("My eSIMs load failed", error);
      setEsimsError(
        error instanceof Error ? error.message : t("common.somethingWrong"),
      );
      setEsims([]);
    } finally {
      if (requestId === loadRequestId.current) {
        setIsEsimsLoading(false);
        setHasLoadedEsims(true);
      }
    }
  }, [authUser, language, t]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadEsims();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadEsims]);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return esims.filter((e) => {
      const matchFilter =
        activeFilter === "all" ||
        (activeFilter === "active" && e.status === "active") ||
        (activeFilter === "ready" && e.status === "ready") ||
        (activeFilter === "expired" && e.status === "expired");

      const matchSearch =
        query === "" ||
        [e.country, translateName(e.country), e.planName, e.data, e.network]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchFilter && matchSearch;
    });
  }, [activeFilter, esims, searchQuery, translateName]);

  const activeCount = esims.filter((e) => e.status === "active").length;
  const normalizedSearchQuery = searchQuery.trim();

  if (initializing) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F9FAFB] px-6">
        <ActivityIndicator color="#6915E0" />
        <Text className="mt-3 text-sm font-medium text-[#6B7280]">
          {t("common.checkingSignIn")}
        </Text>
      </View>
    );
  }

  if (!authUser) {
    return (
      <View className="flex-1 bg-[#F9FAFB]">
        <View className="bg-white px-6 pt-14 pb-5">
          <Text className="font-bold text-[#111827] text-[26px]">
            {t("myEsims.title")}
          </Text>
          <Text className="text-sm text-[#6B7280] mt-0.5">
            {t("myEsims.signInSubtitle")}
          </Text>
        </View>

        <View className="flex-1 justify-center px-6">
          <View className="rounded-3xl bg-white p-6 border border-[#F3F4F6]">
            <View className="mb-5 h-14 w-14 items-center justify-center rounded-2xl bg-[#F5F0FF]">
              <Smartphone size={28} color="#6915E0" />
            </View>

            <Text className="text-2xl font-bold text-[#111827]">
              {t("myEsims.signInTitle")}
            </Text>
            <Text className="mt-2 text-sm leading-5 text-[#6B7280]">
              {t("myEsims.signInBody")}
            </Text>

            {error ? (
              <Text className="mt-4 text-sm font-medium text-red-600">
                {error}
              </Text>
            ) : null}

            <Pressable
              disabled={signingIn}
              onPress={() => void signInWithGoogle()}
              className={`mt-6 flex-row items-center justify-center rounded-2xl bg-[#6915E0] px-5 py-4 ${
                signingIn ? "opacity-70" : ""
              }`}
            >
              {signingIn ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Globe size={20} color="#FFFFFF" />
              )}
              <Text className="ml-3 text-base font-bold text-white">
                {signingIn
                  ? t("common.openingGoogle")
                  : t("common.continueWithGoogle")}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  const profileUser = getProfileUser(authUser, language);

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <View className="bg-white px-6 pt-14 pb-5">
        <View className="flex-row items-start justify-between mb-1">
          <View>
            <Text className="font-bold text-[#111827] text-[26px]">
              {t("myEsims.title")}
            </Text>

            <Text className="text-sm text-[#6B7280] mt-0.5">
              {t("myEsims.manageSubtitle")}
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
              <Text className="text-white font-bold text-sm">
                {profileUser.avatar}
              </Text>
            </CustomLinearGradient>
          </View>
        </View>

        {activeCount > 0 && (
          <View className="mt-3 flex-row items-center self-start bg-[#ECFDF5] px-3 py-1.5 rounded-full">
            <View className="w-2 h-2 rounded-full bg-[#10B981] mr-2" />
            <Text className="text-xs font-semibold text-[#047857]">
              {t(activeCount > 1 ? "myEsims.plansActive" : "myEsims.planActive", {
                count: activeCount,
              })}
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
              placeholder={t("common.searchCountryRegion")}
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-3 pr-3 text-sm text-[#374151]"
            />

            {normalizedSearchQuery ? (
              <Pressable
                accessibilityLabel={t("common.clear")}
                onPress={() => setSearchQuery("")}
              >
                <X size={16} color="#9CA3AF" />
              </Pressable>
            ) : null}
          </View>
        </View>

        {normalizedSearchQuery ? (
          <View className="mb-3 flex-row items-center justify-between px-6">
            <Text className="text-sm font-semibold text-[#111827]">
              {t("common.searchResults")}
            </Text>
            <Text className="text-xs font-medium text-[#6B7280]">
              {t("common.resultsCount", { count: filtered.length })}
            </Text>
          </View>
        ) : null}

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
                      {t(f.labelKey)}
                    </Text>
                  </CustomLinearGradient>
                ) : (
                  <View className="px-4 py-2 rounded-full bg-white border border-[#E5E7EB]">
                    <Text className="text-[#4B5563] text-sm font-medium">
                      {t(f.labelKey)}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="px-6">
          {isEsimsLoading || !hasLoadedEsims ? (
            <View className="items-center py-12">
              <ActivityIndicator color="#6915E0" />
              <Text className="mt-3 text-sm font-medium text-[#6B7280]">
                {t("common.loadingEsims")}
              </Text>
            </View>
          ) : esimsError ? (
            <View className="items-center py-12">
              <Text className="text-center text-sm font-medium text-red-600">
                {esimsError}
              </Text>
              <Pressable
                onPress={loadEsims}
                className="mt-4 rounded-2xl bg-[#6915E0] px-5 py-3"
              >
                <Text className="font-bold text-white">{t("common.retry")}</Text>
              </Pressable>
            </View>
          ) : filtered.length > 0 ? (
            filtered.map((esim, index) => (
              <ESIMCardItem
                key={esim.id}
                esim={esim}
                index={index}
                onViewDetails={(selectedEsim) => {
                  router.push({
                    pathname: "/esim-details",
                    params: {
                      id: selectedEsim.planId,
                      userEsimId: selectedEsim.id,
                    },
                  });
                }}
              />
            ))
          ) : normalizedSearchQuery !== "" ? (
            <Animated.View
              key="no-results"
              entering={FadeIn.duration(250)}
              exiting={FadeOut.duration(200)}
              className="py-12 items-center"
            >
              <Text className="text-[#9CA3AF] text-sm">
                {t("myEsims.noResults", { query: normalizedSearchQuery })}
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
