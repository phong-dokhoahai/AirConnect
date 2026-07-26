import { CustomLinearGradient } from "@/components/ui/CustomLinearGradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Eye,
  EyeOff,
  Globe,
  Headphones,
  MessageCircle,
  MoreVertical,
  Play,
  Share2,
  Shield,
  Signal,
  Wifi,
  Zap,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  LinearTransition,
} from "react-native-reanimated";

import { getPlanDetails } from "@/lib/catalogQueries";
import { useI18n, type LanguageCode } from "@/lib/i18n";
import {
  getPlanDisplay,
  toNumber,
  type PlanDisplayRow,
} from "@/lib/planDisplay";

type ESIMStatus = "active" | "ready" | "expired";

type IconComponent = React.ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

const esimData = {
  id: "JP-2026-123456",
  flag: "🇯🇵",
  country: "Japan",
  planName: "Japan Premium Data Plan",
  data: "10GB",
  days: "30 Days",
  status: "active" as ESIMStatus,
  network: "5G",
  dataUsedGB: 2.8,
  dataTotalGB: 10,
  daysRemaining: 18,
  daysTotal: 30,
  startDate: "May 10, 2026",
  expiryDate: "June 09, 2026",
  coverage: "Japan",
  networkStatus: "Connected",
  iccid: "898520123456789012",
  activationCode: "LPA:1$rsp.example.com$ABCDE-12345-FGHIJ",
  smdpAddress: "rsp.example.com",
  supportedNetworks: ["NTT Docomo", "SoftBank", "KDDI", "Rakuten"],
  isInstalled: true,
};

type ESIMPlanRow = PlanDisplayRow & {
  plan_networks?: { network_name: string }[] | null;
};

function formatDate(date: Date, language: LanguageCode) {
  return date.toLocaleDateString(language === "vi" ? "vi" : "en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  });
}

function buildESIMData(
  plan: ESIMPlanRow,
  language: LanguageCode,
  t: (key: string, vars?: Record<string, string | number>) => string,
  translateName: (value: string | null | undefined) => string,
) {
  const display = getPlanDisplay(plan);
  const start = new Date();
  const expiry = new Date(start);
  expiry.setDate(expiry.getDate() + plan.validity_days);
  const dataTotalGB = plan.is_unlimited ? 0 : toNumber(plan.data_amount_gb);
  const supportedNetworks = (plan.plan_networks ?? [])
    .map((network) => network.network_name)
    .filter(Boolean);

  return {
    id: plan.id,
    flag: display.flag,
    country: translateName(display.name),
    planName: t("esim.premiumDataPlan", { name: translateName(display.name) }),
    data: plan.is_unlimited ? t("common.unlimited") : display.data,
    days: t("esim.daysValue", { count: plan.validity_days }),
    status: "ready" as ESIMStatus,
    network: display.network,
    dataUsedGB: 0,
    dataTotalGB,
    daysRemaining: plan.validity_days,
    daysTotal: plan.validity_days,
    startDate: formatDate(start, language),
    expiryDate: formatDate(expiry, language),
    coverage: translateName(display.name),
    networkStatus: t("common.readyToInstall"),
    iccid: `Pending-${plan.id}`,
    activationCode: `LPA:1$airconnect.example$${plan.id}`,
    smdpAddress: "airconnect.example",
    supportedNetworks: supportedNetworks.length
      ? supportedNetworks
      : [display.network],
    isInstalled: false,
  };
}

const qrPattern = [
  [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
  [0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0],
  [1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1],
  [0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1],
  [1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0],
  [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0],
  [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0],
];

function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Animated.View
      entering={FadeInDown.duration(350)}
      layout={LinearTransition.duration(250)}
      className={`bg-white rounded-3xl border border-[#F3F4F6] overflow-hidden ${className}`}
    >
      {children}
    </Animated.View>
  );
}

