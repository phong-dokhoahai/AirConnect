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
import { getPlanDisplay, type PlanDisplayRow } from "@/lib/planDisplay";

export default function SuccessRoute() {
  const { planId, email } = useLocalSearchParams<{
    planId?: string;
    email?: string;
  }>();
  const { user: authUser } = useAuth();
  const [plan, setPlan] = useState<PlanDisplayRow | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(planId));
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!planId) return;

    getPlanDetails(planId)
      .then(({ data, error }) => {
        if (!isMounted) return;

        if (error || !data) {
          console.error("Success plan load failed", error);
          setLoadError("Unable to load this package.");
        } else {
          setPlan(data as unknown as PlanDisplayRow);
          setLoadError(null);
        }
      })
      .catch((error) => {
        if (isMounted) {
          console.error("Success plan load failed", error);
          setLoadError("Unable to load this package.");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [planId]);

  const purchaseDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const display = plan ? getPlanDisplay(plan) : null;
  const deliveryEmail = email ?? authUser?.email;

  if (isLoading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#6915E0" />
          <Text className="mt-3 text-sm text-gray-600">Loading package...</Text>
        </View>
      </Screen>
    );
  }

  if (!planId || !plan || loadError) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-lg font-bold text-gray-950">
            {loadError ?? (planId ? "Package unavailable." : "Missing plan.")}
          </Text>
          <Button
            label="Home"
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
          Payment Successful
        </Text>
        <Text className="mt-2 text-center text-lg text-white opacity-90">
          Your eSIM is ready to use.
        </Text>
      </View>
      <View className="-mt-8 px-5">
        <View className="rounded-[32px] bg-white p-6">
          <Row className="items-start gap-4">
            <Flag value={display?.flag ?? "GL"} large />
            <View className="flex-1">
              <Text className="text-xl font-black text-gray-950">
                {display?.name} eSIM
              </Text>
              <Text className="mt-2 text-sm text-gray-500">
                {display?.data} - {display?.validity} - {display?.network}
              </Text>
              <Text className="mt-3 text-xs text-gray-500">
                Plan ID: {plan.id}
              </Text>
              <Text className="mt-1 text-xs text-gray-500">
                Purchase Date: {purchaseDate}
              </Text>
            </View>
          </Row>
        </View>
      </View>
      <View className="px-5">
        <Section title="eSIM Status">
          {[
            "Payment Confirmed",
            "eSIM Generated",
            "QR Code Ready",
            "Activation Available",
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
                Completed
              </Text>
            </Row>
          ))}
        </Section>
        <Section title="Install in Minutes">
          {[
            {
              icon: Settings,
              label: "Open Settings",
              sub: "Go to Settings > Cellular",
            },
            { icon: QrCode, label: "Scan QR Code", sub: "Add Cellular Plan" },
            {
              icon: Zap,
              label: "Activate eSIM",
              sub: "Ready to use instantly",
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
        <Section title="Delivery Information">
          <Row className="items-start gap-3">
            <Mail size={22} color="#6915E0" />
            <Text className="flex-1 text-sm leading-6 text-gray-600">
              {deliveryEmail
                ? `Your QR code and activation details were sent to ${deliveryEmail} and are available in My eSIMs.`
                : "Your QR code and activation details are available in My eSIMs."}
            </Text>
          </Row>
        </Section>
        <View className="mt-5 gap-3 pb-6">
          <Button
            label="Install eSIM"
            onPress={() =>
              router.push({ pathname: "/esim-details", params: { id: plan.id } })
            }
          />
          <Button
            label="View My eSIM"
            variant="secondary"
            onPress={() => router.replace("/(tabs)/my-esims")}
          />
          <Button
            label="Home"
            variant="ghost"
            onPress={() => router.replace("/(tabs)/home")}
          />
        </View>
      </View>
    </Screen>
  );
}
