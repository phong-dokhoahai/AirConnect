import { CustomLinearGradient } from "@/components/ui/CustomLinearGradient";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { getPlanDisplay, type PlanDisplayRow } from "@/lib/planDisplay";
import { getUserOrders } from "@/lib/purchaseQueries";
import { useRouter } from "expo-router";
import { ArrowLeft, CreditCard, Globe, Package } from "lucide-react-native";
import { useEffect, useState } from "react";
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
  user_esims?: { id: string; status: string; expires_at: string | null }[] | null;
};

const loadTimeoutMs = 3000;

function firstRow<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatMoney(value: number | string, currency: string, language: string) {
  return new Intl.NumberFormat(language === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency,
  }).format(Number(value));
}

function formatDate(value: string, language: string) {
  return new Date(value).toLocaleDateString(language === "vi" ? "vi" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TransactionHistoryScreen() {
  const router = useRouter();
  const { user: authUser, initializing, signingIn, signInWithGoogle } = useAuth();
  const { language, t, translateName } = useI18n();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedOrders, setHasLoadedOrders] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!authUser) return;
    const currentUserId = authUser.id;

    const timer = setTimeout(() => {
      async function loadOrders() {
        setIsLoading(true);
        setHasLoadedOrders(false);
        setError(null);

        try {
          const result = await Promise.race([
            getUserOrders(currentUserId),
            new Promise<null>((resolve) =>
              setTimeout(resolve, loadTimeoutMs, null),
            ),
          ]);

          if (!isMounted) return;

          if (!result) {
            setOrders([]);
            return;
          }

          const { data, error } = result;

          if (error) {
            setError(error.message || t("common.somethingWrong"));
            setOrders([]);
            return;
          }

          setOrders((data ?? []) as unknown as OrderRow[]);
        } catch (error) {
          if (!isMounted) return;
          setError(error instanceof Error ? error.message : t("common.somethingWrong"));
          setOrders([]);
        } finally {
          if (isMounted) {
            setHasLoadedOrders(true);
            setIsLoading(false);
          }
        }
      }

      void loadOrders();
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [authUser, t]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 px-5 pt-3">
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
              {t("transactions.emptyTitle")}
            </Text>
            <Text className="mt-2 text-sm leading-5 text-gray-500">
              {t("transactions.emptyBody")}
            </Text>
            {!!error && (
              <Text className="mt-3 text-xs font-semibold text-red-600">
                {error}
              </Text>
            )}
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
                        {display ? translateName(display.name) : t("common.packageUnavailable")}
                      </Text>
                      <Text className="mt-1 text-xs text-gray-500">
                        {formatDate(order.created_at, language)} · {status}
                      </Text>
                    </View>

                    <Text className="text-base font-bold text-[#6915E0]">
                      {formatMoney(order.total_amount, order.currency, language)}
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
                        subtotal: formatMoney(order.subtotal_amount, order.currency, language),
                        tax: formatMoney(order.tax_amount, order.currency, language),
                        discount: formatMoney(order.discount_amount, order.currency, language),
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
