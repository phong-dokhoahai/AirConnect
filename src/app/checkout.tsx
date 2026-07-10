import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Check,
  Clock,
  CreditCard,
  DollarSign,
  Headphones,
  Phone,
  QrCode,
  Shield,
  Smartphone,
  Tag,
  Users,
  Zap,
} from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { plans } from "@/constants/airconnect";

const paymentMethods = [
  { id: "card", label: "Credit / Debit Card", icon: CreditCard },
  { id: "apple-pay", label: "Apple Pay", icon: Smartphone },
  { id: "google-pay", label: "Google Pay", icon: Smartphone },
  { id: "paypal", label: "PayPal", icon: DollarSign },
];

const trustBadges = [
  { icon: Shield, label: "Secure Payment" },
  { icon: Zap, label: "Instant Delivery" },
  { icon: Headphones, label: "24/7 Support" },
  { icon: Users, label: "1M+ Travelers" },
];

const benefits = [
  { icon: QrCode, label: "QR Code Delivered Instantly" },
  { icon: Clock, label: "Activation in Under 2 Minutes" },
  { icon: CreditCard, label: "No Physical SIM Required" },
  { icon: Phone, label: "Keep Your Existing Number" },
];

function parsePrice(price: string) {
  const value = Number.parseFloat(price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(value) ? value : 0;
}

export default function CheckoutRoute() {
  const { planId = "1" } = useLocalSearchParams<{ planId?: string }>();
  const plan = plans.find((item) => item.id === planId) ?? plans[0];
  const [selectedPayment, setSelectedPayment] = useState("card");
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const planPrice = parsePrice(plan.price);
  const discount = appliedPromo ? 2.0 : 0;
  const taxes = 0.5;
  const total = planPrice - discount + taxes;

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === "SUMMER25") {
      setAppliedPromo(true);
    } else {
      Alert.alert("Invalid promo code");
    }
  };

  const handleCompletePurchase = () => {
    if (!fullName || !email) {
      Alert.alert("Please fill in all required fields");
      return;
    }

    router.replace({
      pathname: "/success",
      params: { planId: plan.id, email },
    });
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-6 pt-6">
        <View className="flex-row items-center gap-4">
          <Pressable onPress={() => router.back()} className="rounded-full p-2">
            <ArrowLeft size={24} color="#111827" />
          </Pressable>

          <Text className="text-2xl font-semibold text-gray-900">Checkout</Text>
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
            Selected Plan
          </Text>

          <View className="rounded-3xl bg-[#7B61FF] p-5">
            <View className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1">
              <Text className="text-xs font-semibold text-[#7B61FF]">
                Save 25%
              </Text>
            </View>

            <View className="mb-4 flex-row items-start gap-4">
              <Text className="text-5xl">🇯🇵</Text>

              <View className="flex-1">
                <Text className="mb-1 text-xl font-semibold text-white">
                  {plan.country} eSIM
                </Text>

                <Text className="text-sm text-white/90">
                  {plan.data} - {plan.validity} - {plan.network}
                </Text>
              </View>
            </View>

            <View className="flex-row items-end justify-between border-t border-white/20 pt-3">
              <Text className="text-sm text-white/90">Plan Price</Text>
              <Text className="text-2xl font-bold text-white">
                ${planPrice.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-6 px-6">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            Traveler Information
          </Text>

          <View className="rounded-2xl border border-gray-100 bg-white p-5">
            <Text className="mb-2 text-sm font-medium text-gray-700">
              Full Name <Text className="text-red-500">*</Text>
            </Text>

            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="John Doe"
              placeholderTextColor="#9CA3AF"
              className="mb-4 rounded-xl bg-gray-50 px-4 py-3 text-gray-900"
            />

            <Text className="mb-2 text-sm font-medium text-gray-700">
              Email Address <Text className="text-red-500">*</Text>
            </Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="john@example.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              className="rounded-xl bg-gray-50 px-4 py-3 text-gray-900"
            />

            <Text className="mt-2 text-xs text-gray-500">
              Your eSIM QR code and activation details will be sent to this
              email.
            </Text>
          </View>
        </View>

        <View className="mt-6 px-6">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            Promo Code
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
                  placeholder="Enter promo code"
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
                    Apply
                  </Text>
                )}
              </Pressable>
            </View>

            {appliedPromo ? (
              <View className="mt-3 flex-row items-center gap-2">
                <Check size={16} color="#047857" />
                <Text className="text-sm text-green-700">
                  Promo code applied successfully!
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View className="mt-6 px-6">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            Payment Method
          </Text>

          <View className="flex-row flex-wrap justify-between gap-y-3">
            {paymentMethods.map(({ id, label, icon: Icon }) => {
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
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="mt-6 px-6">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            Order Summary
          </Text>

          <View className="rounded-2xl border border-gray-100 bg-white p-5">
            <View className="mb-3 flex-row justify-between">
              <Text className="text-gray-700">Plan Price</Text>
              <Text className="font-medium text-gray-900">
                ${planPrice.toFixed(2)}
              </Text>
            </View>

            {appliedPromo ? (
              <View className="mb-3 flex-row justify-between">
                <Text className="text-green-600">Discount</Text>
                <Text className="font-medium text-green-600">
                  -${discount.toFixed(2)}
                </Text>
              </View>
            ) : null}

            <View className="mb-3 flex-row justify-between">
              <Text className="text-gray-700">Taxes & Fees</Text>
              <Text className="font-medium text-gray-900">
                ${taxes.toFixed(2)}
              </Text>
            </View>

            <View className="mt-3 flex-row justify-between border-t border-gray-200 pt-3">
              <Text className="text-lg font-semibold text-gray-900">Total</Text>
              <Text className="text-lg font-bold text-[#7B61FF]">
                ${total.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-6 px-6">
          <View className="flex-row flex-wrap justify-between gap-y-3">
            {trustBadges.map(({ icon: Icon, label }) => (
              <View
                key={label}
                className="items-center rounded-2xl bg-white p-4"
                style={{ width: "48%" }}
              >
                <View className="mb-2 h-10 w-10 items-center justify-center rounded-xl bg-[#F5F0FF]">
                  <Icon size={20} color="#7B61FF" />
                </View>

                <Text className="text-center text-xs font-medium text-gray-700">
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-6 px-6">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            What happens next?
          </Text>

          <View className="rounded-2xl border border-gray-100 bg-white p-5">
            {benefits.map(({ icon: Icon, label }) => (
              <View key={label} className="mb-3 flex-row items-center gap-3">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#F5F0FF]">
                  <Icon size={18} color="#7B61FF" />
                </View>

                <Text className="flex-1 text-sm text-gray-700">{label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View className="border-t border-gray-200 bg-white px-6 pb-8 pt-4">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-sm text-gray-500">Total</Text>
          <Text className="text-2xl font-bold text-gray-900">
            ${total.toFixed(2)}
          </Text>
        </View>

        <Pressable
          onPress={handleCompletePurchase}
          className="w-full rounded-2xl bg-[#7B61FF] px-6 py-4"
        >
          <Text className="text-center font-medium text-white">
            Complete Purchase
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
