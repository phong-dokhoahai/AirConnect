import * as Linking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  ArrowLeft,
  Check,
  Clock,
  CreditCard,
  Headphones,
  Phone,
  QrCode,
  Shield,
  Tag,
  Users,
  Zap,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { Flag, Toast } from "@/components/airconnect/ui";
import { getProfileUser } from "@/features/profile/utils";
import { useAuth } from "@/lib/auth";
import { getPlanDetails } from "@/lib/catalogQueries";
import { useI18n } from "@/lib/i18n";
import {
  createSepayPendingPayment,
  createStripeCheckoutPayment,
  getPaymentErrorMessage,
  getPaymentOrderStatus,
  type SepayPaymentResponse,
} from "@/lib/payments";
import {
  formatMoney,
  getPlanDisplay,
  type PlanDisplayRow,
  toNumber,
} from "@/lib/planDisplay";

const paymentMethods = [
  { id: "sepay", labelKey: "payment.sepay", icon: QrCode },
  { id: "stripe", labelKey: "payment.stripe", icon: CreditCard },
];

const trustBadges = [
  { icon: Shield, labelKey: "checkout.securePayment" },
  { icon: Zap, labelKey: "checkout.instantDelivery" },
  { icon: Headphones, labelKey: "checkout.support247" },
  { icon: Users, labelKey: "checkout.travelers1m" },
];

const benefits = [
  { icon: QrCode, labelKey: "checkout.qrDelivered" },
  { icon: Clock, labelKey: "checkout.activationUnderTwo" },
  { icon: CreditCard, labelKey: "checkout.noPhysicalSim" },
  { icon: Phone, labelKey: "checkout.keepNumber" },
];

const fallbackSepayBank = {
  bankCode: "TCB",
  accountNumber: "19070208496017",
  accountHolder: "DO KHOA HAI PHONG",
};