function CircularProgress({
  percent,
  size = 88,
  strokeWidth = 7,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setValue(percent), 200);
    return () => clearTimeout(t);
  }, [percent]);

  const innerSize = size - strokeWidth * 2;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#F3F4F6",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <CustomLinearGradient
        colors={["#5B8DEF", "#6915E0"]}
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: size,
          height: `${Math.max(0, Math.min(value, 100))}%`,
        }}
      />

      <View
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: innerSize / 2,
          backgroundColor: "#FFFFFF",
        }}
      />
    </View>
  );
}

function QRCodeDisplay() {
  const cellSize = 7;

  return (
    <View
      style={{
        width: qrPattern[0].length * cellSize,
        height: qrPattern.length * cellSize,
        flexDirection: "row",
        flexWrap: "wrap",
      }}
    >
      {qrPattern.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <View
            key={`${rowIndex}-${colIndex}`}
            style={{
              width: cellSize,
              height: cellSize,
              backgroundColor: cell ? "#1A1A2E" : "#FFFFFF",
              borderRadius: cell ? 1 : 0,
            }}
          />
        )),
      )}
    </View>
  );
}

function CopyField({
  label,
  value,
  sensitive = false,
}: {
  label: string;
  value: string;
  sensitive?: boolean;
}) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(!sensitive);
  const [copied, setCopied] = useState(false);

  const displayValue = useMemo(() => {
    if (visible) return value;

    return (
      value.slice(0, 6) +
      "•".repeat(Math.max(0, value.length - 10)) +
      value.slice(-4)
    );
  }, [value, visible]);

  const handleCopy = () => {
    setCopied(true);
    Alert.alert(t("common.copied"), value);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <View className="bg-[#F9FAFB] rounded-2xl p-4">
      <Text className="text-xs font-semibold text-[#6B7280] uppercase mb-1.5">
        {label}
      </Text>

      <View className="flex-row items-center">
        <Text className="flex-1 text-sm text-[#111827] leading-5">
          {displayValue}
        </Text>

        <View className="flex-row items-center ml-2">
          {sensitive && (
            <Pressable
              onPress={() => setVisible((v) => !v)}
              className="w-8 h-8 rounded-xl bg-white border border-[#F3F4F6] items-center justify-center mr-1.5"
            >
              {visible ? (
                <EyeOff size={14} color="#6B7280" />
              ) : (
                <Eye size={14} color="#6B7280" />
              )}
            </Pressable>
          )}

          <Pressable
            onPress={handleCopy}
            className="w-8 h-8 rounded-xl bg-white border border-[#F3F4F6] items-center justify-center"
          >
            {copied ? (
              <Check size={14} color="#10B981" />
            ) : (
              <Copy size={14} color="#6B7280" />
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function StatusBadge({ status }: { status: ESIMStatus }) {
  const { t } = useI18n();

  if (status === "active") {
    return (
      <View className="flex-row items-center px-3 py-1.5 rounded-full bg-[#10B981]">
        <View className="w-1.5 h-1.5 rounded-full bg-white mr-1.5" />
        <Text className="text-white text-xs font-bold">{t("common.active")}</Text>
      </View>
    );
  }

  if (status === "ready") {
    return (
      <CustomLinearGradient
        colors={["#6915E0", "#9864E1"]}
        style={{
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 999,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Signal size={12} color="#FFFFFF" />
        <Text className="text-white text-xs font-bold ml-1.5">
          {t("common.readyToInstall")}
        </Text>
      </CustomLinearGradient>
    );
  }

  return (
    <View className="flex-row items-center px-3 py-1.5 rounded-full bg-[#E5E7EB]">
      <View className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF] mr-1.5" />
      <Text className="text-[#6B7280] text-xs font-bold">
        {t("common.expired")}
      </Text>
    </View>
  );
}

export default function ESIMDetailsRoute() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { language, t, translateName } = useI18n();

  const [activationExpanded, setActivationExpanded] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);
  const [plan, setPlan] = useState<ESIMPlanRow | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!id) return;

    getPlanDetails(id)
      .then(({ data, error }) => {
        if (!isMounted) return;

        if (error || !data) {
          console.error("eSIM details load failed", error);
          setLoadError(t("esim.unableLoad"));
        } else {
          setPlan(data as unknown as ESIMPlanRow);
          setLoadError(null);
        }
      })
      .catch((error) => {
        if (isMounted) {
          console.error("eSIM details load failed", error);
          setLoadError(t("esim.unableLoad"));
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, t]);

  const e = plan ? buildESIMData(plan, language, t, translateName) : esimData;
  const dataPercent = e.dataTotalGB ? (e.dataUsedGB / e.dataTotalGB) * 100 : 0;
  const daysPercent = e.daysTotal ? (e.daysRemaining / e.daysTotal) * 100 : 0;

  useEffect(() => {
    const t = setTimeout(() => {
      setProgressWidth(dataPercent);
    }, 300);

    return () => clearTimeout(t);
  }, [dataPercent]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F9FAFB]">
        <ActivityIndicator color="#6915E0" />
        <Text className="mt-3 text-sm text-[#6B7280]">
          {t("esim.loading")}
        </Text>
      </View>
    );
  }

  if (!id || !plan || loadError) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F9FAFB] px-6">
        <Text className="text-center text-lg font-bold text-[#111827]">
          {loadError ?? (id ? t("esim.unavailable") : t("esim.missing"))}
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-5 rounded-2xl bg-[#6915E0] px-6 py-3"
        >
          <Text className="font-bold text-white">{t("common.back")}</Text>
        </Pressable>
      </View>
    );
  }

  const handleCopyOrder = () => {
    setCopiedOrderId(true);
    Alert.alert(t("common.copied"), e.id);

    setTimeout(() => {
      setCopiedOrderId(false);
    }, 2000);
  };

  const planDetails: {
    icon: IconComponent;
    label: string;
    value: string;
    color: string;
    bg: string;
  }[] = [
    {
      icon: Calendar,
      label: t("esim.startDate"),
      value: e.startDate,
      color: "#3B82F6",
      bg: "#EFF6FF",
    },
    {
      icon: Calendar,
      label: t("esim.expiryDate"),
      value: e.expiryDate,
      color: "#6915E0",
      bg: "#F5F0FF",
    },
    {
      icon: Globe,
      label: t("common.coverage"),
      value: e.coverage,
      color: "#10B981",
      bg: "#ECFDF5",
    },
    {
      icon: Signal,
      label: t("common.network"),
      value: e.networkStatus,
      color: "#22C55E",
      bg: "#F0FDF4",
    },
  ];

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <View className="bg-white px-5 pt-14 pb-4 flex-row items-center shadow-sm z-10">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-[#F3F4F6] items-center justify-center"
        >
          <ArrowLeft size={20} color="#374151" />
        </Pressable>

        <View className="flex-1 items-center">
          <Text className="font-bold text-[#111827] text-[17px]">
            {t("esim.details")}
          </Text>
        </View>

        <Pressable className="w-10 h-10 rounded-full bg-[#F3F4F6] items-center justify-center">
          <MoreVertical size={20} color="#374151" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-5 pb-32"
        showsVerticalScrollIndicator={false}
      >
        <SectionCard>
          <CustomLinearGradient
            colors={["#6915E0", "#9864E1"]}
            style={{
              paddingHorizontal: 24,
              paddingTop: 24,
              paddingBottom: 20,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <View className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
            <View className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full" />

            <View className="flex-row items-start">
              <Text className="text-6xl leading-none">{e.flag}</Text>

              <View className="flex-1 ml-4">
                <View className="flex-row items-start justify-between mb-1">
                  <Text className="font-bold text-white text-[22px]">
                    {e.country}
                  </Text>

                  <StatusBadge status={e.status} />
                </View>

                <Text className="text-white/80 text-sm font-medium mb-2">
                  {e.planName}
                </Text>

                <View className="flex-row flex-wrap">
                  <View className="flex-row items-center bg-white/20 px-2.5 py-1 rounded-full mr-2 mb-2">
                    <Wifi size={12} color="#FFFFFF" />
                    <Text className="text-xs text-white font-semibold ml-1">
                      {e.data}
                    </Text>
                  </View>

                  <View className="flex-row items-center bg-white/20 px-2.5 py-1 rounded-full mr-2 mb-2">
                    <Calendar size={12} color="#FFFFFF" />
                    <Text className="text-xs text-white font-semibold ml-1">
                      {e.days}
                    </Text>
                  </View>

                  <View className="flex-row items-center bg-white/20 px-2.5 py-1 rounded-full mr-2 mb-2">
                    <Signal size={12} color="#FFFFFF" />
                    <Text className="text-xs text-white font-semibold ml-1">
                      {e.network}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <Pressable
              onPress={handleCopyOrder}
              className="mt-4 flex-row items-center bg-white/15 rounded-xl px-3 py-2"
            >
              <Text className="text-xs text-white/70 mr-2">
                {t("success.orderId", { value: "" })}
              </Text>

              <Text className="text-xs text-white flex-1">{e.id}</Text>

              {copiedOrderId ? (
                <Check size={14} color="#6EE7B7" />
              ) : (
                <Copy size={14} color="rgba(255,255,255,0.7)" />
              )}
            </Pressable>
          </CustomLinearGradient>
        </SectionCard>

        <View className="flex-row justify-between mt-4">
          <SectionCard className="w-[48%]">
            <View className="p-4 items-center">
              <Text className="text-xs font-semibold text-[#6B7280] mb-3">
                {t("myEsims.dataRemaining")}
              </Text>

              <View className="relative items-center justify-center mb-3">
                <CircularProgress percent={100 - dataPercent} />

                <View className="absolute inset-0 items-center justify-center">
                  <Text className="font-bold text-[#111827] text-[15px]">
                    {(e.dataTotalGB - e.dataUsedGB).toFixed(1)}
                  </Text>

                  <Text className="text-[#6B7280] text-[10px]">
                    {t("esim.gbLeft")}
                  </Text>
                </View>
              </View>

              <Text className="text-xs text-[#6B7280]">
                {t("esim.of")}{" "}
                <Text className="font-semibold text-[#374151]">
                  {e.dataTotalGB} GB
                </Text>
              </Text>
            </View>
          </SectionCard>

          <SectionCard className="w-[48%]">
            <View className="p-4 items-center">
              <Text className="text-xs font-semibold text-[#6B7280] mb-3">
                {t("esim.daysRemaining")}
              </Text>

              <View className="relative items-center justify-center mb-3">
                <CircularProgress percent={daysPercent} />

                <View className="absolute inset-0 items-center justify-center">
                  <Text className="font-bold text-[#111827] text-[18px]">
                    {e.daysRemaining}
                  </Text>

                  <Text className="text-[#6B7280] text-[10px]">
                    {t("common.days")}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <Calendar size={12} color="#6B7280" />
                <Text className="text-xs text-[#6B7280] ml-1">
                  {t("esim.of")}{" "}
                  <Text className="font-semibold text-[#374151]">
                    {e.daysTotal}
                  </Text>{" "}
                  {t("common.days")}
                </Text>
              </View>
            </View>
          </SectionCard>
        </View>

        <View className="mt-4">
          <SectionCard>
            <View className="p-5">
              <Text className="font-bold text-[#111827] mb-4">
                {t("plan.planDetails")}
              </Text>

              <View className="flex-row flex-wrap justify-between gap-y-4">
                {planDetails.map(({ icon: Icon, label, value, color, bg }) => (
                  <View
                    key={label}
                    style={{ width: "48%" }}
                    className="flex-row"
                  >
                    <View
                      style={{ backgroundColor: bg }}
                      className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                    >
                      <Icon size={16} color={color} />
                    </View>

                    <View className="flex-1">
                      <Text className="text-xs text-[#6B7280] mb-0.5">
                        {label}
                      </Text>

                      <Text className="text-sm font-semibold text-[#111827] leading-tight">
                        {value}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </SectionCard>
        </View>

        {!e.isInstalled && (
          <Animated.View entering={FadeInDown.duration(350)} className="mt-4">
            <CustomLinearGradient
              colors={["#6915E0", "#9864E1"]}
              style={{
                borderRadius: 24,
                padding: 20,
                overflow: "hidden",
              }}
            >
              <View className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />

              <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center mb-4">
                <Zap size={24} color="#FFFFFF" />
              </View>

              <Text className="font-bold text-white mb-1.5">
                {t("esim.installYourEsim")}
              </Text>

              <Text className="text-white/80 text-sm mb-5 leading-5">
                {t("esim.installBody")}
              </Text>

              <Pressable className="w-full py-3.5 bg-white rounded-2xl items-center justify-center flex-row mb-2.5">
                <Zap size={16} color="#6915E0" />
                <Text className="text-[#6915E0] font-bold text-sm ml-2">
                  {t("esim.viewInstallGuide")}
                </Text>
              </Pressable>

              <Pressable className="w-full py-3 bg-white/20 rounded-2xl items-center justify-center flex-row">
                <Play size={16} color="#FFFFFF" />
                <Text className="text-white font-semibold text-sm ml-2">
                  {t("esim.watchTutorial")}
                </Text>
              </Pressable>
            </CustomLinearGradient>
          </Animated.View>
        )}

        <View className="mt-4">
          <SectionCard>
            <View className="p-5">
              <View className="flex-row items-center mb-5">
                <View className="w-10 h-10 bg-[#F5F0FF] rounded-xl items-center justify-center mr-3">
                  <Shield size={20} color="#6915E0" />
                </View>

                <View className="flex-1">
                  <Text className="font-bold text-[#111827]">
                    {t("esim.qrCode")}
                  </Text>

                  <Text className="text-xs text-[#6B7280]">
                    {t("esim.scanToInstall")}
                  </Text>
                </View>

                <View className="flex-row items-center bg-[#ECFDF5] px-2.5 py-1 rounded-full">
                  <CheckCircle size={12} color="#059669" />
                  <Text className="text-xs font-semibold text-[#059669] ml-1">
                    {t("esim.verified")}
                  </Text>
                </View>
              </View>

              <View className="items-center">
                <View className="bg-white border-2 border-[#F3F4F6] rounded-3xl p-5 mb-5">
                  <View className="relative">
                    <QRCodeDisplay />

                    <View className="absolute inset-0 items-center justify-center">
                      <CustomLinearGradient
                        colors={["#6915E0", "#9864E1"]}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 12,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Wifi size={16} color="#FFFFFF" />
                      </CustomLinearGradient>
                    </View>
                  </View>
                </View>

                <View className="flex-row w-full">
                  <Pressable className="flex-1 flex-row items-center justify-center py-3 bg-[#F3F4F6] rounded-2xl mr-3">
                    <Download size={16} color="#374151" />
                    <Text className="text-sm font-semibold text-[#374151] ml-2">
                      {t("esim.download")}
                    </Text>
                  </Pressable>

                  <Pressable className="flex-1">
                    <CustomLinearGradient
                      colors={["#6915E0", "#9864E1"]}
                      style={{
                        paddingVertical: 12,
                        borderRadius: 16,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Share2 size={16} color="#FFFFFF" />
                      <Text className="text-sm font-semibold text-white ml-2">
                        {t("plan.share")}
                      </Text>
                    </CustomLinearGradient>
                  </Pressable>
                </View>
              </View>
            </View>
          </SectionCard>
        </View>

        <View className="mt-4">
          <SectionCard>
            <Pressable
              onPress={() => setActivationExpanded((v) => !v)}
              className="w-full flex-row items-center p-5"
            >
              <View className="w-10 h-10 bg-[#F5F0FF] rounded-xl items-center justify-center mr-3">
                <Shield size={20} color="#6915E0" />
              </View>

              <View className="flex-1">
                <Text className="font-bold text-[#111827]">
                  {t("esim.activationDetails")}
                </Text>

                <Text className="text-xs text-[#6B7280]">
                  {t("esim.activationDetailsSub")}
                </Text>
              </View>

              <View className="w-8 h-8 rounded-full bg-[#F3F4F6] items-center justify-center">
                {activationExpanded ? (
                  <ChevronUp size={16} color="#6B7280" />
                ) : (
                  <ChevronDown size={16} color="#6B7280" />
                )}
              </View>
            </Pressable>

            {activationExpanded && (
              <Animated.View
                entering={FadeIn.duration(250)}
                layout={LinearTransition.duration(250)}
                className="px-5 pb-5 border-t border-[#F9FAFB] pt-4"
              >
                <View className="mb-3">
                  <CopyField label="ICCID" value={e.iccid} sensitive />
                </View>

                <View className="mb-3">
                  <CopyField
                    label={t("esim.activationCode")}
                    value={e.activationCode}
                    sensitive
                  />
                </View>

                <CopyField label={t("esim.smdpAddress")} value={e.smdpAddress} />
              </Animated.View>
            )}
          </SectionCard>
        </View>

        <View className="mt-4">
          <SectionCard>
            <View className="p-5">
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 bg-[#F5F0FF] rounded-xl items-center justify-center mr-3">
                  <Signal size={20} color="#6915E0" />
                </View>

                <View>
                  <Text className="font-bold text-[#111827]">
                    {t("esim.supportedNetworks")}
                  </Text>

                  <Text className="text-xs text-[#6B7280]">
                    {t("esim.carriersCount", {
                      count: e.supportedNetworks.length,
                    })}
                  </Text>
                </View>
              </View>

              <View className="flex-row flex-wrap">
                {e.supportedNetworks.map((network) => (
                  <View
                    key={network}
                    className="flex-row items-center px-3 py-1.5 bg-[#F3F4F6] rounded-full mr-2 mb-2"
                  >
                    <View className="w-1.5 h-1.5 rounded-full bg-[#10B981] mr-1.5" />
                    <Text className="text-sm text-[#374151] font-medium">
                      {network}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </SectionCard>
        </View>

        <View className="mt-4">
          <SectionCard>
            <View className="p-5">
              <Text className="font-bold text-[#111827] mb-4">
                {t("esim.dataUsage")}
              </Text>

              <View className="flex-row items-center justify-between mb-3">
                <View className="items-center">
                  <Text className="text-xs text-[#6B7280] mb-1">
                    {t("esim.used")}
                  </Text>

                  <Text className="font-bold text-[#111827]">
                    {e.dataUsedGB} GB
                  </Text>
                </View>

                <View className="flex-1 mx-4">
                  <View className="h-3 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <CustomLinearGradient
                      colors={["#5B8DEF", "#6915E0"]}
                      style={{
                        height: "100%",
                        width: `${progressWidth}%`,
                        borderRadius: 999,
                      }}
                    />
                  </View>

                  <View className="flex-row justify-between mt-1.5">
                    <Text className="text-xs text-[#9CA3AF]">0 GB</Text>

                    <Text className="text-xs text-[#9CA3AF]">
                      {e.dataTotalGB} GB
                    </Text>
                  </View>
                </View>

                <View className="items-center">
                  <Text className="text-xs text-[#6B7280] mb-1">
                    {t("esim.remaining")}
                  </Text>

                  <Text className="font-bold text-[#6915E0]">
                    {(e.dataTotalGB - e.dataUsedGB).toFixed(1)} GB
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between pt-3 border-t border-[#F9FAFB]">
                <Text className="text-xs text-[#6B7280]">
                  {t("esim.usedPercent", {
                    value: ((e.dataUsedGB / e.dataTotalGB) * 100).toFixed(0),
                  })}
                </Text>

                <Text className="text-xs font-semibold text-[#059669]">
                  {((1 - e.dataUsedGB / e.dataTotalGB) * 100).toFixed(0)}%
                  {t("esim.remainingPercent", {
                    value: ((1 - e.dataUsedGB / e.dataTotalGB) * 100).toFixed(
                      0,
                    ),
                  })}
                </Text>
              </View>
            </View>
          </SectionCard>
        </View>

        <View className="mt-4">
          <SectionCard>
            <View className="p-5">
              <View className="flex-row items-start mb-5">
                <View className="w-10 h-10 bg-[#F5F0FF] rounded-xl items-center justify-center mr-3">
                  <Headphones size={20} color="#6915E0" />
                </View>

                <View className="flex-1">
                  <Text className="font-bold text-[#111827]">
                    {t("esim.needHelp")}
                  </Text>

                  <Text className="text-sm text-[#6B7280]">
                    {t("esim.support247Body")}
                  </Text>
                </View>
              </View>

              <Pressable className="w-full flex-row items-center p-3.5 bg-[#F5F0FF] rounded-2xl mb-2.5">
                <CustomLinearGradient
                  colors={["#6915E0", "#9864E1"]}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <MessageCircle size={16} color="#FFFFFF" />
                </CustomLinearGradient>

                <View className="flex-1">
                  <Text className="text-sm font-semibold text-[#111827]">
                    {t("esim.liveChat")}
                  </Text>

                  <Text className="text-xs text-[#6B7280]">
                    {t("esim.avgResponse")}
                  </Text>
                </View>

                <View className="w-2 h-2 rounded-full bg-[#10B981]" />
              </Pressable>

              <Pressable className="w-full flex-row items-center p-3.5 bg-[#F9FAFB] rounded-2xl mb-2.5">
                <View className="w-9 h-9 bg-[#E5E7EB] rounded-xl items-center justify-center mr-3">
                  <Headphones size={16} color="#4B5563" />
                </View>

                <View className="flex-1">
                  <Text className="text-sm font-semibold text-[#111827]">
                    {t("profile.contactSupport")}
                  </Text>

                  <Text className="text-xs text-[#6B7280]">
                    {t("esim.emailOrPhone")}
                  </Text>
                </View>
              </Pressable>

              <Pressable className="w-full flex-row items-center p-3.5 bg-[#F9FAFB] rounded-2xl">
                <View className="w-9 h-9 bg-[#E5E7EB] rounded-xl items-center justify-center mr-3">
                  <BookOpen size={16} color="#4B5563" />
                </View>

                <View className="flex-1">
                  <Text className="text-sm font-semibold text-[#111827]">
                    {t("esim.troubleshootingGuide")}
                  </Text>

                  <Text className="text-xs text-[#6B7280]">
                    {t("esim.stepSolutions")}
                  </Text>
                </View>
              </Pressable>
            </View>
          </SectionCard>
        </View>
      </ScrollView>

      <View className="border-t border-[#F3F4F6] bg-white px-5 py-4">
        <View className="flex-row">
          <Pressable className="flex-1 mr-3">
            <CustomLinearGradient
              colors={["#6915E0", "#9864E1"]}
              style={{
                paddingVertical: 14,
                borderRadius: 16,
                alignItems: "center",
              }}
            >
              <Text className="text-white font-bold text-sm">
                {t("esim.manage")}
              </Text>
            </CustomLinearGradient>
          </Pressable>

          <Pressable className="flex-1 py-3.5 bg-white border-2 border-[#E5E7EB] rounded-2xl flex-row items-center justify-center">
            <Zap size={16} color="#6915E0" />

            <Text className="text-[#374151] font-semibold text-sm ml-2">
              {t("esim.reinstall")}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
