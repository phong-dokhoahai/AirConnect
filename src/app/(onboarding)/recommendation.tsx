import { getName } from "country-list";
import { router, useLocalSearchParams } from "expo-router";
import { Check, Globe, Signal, Zap } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { BackButton, Flag } from "@/components/airconnect/ui";
import { useAuth } from "@/lib/auth";
import { getActiveRecommendationPlans } from "@/lib/catalogQueries";
import { useI18n } from "@/lib/i18n";

const purposeLabels: Record<string, string> = {
  vacation: "onboarding.vacation",
  business: "onboarding.business",
  study: "onboarding.study",
  "long-term": "onboarding.longTerm",
  "digital-nomad": "onboarding.digitalNomad",
};

type UsageTier = "light" | "moderate" | "heavy" | "unlimited";

const usageLabels: Record<UsageTier, string> = {
  light: "onboarding.lightUse",
  moderate: "onboarding.moderateUse",
  heavy: "onboarding.heavyUse",
  unlimited: "common.unlimited",
};

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
  region_countries?: { countries?: CountryRow | CountryRow[] | null }[] | null;
};

type PlanFeatureRow = {
  id?: string;
  icon: string;
  label: string;
  sort_order: number;
};

type PlanNetworkRow = {
  id?: string;
  network_name: string;
  coverage_note?: string | null;
  network_type: string;
  countries?: Pick<CountryRow, "id" | "name" | "iso2"> | null;
};

type PlanCountryRow = {
  countries?: CountryRow | CountryRow[] | null;
};

type PlanRegionRow = {
  regions?: RegionRow | RegionRow[] | null;
};

type RecommendationPlan = {
  id: string;
  title: string;
  description?: string | null;
  data_amount_gb?: number | string | null;
  is_unlimited: boolean;
  usage_tier?: UsageTier | null;
  validity_days: number;
  price: number | string;
  currency: string;
  provider_name: string;
  activation_policy: string;
  tethering_supported: boolean;
  supports_5g: boolean;
  is_active: boolean;
  plan_countries?: PlanCountryRow[] | null;
  plan_regions?: PlanRegionRow[] | null;
  plan_networks?: PlanNetworkRow[] | null;
  plan_features?: PlanFeatureRow[] | null;
};