function formatBankAccount(value?: string) {
  return (value || fallbackSepayBank.accountNumber)
    .replace(/\s/g, "")
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function getSepayQrUrl(transfer: SepayPaymentResponse) {
  if (transfer.qrUrl) return transfer.qrUrl;

  const params = new URLSearchParams({
    acc: transfer.accountNumber || fallbackSepayBank.accountNumber,
    bank: transfer.bankCode || fallbackSepayBank.bankCode,
    amount: String(Math.round(transfer.amount)),
    des: transfer.paymentCode,
    template: "compact",
    showinfo: "true",
    holder: transfer.accountHolder || fallbackSepayBank.accountHolder,
  });

  return `https://vietqr.app/img?${params.toString()}`;
}

export default function CheckoutRoute() {
  const { t, translateName } = useI18n();
  const { planId } = useLocalSearchParams<{ planId?: string }>();
  const {
    user: authUser,
    initializing,
    signingIn,
    error: authError,
    signInWithGoogle,
  } = useAuth();
  const [plan, setPlan] = useState<PlanDisplayRow | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(planId));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState("sepay");
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(false);
  const [purchasePending, setPurchasePending] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseNotice, setPurchaseNotice] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);
  const [sepayTransfer, setSepayTransfer] =
    useState<SepayPaymentResponse | null>(null);
  const profileUser = authUser ? getProfileUser(authUser) : null;
  const profileEmail = authUser?.email ?? "";

  useEffect(() => {
    let isMounted = true;

    if (!planId) return;

    getPlanDetails(planId)
      .then(({ data, error }) => {
        if (!isMounted) return;

        if (error || !data) {
          console.error("Checkout plan load failed", error);
          setLoadError(t("checkout.unableLoadPackage"));
        } else {
          setPlan(data as unknown as PlanDisplayRow);
          setLoadError(null);
        }
      })
      .catch((error) => {
        if (isMounted) {
          console.error("Checkout plan load failed", error);
          setLoadError(t("checkout.unableLoadPackage"));
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [planId, t]);

  useEffect(() => {
    if (!sepayTransfer || selectedPayment !== "sepay") return;

    const transfer = sepayTransfer;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let isCanceled = false;

    async function pollStatus() {
      const { data, error } = await getPaymentOrderStatus(transfer.orderId);
      if (isCanceled) return;

      if (error) {
        console.error("SePay status polling failed", error);
      } else if (data?.status === "paid") {
        setPurchaseNotice({
          message: t("checkout.paymentConfirmed"),
          variant: "success",
        });
        router.replace({
          pathname: "/success",
          params: { orderId: transfer.orderId },
        });
        return;
      } else if (data?.status === "failed" || data?.status === "canceled") {
        const message = t("checkout.paymentFailed");
        setPurchaseError(message);
        setPurchaseNotice({ message, variant: "error" });
        setSepayTransfer(null);
        return;
      }

      timeoutId = setTimeout(pollStatus, 3000);
    }

    void pollStatus();

    return () => {
      isCanceled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [selectedPayment, sepayTransfer, t]);

  const planPrice = toNumber(plan?.price);
  const discount = appliedPromo ? 2.0 : 0;
  const taxes = 0.5;
  const total = Math.max(0, planPrice - discount + taxes);
  const display = plan ? getPlanDisplay(plan) : null;
  const travelerName =
    profileUser?.name || profileEmail.split("@")[0] || "AirConnect Traveler";

  const getErrorMessage = (error: unknown) =>
    error instanceof Error ? error.message : t("common.somethingWrong");

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === "SUMMER25") {
      setAppliedPromo(true);
      setPurchaseError(null);
      setPurchaseNotice({
        message: t("checkout.promoApplied"),
        variant: "success",
      });
    } else {
      setPurchaseError(t("checkout.invalidPromo"));
      setPurchaseNotice({
        message: t("checkout.invalidPromo"),
        variant: "error",
      });
    }
  };

  const handleCompletePurchase = async () => {
    if (!plan || !authUser || purchasePending) return;

    if (!profileEmail) {
      setPurchaseError(t("checkout.emailRequired"));
      setPurchaseNotice({
        message: t("checkout.emailRequired"),
        variant: "error",
      });
      return;
    }

    setPurchasePending(true);
    setPurchaseError(null);
    setPurchaseNotice(null);
    setSepayTransfer(null);

    try {
      const paymentInput = {
        planId: plan.id,
        travelerFullName: travelerName,
        travelerEmail: profileEmail,
        discountAmount: discount,
        taxAmount: taxes,
        metadata: {
          productType: "esim" as const,
          esimId: plan.id,
          planId: plan.id,
          country: translateName(display?.name) ?? "",
          days: Number(plan.validity_days ?? 0),
          gb: Number(plan.data_amount_gb ?? 0),
        },
      };

      if (selectedPayment === "stripe") {
        const payment = await createStripeCheckoutPayment({
          ...paymentInput,
          successUrl: Linking.createURL("success"),
          cancelUrl: Linking.createURL("checkout"),
        });

        if (payment.error || !payment.data?.checkoutUrl) {
          const message = await getPaymentErrorMessage(
            payment.error,
            t("checkout.unableStartStripe"),
          );
          setPurchaseError(message);
          setPurchaseNotice({ message, variant: "error" });
          return;
        }

        await WebBrowser.openBrowserAsync(payment.data.checkoutUrl);
        setPurchaseNotice({
          message: t("checkout.paymentPending"),
          variant: "success",
        });
        return;
      }

      const { data, error } = await createSepayPendingPayment(paymentInput);

      if (error || !data) {
        console.error("Purchase creation failed", error);
        const message = await getPaymentErrorMessage(
          error,
          t("common.somethingWrong"),
        );
        setPurchaseError(message);
        setPurchaseNotice({ message, variant: "error" });
        return;
      }

      setPurchaseNotice({
        message: t("checkout.sepayPending", { code: data.paymentCode }),
        variant: "success",
      });
      setSepayTransfer(data);
    } catch (error) {
      console.error("Purchase creation failed", error);
      const message = getErrorMessage(error);
      setPurchaseError(message);
      setPurchaseNotice({ message, variant: "error" });
    } finally {
      setPurchasePending(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator color="#7B61FF" />
        <Text className="mt-3 text-sm text-gray-600">
          {t("common.loadingPackage")}
        </Text>
      </View>
    );
  }

  if (initializing) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator color="#7B61FF" />
        <Text className="mt-3 text-sm text-gray-600">
          {t("common.checkingSignIn")}
        </Text>
      </View>
    );
  }

  if (!authUser) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="text-center text-2xl font-semibold text-gray-900">
          {t("common.signInRequired")}
        </Text>
        <Text className="mt-2 text-center text-sm text-gray-600">
          {t("checkout.signInBody")}
        </Text>
        {authError ? (
          <Text className="mt-4 text-center text-sm font-medium text-red-600">
            {authError}
          </Text>
        ) : null}
        <Pressable
          disabled={signingIn}
          onPress={() => void signInWithGoogle()}
          className={`mt-6 rounded-2xl px-6 py-4 ${
            signingIn ? "bg-gray-300" : "bg-[#7B61FF]"
          }`}
        >
          <Text className="font-medium text-white">
            {signingIn
              ? t("common.openingGoogle")
              : t("common.continueWithGoogle")}
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!planId || !plan || loadError) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="text-center text-lg font-semibold text-gray-900">
          {loadError ??
            (planId ? t("common.packageUnavailable") : t("common.missingPlan"))}
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-5 rounded-2xl bg-[#7B61FF] px-6 py-3"
        >
          <Text className="font-medium text-white">{t("common.back")}</Text>
        </Pressable>
      </View>
    );
  }

  if (sepayTransfer) {
    return (
      <View className="flex-1 bg-gray-50">
        <Toast
          message={purchaseNotice?.message}
          variant={purchaseNotice?.variant}
        />
        <View className="bg-white px-6 pt-6">
          <View className="flex-row items-center gap-4">
            <Pressable
              onPress={() => setSepayTransfer(null)}
              className="rounded-full p-2"
            >
              <ArrowLeft size={24} color="#111827" />
            </Pressable>

            <Text className="text-2xl font-semibold text-gray-900">
              {t("checkout.sepayTransferTitle")}
            </Text>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pb-10 pt-6"
          showsVerticalScrollIndicator={false}
        >
          <View className="rounded-2xl border border-gray-100 bg-white p-5">
            <View className="items-center">
              <View className="rounded-2xl border border-gray-100 bg-white p-3">
                <Image
                  source={{ uri: getSepayQrUrl(sepayTransfer) }}
                  resizeMode="contain"
                  style={{ width: 240, height: 240 }}
                />
              </View>

              <Text className="mt-3 text-center text-sm text-gray-600">
                {t("checkout.sepayScanHint")}
              </Text>
            </View>

            {[
              [
                t("checkout.sepayAmount"),
                formatMoney(sepayTransfer.amount, sepayTransfer.currency),
              ],
              [
                t("checkout.sepayBank"),
                sepayTransfer.bankName ||
                  sepayTransfer.bankCode ||
                  fallbackSepayBank.bankCode,
              ],
              [
                t("checkout.sepayAccountNumber"),
                formatBankAccount(sepayTransfer.accountNumber),
              ],
              [
                t("checkout.sepayAccountHolder"),
                sepayTransfer.accountHolder || fallbackSepayBank.accountHolder,
              ],
              [t("checkout.sepayContent"), sepayTransfer.paymentCode],
            ].map(([label, value]) => (
              <View
                key={label}
                className="mt-3 flex-row items-center justify-between gap-4 rounded-xl bg-gray-50 px-4 py-3"
              >
                <Text className="text-sm text-gray-500">{label}</Text>
                <Text
                  selectable
                  className="flex-1 text-right text-sm font-semibold text-gray-900"
                >
                  {value}
                </Text>
              </View>
            ))}

            <View className="mt-4 rounded-xl bg-amber-50 px-4 py-3">
              <Text className="text-center text-sm font-medium text-amber-800">
                {t("checkout.sepayWaiting")}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <Toast
        message={purchaseNotice?.message}
        variant={purchaseNotice?.variant}
      />
      <View className="bg-white px-6 pt-6">
        <View className="flex-row items-center gap-4">
          <Pressable onPress={() => router.back()} className="rounded-full p-2">
            <ArrowLeft size={24} color="#111827" />
          </Pressable>

          <Text className="text-2xl font-semibold text-gray-900">
            {t("checkout.title")}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-32"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mt-6 px-6">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            {t("checkout.selectedPlan")}
          </Text>

          <View className="rounded-3xl bg-[#7B61FF] p-5">
            <View className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1">
              <Text className="text-xs font-semibold text-[#7B61FF]">
                {plan.currency}
              </Text>
            </View>

            <View className="mb-4 flex-row items-start gap-4">
              <Flag value={display?.flag ?? "GL"} large />

              <View className="flex-1">
                <Text className="mb-1 text-xl font-semibold text-white">
                  {translateName(display?.name)} eSIM
                </Text>

                <Text className="text-sm text-white/90">
                  {display?.data} - {display?.validity} - {display?.network}
                </Text>
              </View>
            </View>

            <View className="flex-row items-end justify-between border-t border-white/20 pt-3">
              <Text className="text-sm text-white/90">
                {t("checkout.planPrice")}
              </Text>
              <Text className="text-2xl font-bold text-white">
                {formatMoney(planPrice, plan.currency)}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-6 px-6">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            {t("checkout.promoCode")}
          </Text>

          <View className="rounded-2xl border border-gray-100 bg-white p-5">
            <View className="flex-row gap-3">
              <View className="relative flex-1">
                <View className="absolute left-4 top-0 z-10 h-full justify-center">
                  <Tag size={20} color="#9CA3AF" />
                </View>

                <TextInput
                  value={promoCode}
                  onChangeText={(text) => setPromoCode(text.toUpperCase())}
                  placeholder={t("checkout.enterPromo")}
                  placeholderTextColor="#9CA3AF"
                  editable={!appliedPromo}
                  className={`rounded-xl bg-gray-50 py-3 pl-12 pr-4 text-gray-900 ${
                    appliedPromo ? "opacity-50" : ""
                  }`}
                />
              </View>

              <Pressable
                onPress={handleApplyPromo}
                disabled={appliedPromo || !promoCode}
                className={`items-center justify-center rounded-xl px-5 py-3 ${
                  appliedPromo
                    ? "bg-green-50"
                    : promoCode
                      ? "bg-[#7B61FF]"
                      : "bg-gray-100"
                }`}
              >
                {appliedPromo ? (
                  <Check size={20} color="#047857" />
                ) : (
                  <Text
                    className={`font-medium ${
                      promoCode ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {t("common.apply")}
                  </Text>
                )}
              </Pressable>
            </View>

            {appliedPromo ? (
              <View className="mt-3 flex-row items-center gap-2">
                <Check size={16} color="#047857" />
                <Text className="text-sm text-green-700">
                  {t("checkout.promoAppliedBang")}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View className="mt-6 px-6">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            {t("checkout.paymentMethod")}
          </Text>

          <View className="flex-row flex-wrap justify-between gap-y-3">
            {paymentMethods.map(({ id, labelKey, icon: Icon }) => {
              const isSelected = selectedPayment === id;

              return (
                <Pressable
                  key={id}
                  onPress={() => setSelectedPayment(id)}
                  className={`rounded-2xl border-2 p-4 ${
                    isSelected
                      ? "border-[#7B61FF] bg-[#F5F0FF]"
                      : "border-gray-200 bg-white"
                  }`}
                  style={{ width: "48%" }}
                >
                  <View
                    className={`mb-2 h-10 w-10 items-center justify-center rounded-xl ${
                      isSelected ? "bg-[#7B61FF]" : "bg-gray-100"
                    }`}
                  >
                    <Icon
                      size={20}
                      color={isSelected ? "#FFFFFF" : "#4B5563"}
                    />
                  </View>

                  <Text
                    className={`text-sm font-medium ${
                      isSelected ? "text-[#7B61FF]" : "text-gray-900"
                    }`}
                  >
                    {t(labelKey)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="mt-6 px-6">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            {t("checkout.orderSummary")}
          </Text>

          <View className="rounded-2xl border border-gray-100 bg-white p-5">
            <View className="mb-3 flex-row justify-between">
              <Text className="text-gray-700">{t("checkout.planPrice")}</Text>
              <Text className="font-medium text-gray-900">
                {formatMoney(planPrice, plan.currency)}
              </Text>
            </View>

            {appliedPromo ? (
              <View className="mb-3 flex-row justify-between">
                <Text className="text-green-600">{t("common.discount")}</Text>
                <Text className="font-medium text-green-600">
                  -{formatMoney(discount, plan.currency)}
                </Text>
              </View>
            ) : null}

            <View className="mb-3 flex-row justify-between">
              <Text className="text-gray-700">{t("checkout.taxesFees")}</Text>
              <Text className="font-medium text-gray-900">
                {formatMoney(taxes, plan.currency)}
              </Text>
            </View>

            <View className="mt-3 flex-row justify-between border-t border-gray-200 pt-3">
              <Text className="text-lg font-semibold text-gray-900">
                {t("common.total")}
              </Text>
              <Text className="text-lg font-bold text-[#7B61FF]">
                {formatMoney(total, plan.currency)}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-6 px-6">
          <View className="flex-row flex-wrap justify-between gap-y-3">
            {trustBadges.map(({ icon: Icon, labelKey }) => (
              <View
                key={labelKey}
                className="items-center rounded-2xl bg-white p-4"
                style={{ width: "48%" }}
              >
                <View className="mb-2 h-10 w-10 items-center justify-center rounded-xl bg-[#F5F0FF]">
                  <Icon size={20} color="#7B61FF" />
                </View>

                <Text className="text-center text-xs font-medium text-gray-700">
                  {t(labelKey)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-6 px-6">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            {t("checkout.whatNext")}
          </Text>

          <View className="rounded-2xl border border-gray-100 bg-white p-5">
            {benefits.map(({ icon: Icon, labelKey }) => (
              <View key={labelKey} className="mb-3 flex-row items-center gap-3">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#F5F0FF]">
                  <Icon size={18} color="#7B61FF" />
                </View>

                <Text className="flex-1 text-sm text-gray-700">
                  {t(labelKey)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View className="border-t border-gray-200 bg-white px-6 pb-8 pt-4">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-sm text-gray-500">{t("common.total")}</Text>
          <Text className="text-2xl font-bold text-gray-900">
            {formatMoney(total, plan.currency)}
          </Text>
        </View>
        {purchaseError ? (
          <Text className="mb-3 text-center text-sm font-medium text-red-600">
            {purchaseError}
          </Text>
        ) : null}

        <Pressable
          onPress={handleCompletePurchase}
          disabled={purchasePending}
          className={`w-full rounded-2xl px-6 py-4 ${
            purchasePending ? "bg-gray-300" : "bg-[#7B61FF]"
          }`}
        >
          <Text className="text-center font-medium text-white">
            {purchasePending
              ? t("checkout.completing")
              : t("checkout.completePurchase")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
