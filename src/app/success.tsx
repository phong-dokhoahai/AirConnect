import { router, useLocalSearchParams } from "expo-router";
import {
  Check,
  CheckCircle,
  Mail,
  QrCode,
  Settings,
  Zap,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { Button, Flag, Row, Screen, Section } from "@/components/airconnect/ui";
import { useAuth } from "@/lib/auth";
import { getPlanDetails } from "@/lib/catalogQueries";
import { useI18n } from "@/lib/i18n";
import { getPlanDisplay, type PlanDisplayRow } from "@/lib/planDisplay";
import { getOrderWithEsim } from "@/lib/purchaseQueries";

type PersistedOrder = {
  id: string;
  status: string;
  traveler_email: string | null;
  created_at: string;
  esim_plans?: PlanDisplayRow | PlanDisplayRow[] | null;
  user_esims?: { id: string; status: string; expires_at: string | null }[] | null;
};

type PersistedUserEsim = NonNullable<PersistedOrder["user_esims"]>[number];

function firstRow<T>(value: T | T[] | null | undefined) {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export default function SuccessRoute() {
  const { language, t, translateName } = useI18n();
  const { orderId, planId, email } = useLocalSearchParams<{
    orderId?: string;
    planId?: string;
    email?: string;
  }>();
  const { user: authUser, initializing } = useAuth();
  const [plan, setPlan] = useState<PlanDisplayRow | null>(null);
  const [order, setOrder] = useState<PersistedOrder | null>(null);
  const [userEsim, setUserEsim] = useState<PersistedUserEsim | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(orderId || planId));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fallbackPurchaseDate] = useState(() => new Date().toISOString());

  useEffect(() => {
    let isMounted = true;

    if (orderId && initializing) {
      return;
    }

    if (!orderId && !planId) {
      return;
    }

    if (orderId) {
      const currentOrderId = orderId;

      async function loadOrder() {
        try {
          const { data, error } = await getOrderWithEsim(currentOrderId);
          if (!isMounted) return;

          const persistedOrder = data as unknown as PersistedOrder | null;
          const persistedPlan = firstRow(persistedOrder?.esim_plans);
          const persistedUserEsim = firstRow(persistedOrder?.user_esims);

          if (error || !persistedOrder || !persistedPlan) {
            console.error("Success order load failed", error);
            setLoadError(t("success.unableLoadOrder"));
          } else {
            setOrder(persistedOrder);
            setUserEsim(persistedUserEsim);
            setPlan(persistedPlan);
            setLoadError(null);
          }
        } catch (error) {
          if (isMounted) {
            console.error("Success order load failed", error);
            setLoadError(t("success.unableLoadOrder"));
          }
        } finally {
          if (isMounted) setIsLoading(false);
        }
      }

      void loadOrder();

      return () => {
        isMounted = false;
      };
    }

    if (!planId) {
      return;
    }

    const legacyPlanId = planId;

    async function loadPlan() {
      try {
        const { data, error } = await getPlanDetails(legacyPlanId);
        if (!isMounted) return;

        if (error || !data) {
          console.error("Success plan load failed", error);
          setLoadError(t("checkout.unableLoadPackage"));
        } else {
          setPlan(data as unknown as PlanDisplayRow);
          setLoadError(null);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Success plan load failed", error);
          setLoadError(t("checkout.unableLoadPackage"));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadPlan();

    return () => {
      isMounted = false;
    };
  }, [initializing, orderId, planId, t]);

  const purchaseDate = new Date(order?.created_at ?? fallbackPurchaseDate).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const display = plan ? getPlanDisplay(plan) : null;
  const deliveryEmail = order?.traveler_email ?? email ?? authUser?.email;
  const isFulfilled = Boolean(userEsim);

  if (initializing || isLoading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#6915E0" />
          <Text className="mt-3 text-sm text-gray-600">
            {t("common.loadingPackage")}
          </Text>
        </View>
      </Screen>
    );
  }

  if ((!orderId && !planId) || !plan || loadError) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-lg font-bold text-gray-950">
            {loadError ?? (orderId || planId ? t("common.packageUnavailable") : t("common.missingOrder"))}
          </Text>
          <Button
            label={t("common.home")}
            variant="secondary"
            onPress={() => router.replace("/(tabs)/home")}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <View className="items-center bg-[#6915E0] px-6 pb-12 pt-16">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-white">
          <CheckCircle size={56} color="#22C55E" />
        </View>
        <Text className="mt-6 text-center text-3xl font-black text-white">
          {order?.status === "paid" ? t("success.paymentSuccessful") : t("success.paymentPending")}
        </Text>
        <Text className="mt-2 text-center text-lg text-white opacity-90">
          {isFulfilled ? t("success.ready") : t("success.fulfillmentPending")}
        </Text>
      </View>
      <View className="-mt-8 px-5">
        <View className="rounded-[32px] bg-white p-6">
          <Row className="items-start gap-4">
            <Flag value={display?.flag ?? "GL"} large />
            <View className="flex-1">
              <Text className="text-xl font-black text-gray-950">
                {translateName(display?.name)} eSIM
              </Text>
              <Text className="mt-2 text-sm text-gray-500">
                {display?.data} - {display?.validity} - {display?.network}
              </Text>
              <Text className="mt-3 text-xs text-gray-500">
                {t("success.orderId", { value: order?.id ?? plan.id })}
              </Text>
              <Text className="mt-1 text-xs text-gray-500">
                {t("success.purchaseDate", { value: purchaseDate })}
              </Text>
            </View>
          </Row>
        </View>
      </View>
      <View className="px-5">
        <Section title={t("success.esimStatus")}>
          {[
            t("success.paymentConfirmed"),
            isFulfilled ? t("success.esimGenerated") : t("success.awaitingFulfillment"),
            isFulfilled ? t("success.qrReady") : t("success.qrPending"),
            isFulfilled ? t("success.activationAvailable") : t("success.activationPending"),
          ].map((label) => (
            <Row
              key={label}
              className="justify-between border-b border-gray-50 py-3"
            >
              <Row className="gap-3">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                  <Check size={18} color="#047857" />
                </View>
                <Text className="font-bold text-gray-950">{label}</Text>
              </Row>
              <Text className="text-xs font-bold text-emerald-600">
                {isFulfilled || label === t("success.paymentConfirmed")
                  ? t("common.completed")
                  : t("transactions.status.pending")}
              </Text>
            </Row>
          ))}
        </Section>
        <Section title={t("success.installMinutes")}>
          {[
            {
              icon: Settings,
              label: t("success.openSettings"),
              sub: t("success.openSettingsSub"),
            },
            { icon: QrCode, label: t("success.scanQr"), sub: t("success.scanQrSub") },
            {
              icon: Zap,
              label: t("success.activateEsim"),
              sub: t("success.activateEsimSub"),
            },
          ].map(({ icon: Icon, label, sub }, index) => (
            <Row key={label} className="mb-4 gap-4">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#6915E0]">
                <Icon size={22} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-gray-950">
                  {index + 1}. {label}
                </Text>
                <Text className="text-sm text-gray-500">{sub}</Text>
              </View>
            </Row>
          ))}
        </Section>
        <Section title={t("success.deliveryInfo")}>
          <Row className="items-start gap-3">
            <Mail size={22} color="#6915E0" />
            <Text className="flex-1 text-sm leading-6 text-gray-600">
              {deliveryEmail
                ? t("success.deliveryWithEmail", { email: deliveryEmail })
                : t("success.deliveryNoEmail")}
            </Text>
          </Row>
        </Section>
        <View className="mt-5 gap-3 pb-6">
          <Button
            label={t("success.installEsim")}
            onPress={() =>
              router.push({
                pathname: "/esim-details",
                params: { id: plan.id, userEsimId: userEsim?.id },
              })
            }
          />
          <Button
            label={t("success.viewMyEsim")}
            variant="secondary"
            onPress={() => router.replace("/(tabs)/my-esims")}
          />
          <Button
            label={t("common.home")}
            variant="ghost"
            onPress={() => router.replace("/(tabs)/home")}
          />
        </View>
      </View>
    </Screen>
  );
}
