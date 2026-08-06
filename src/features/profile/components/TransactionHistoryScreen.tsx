import { CustomLinearGradient } from "@/components/ui/CustomLinearGradient";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import {
  formatMoney,
  getPlanDisplay,
  toNumber,
  type PlanDisplayRow,
} from "@/lib/planDisplay";
import { getUserOrders } from "@/lib/purchaseQueries";
import { useRouter } from "expo-router";
import { ArrowLeft, CreditCard, Globe, Package } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type OrderStatus = "paid" | "pending" | "failed" | "canceled";

type OrderRow = {
  id: string;
  status: OrderStatus;
  traveler_email: string;
  payment_method: string;
  subtotal_amount: number | string;
  discount_amount: number | string;
  tax_amount: number | string;
  total_amount: number | string;
  currency: string;
  created_at: string;
  esim_plans?: PlanDisplayRow | PlanDisplayRow[] | null;
  user_esims?:
    | { id: string; status: string; expires_at: string | null }[]
    | null;
};

function firstRow<T>(value: T | T[] | null | undefined) {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function formatDate(value: string, language: string) {
  return new Date(value).toLocaleDateString(
    language === "vi" ? "vi" : "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
}

export function TransactionHistoryScreen() {
  const router = useRouter();
  const {
    user: authUser,
    initializing,
    signingIn,
    signInWithGoogle,
  } = useAuth();
  const { language, t, translateName } = useI18n();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedOrders, setHasLoadedOrders] = useState(false);
  const [error, setError] = useState<string | null>(null);
  console.log("orders:", JSON.stringify(orders, null, 2));
  const loadOrders = useCallback(async () => {
    if (!authUser) return;

    setIsLoading(true);
    setHasLoadedOrders(false);
    setError(null);

    try {
      const { data, error } = await getUserOrders(authUser.id);

      if (error) {
        setError(error.message || t("common.somethingWrong"));
        setOrders([]);
        return;
      }

      setOrders((data ?? []) as unknown as OrderRow[]);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : t("common.somethingWrong"),
      );
      setOrders([]);
    } finally {
      setHasLoadedOrders(true);
      setIsLoading(false);
    }
  }, [authUser, t]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadOrders();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadOrders]);

  useEffect(() => {
    if (authUser) return;

    const timer = setTimeout(() => {
      setOrders([]);
      setHasLoadedOrders(false);
      setError(null);
    }, 0);

    return () => clearTimeout(timer);
  }, [authUser]);

  return (
    <SafeAreaView className="flex-1 ">
      <View className="px-5 pb-10">
        <View className="mb-6 flex-row items-center">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-white"
          >
            <ArrowLeft size={20} color="#374151" />
          </Pressable>
        </View>

        <Text className="text-3xl font-bold text-gray-950">
          {t("transactions.title")}
        </Text>
        <Text className="mt-2 text-base leading-6 text-gray-500">
          {t("transactions.subtitle")}
        </Text>

        {initializing || (authUser && (isLoading || !hasLoadedOrders)) ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#6915E0" />
            <Text className="mt-3 text-sm text-gray-500">
              {t("transactions.loading")}
            </Text>
          </View>
        ) : !authUser ? (
          <View className="mt-6 rounded-3xl border border-gray-100 bg-white p-5">
            <Text className="text-xl font-bold text-gray-950">
              {t("transactions.signInTitle")}
            </Text>
            <Text className="mt-2 text-sm leading-5 text-gray-500">
              {t("transactions.signInBody")}
            </Text>
            <Pressable
              disabled={signingIn}
              onPress={() => void signInWithGoogle()}
              className="mt-5 flex-row items-center justify-center rounded-2xl bg-[#6915E0] px-5 py-4"
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
        ) : orders.length === 0 ? (
          <View className="mt-6 rounded-3xl border border-gray-100 bg-white p-5">
            <Text className="text-xl font-bold text-gray-950">
              {error
                ? t("common.somethingWrong")
                : t("transactions.emptyTitle")}
            </Text>
            <Text className="mt-2 text-sm leading-5 text-gray-500">
              {error ?? t("transactions.emptyBody")}
            </Text>
            {error ? (
              <Pressable
                onPress={loadOrders}
                className="mt-5 self-start rounded-2xl bg-[#6915E0] px-5 py-3"
              >
                <Text className="font-bold text-white">
                  {t("common.retry")}
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : error ? (
          <View className="mt-6 rounded-3xl border border-gray-100 bg-white p-5">
            <Text className="text-xl font-bold text-gray-950">
              {t("common.somethingWrong")}
            </Text>
            <Text className="mt-2 text-sm leading-5 text-gray-500">
              {error}
            </Text>
            <Pressable
              onPress={loadOrders}
              className="mt-5 self-start rounded-2xl bg-[#6915E0] px-5 py-3"
            >
              <Text className="font-bold text-white">{t("common.retry")}</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            className="mt-5"
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {orders.map((order) => {
              const plan = firstRow(order.esim_plans);
              const display = plan ? getPlanDisplay(plan) : null;
              const status = t(`transactions.status.${order.status}`);

              return (
                <View
                  key={order.id}
                  className="mb-3 rounded-3xl border border-gray-100 bg-white p-4"
                >
                  <View className="flex-row items-start">
                    <CustomLinearGradient
                      colors={["#5B8DEF", "#6915E0"]}
                      className="h-11 w-11 items-center justify-center rounded-2xl"
                    >
                      <Package size={20} color="#FFFFFF" />
                    </CustomLinearGradient>

                    <View className="ml-3 flex-1">
                      <Text className="text-base font-bold text-gray-950">
                        {display
                          ? translateName(display.name)
                          : t("common.packageUnavailable")}
                      </Text>
                      <Text className="mt-1 text-xs text-gray-500">
                        {formatDate(order.created_at, language)} · {status}
                      </Text>
                    </View>

                    <Text className="text-base font-bold text-[#6915E0]">
                      {formatMoney(
                        toNumber(order.total_amount),
                        order.currency,
                        language,
                      )}
                    </Text>
                  </View>

                  <View className="mt-4 rounded-2xl bg-gray-50 p-3">
                    <Text className="text-xs text-gray-500">
                      {t("transactions.orderId")}: {order.id.slice(0, 8)}
                    </Text>
                    <Text className="mt-1 text-xs text-gray-500">
                      {t("transactions.paymentMethod")}: {order.payment_method}
                    </Text>
                    <Text className="mt-1 text-xs text-gray-500">
                      {t("transactions.email")}: {order.traveler_email}
                    </Text>
                  </View>

                  <View className="mt-3 flex-row items-center">
                    <CreditCard size={14} color="#6B7280" />
                    <Text className="ml-2 text-xs text-gray-500">
                      {t("transactions.breakdown", {
                        subtotal: formatMoney(
                          toNumber(order.subtotal_amount),
                          order.currency,
                          language,
                        ),
                        tax: formatMoney(
                          toNumber(order.tax_amount),
                          order.currency,
                          language,
                        ),
                        discount: formatMoney(
                          toNumber(order.discount_amount),
                          order.currency,
                          language,
                        ),
                      })}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