function toTitleCase(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getDestinationName(id: string) {
  const countryCode = id.toUpperCase();
  return getName(countryCode) ?? toTitleCase(id);
}

function normalizeRows<T>(value: T | T[] | null | undefined): T[] {
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

function formatData(plan: RecommendationPlan, unlimitedLabel: string) {
  if (plan.is_unlimited) return unlimitedLabel;

  const amount = toNumber(plan.data_amount_gb);
  return `${Number.isInteger(amount) ? amount : amount.toFixed(2)} GB`;
}

function formatValidity(days: number, dayLabel: string) {
  return `${days} ${dayLabel}`;
}

function getPlanCoverageIso2s(plan: RecommendationPlan) {
  const directCountries = (plan.plan_countries ?? []).flatMap((entry) =>
    normalizeRows(entry.countries),
  );
  const regionalCountries = (plan.plan_regions ?? []).flatMap((entry) =>
    normalizeRows(entry.regions).flatMap((region) =>
      (region.region_countries ?? []).flatMap((regionCountry) =>
        normalizeRows(regionCountry.countries),
      ),
    ),
  );

  return new Set(
    [...directCountries, ...regionalCountries].map((country) =>
      country.iso2.toUpperCase(),
    ),
  );
}

function planCoversDestinations(plan: RecommendationPlan, destinations: string[]) {
  const coverage = getPlanCoverageIso2s(plan);
  return destinations.every((destination) =>
    coverage.has(destination.toUpperCase()),
  );
}

function planDirectlyCoversDestinations(
  plan: RecommendationPlan,
  destinations: string[],
) {
  const directCoverage = new Set(
    (plan.plan_countries ?? [])
      .flatMap((entry) => normalizeRows(entry.countries))
      .map((country) => country.iso2.toUpperCase()),
  );

  return destinations.every((destination) =>
    directCoverage.has(destination.toUpperCase()),
  );
}

function getBestPlan(
  plans: RecommendationPlan[],
  destinations: string[],
  usage: string,
) {
  const normalizedUsage = usage as UsageTier;

  return plans
    .filter(
      (plan) =>
        plan.usage_tier === normalizedUsage &&
        planCoversDestinations(plan, destinations),
    )
    .sort((first, second) => {
      const firstDirect = planDirectlyCoversDestinations(first, destinations);
      const secondDirect = planDirectlyCoversDestinations(second, destinations);

      if (firstDirect !== secondDirect) {
        return firstDirect ? -1 : 1;
      }

      return toNumber(first.price) - toNumber(second.price);
    })[0];
}

function getNetworkLabel(plan: RecommendationPlan | null, unavailableLabel: string) {
  if (!plan) return unavailableLabel;

  const networkTypes = new Set(
    (plan.plan_networks ?? []).map((network) => network.network_type),
  );

  if (plan.supports_5g || networkTypes.has("5G")) return "4G LTE / 5G";
  if (networkTypes.has("LTE")) return "LTE";
  return "4G";
}

function getPlanFeatures(plan: RecommendationPlan | null, fallback: string[]) {
  const features = [...(plan?.plan_features ?? [])]
    .sort((first, second) => first.sort_order - second.sort_order)
    .map((feature) => feature.label);

  return features.length
    ? features
    : fallback;
}

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
  const { t, translateName } = useI18n();
  const { user: authUser, initializing, signingIn, signInWithGoogle } = useAuth();
  const {
    purpose = "vacation",
    destinations = "jp",
    usage = "moderate",
  } = useLocalSearchParams<{
    purpose?: string;
    destinations?: string;
    usage?: string;
  }>();

  const destinationIds = destinations
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const primaryDestinationId = destinationIds[0] ?? "jp";
  const primaryDestinationCode = primaryDestinationId.toUpperCase();
  const primaryDestinationName = translateName(getDestinationName(primaryDestinationId));
  const destinationSummary =
    destinationIds.length > 1
      ? `${primaryDestinationName} + ${t("recommendation.moreCount", {
          count: destinationIds.length - 1,
        })}`
      : primaryDestinationName;
  const purposeLabel = purposeLabels[purpose] ? t(purposeLabels[purpose]) : translateName(toTitleCase(purpose));
  const usageLabel =
    usageLabels[usage as UsageTier] ? t(usageLabels[usage as UsageTier]) : translateName(toTitleCase(usage || "moderate"));
  const [plans, setPlans] = useState<RecommendationPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getActiveRecommendationPlans()
      .then(({ data, error }) => {
        if (!isMounted) return;

        if (error) {
          console.error("Recommendation plan load failed", error);
          setLoadError(t("recommendation.noActivePackage"));
          setPlans([]);
        } else {
          setLoadError(null);
          setPlans((data ?? []) as unknown as RecommendationPlan[]);
        }
      })
      .catch((error) => {
        if (isMounted) {
          console.error("Recommendation plan load failed", error);
          setLoadError(t("recommendation.noActivePackage"));
          setPlans([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [t]);

  const selectedPlan = getBestPlan(plans, destinationIds, usage) ?? null;
  const recommendation = selectedPlan
    ? {
        data: formatData(selectedPlan, t("common.unlimited")),
        validity: formatValidity(selectedPlan.validity_days, t("common.days")),
        price: formatPrice(selectedPlan.price, selectedPlan.currency),
      }
    : null;
  const featureLabels = getPlanFeatures(selectedPlan, [
    t("onboarding.instantActivation"),
    t("checkout.noPhysicalSim"),
    t("plan.keepNumber"),
  ]).map(translateName);
  const networkLabel = getNetworkLabel(selectedPlan, t("common.unavailable"));

  const handleBuyNow = async () => {
    if (!selectedPlan) return;

    if (!authUser) {
      const session = await signInWithGoogle();

      if (!session) return;
    }

    router.push({
      pathname: "/checkout",
      params: { planId: selectedPlan.id },
    });
  };

  const handleBrowseMore = () => {
    router.push("/(tabs)/explore");
  };

  return (
    <View className="flex-1 bg-white">
      <View className="absolute left-6 top-14 z-10">
        <BackButton />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pt-16 pb-8"
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-8 text-center text-3xl font-semibold text-gray-900">
          {t("recommendation.title")}
        </Text>

        <View className="mx-auto w-full max-w-md">
          <View className="relative mb-6 rounded-3xl bg-[#7B61FF] p-6">
            {selectedPlan?.usage_tier ? (
              <View className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1">
                <Text className="text-xs font-semibold text-[#7B61FF]">
                  {usageLabel}
                </Text>
              </View>
            ) : null}

            <View className="mb-6 flex-row items-start gap-4">
              <Flag value={primaryDestinationCode} large />

              <View className="flex-1">
                <Text className="mb-1 text-2xl font-semibold text-white">
                  {destinationSummary}
                </Text>

                <View className="flex-row items-center gap-2">
                  <Signal size={16} color="#FFFFFF" />
                  <Text className="text-sm text-white/90">
                    {networkLabel} {t("common.coverage")}
                  </Text>
                </View>
              </View>
            </View>

            {isLoading ? (
              <View className="mb-6 flex-row items-center gap-2 rounded-2xl bg-white/10 p-3">
                <ActivityIndicator color="#FFFFFF" />
                <Text className="text-sm text-white/90">
                  {t("recommendation.checking")}
                </Text>
              </View>
            ) : null}

            {!isLoading && (loadError || !selectedPlan) ? (
              <View className="mb-6 rounded-2xl bg-white/10 p-3">
                <Text className="text-sm text-white/90">
                  {loadError ??
                    t("recommendation.noActivePackage")}
                </Text>
              </View>
            ) : null}

            {recommendation ? (
              <View className="mb-6 flex-row gap-4">
                <InfoBox label={t("common.data")} value={recommendation.data} />
                <InfoBox label={t("common.validity")} value={recommendation.validity} />
              </View>
            ) : null}

            <View className="mb-6 gap-2">
              {featureLabels.map((feature) => (
                <FeatureRow key={feature} text={feature} />
              ))}
            </View>

            <View className="flex-row items-end justify-between">
              <View>
                <Text className="text-sm text-white/70">{t("common.totalPrice")}</Text>
                <Text className="text-3xl font-bold text-white">
                  {recommendation?.price ?? t("common.unavailable")}
                </Text>
              </View>
            </View>
          </View>

          <View className="mb-6 flex-row items-center justify-center gap-2">
            <Zap size={16} color="#7B61FF" />
            <Text className="text-sm text-gray-600">
              {t("recommendation.activationUnderTwo")}
            </Text>
          </View>

          <View className="mb-6 rounded-2xl bg-gray-50 p-4">
            <View className="mb-3 flex-row items-center gap-2">
              <Globe size={20} color="#7B61FF" />
              <Text className="font-semibold text-gray-900">
                {t("recommendation.networkDetails")}
              </Text>
            </View>

            <View className="gap-2">
              <NetworkRow label={t("recommendation.tripType")} value={purposeLabel} />
              <NetworkRow
                label={t("recommendation.destinations")}
                value={`${destinationIds.length || 1}`}
              />
              <NetworkRow label={t("common.speed")} value={networkLabel} />
              <NetworkRow label={t("common.coverage")} value={destinationSummary} />
              <NetworkRow
                label={t("recommendation.package")}
                value={selectedPlan?.title ?? t("common.noMatchingPackage")}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="gap-3 px-6 pb-8">
        <Pressable
          onPress={handleBuyNow}
          disabled={!selectedPlan || initializing || signingIn}
          className={`w-full rounded-2xl px-6 py-4 ${
            selectedPlan && !initializing && !signingIn
              ? "bg-[#7B61FF]"
              : "bg-gray-200"
          }`}
        >
          <Text
            className={`text-center font-medium ${
              selectedPlan && !initializing && !signingIn
                ? "text-white"
                : "text-gray-500"
            }`}
          >
            {t("common.buyNow")}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleBrowseMore}
          className="w-full rounded-2xl border-2 border-gray-200 bg-white px-6 py-4"
        >
          <Text className="text-center font-medium text-gray-700">
            {t("common.browseMorePlans")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
