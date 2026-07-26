import { Pressable, Text, View } from "react-native";

import type { Plan } from "@/constants/airconnect";
import { useI18n } from "@/lib/i18n";
import { Badge } from "./Badge";
import { Flag } from "./Flag";
import { Row } from "./Row";

export function PlanCard({
  plan,
  onPress,
}: {
  plan: Plan;
  onPress?: (id: string) => void;
}) {
  const { t, translateName } = useI18n();
  const validity = plan.validity.replace(/\bDays?\b/, t("common.days"));

  return (
    <Pressable
      onPress={() => onPress?.(plan.id)}
      className="rounded-3xl border border-gray-100 bg-white p-4"
    >
      <Row className="items-start gap-3">
        <Flag value={plan.flag} />
        <View className="flex-1">
          <Row className="justify-between">
            <Text className="text-lg font-bold text-gray-950">
              {translateName(plan.country)}
            </Text>
            {plan.savings ? (
              <Badge
                label={t("common.save", { value: plan.savings })}
                tone="bg-emerald-50 text-emerald-700"
              />
            ) : null}
          </Row>
          <Text className="mt-1 text-sm text-gray-500">
            {plan.data} - {validity} - {plan.network}
          </Text>
          <Row className="mt-4 justify-between">
            <Row className="gap-2">
              <Text className="text-2xl font-bold text-gray-950">
                {plan.price}
              </Text>
              {plan.originalPrice ? (
                <Text className="text-sm text-gray-400 line-through">
                  {plan.originalPrice}
                </Text>
              ) : null}
            </Row>
            <Text className="font-semibold text-[#6915E0]">
              {t("common.viewDetails")}
            </Text>
          </Row>
        </View>
      </Row>
    </Pressable>
  );
}
