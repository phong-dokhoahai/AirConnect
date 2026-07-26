import { CustomLinearGradient } from "@/components/ui/CustomLinearGradient";
import { Gift, Globe, Shield, Smartphone, User } from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { AuthMessage } from "./AuthMessage";
import { useI18n } from "@/lib/i18n";
import { ProfileShell } from "./ProfileShell";
import { SectionCard } from "./Section";
import { SettingItem } from "./SettingItem";

export function SignedOutProfile({
  signingIn,
  error,
  onSignIn,
}: {
  signingIn: boolean;
  error: string | null;
  onSignIn: () => void;
}) {
  const { t } = useI18n();

  return (
    <ProfileShell>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="px-5 pt-6">
          <CustomLinearGradient
            colors={["#6915E0", "#9864E1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-[28px] p-5"
          >
            <View className="w-14 h-14 rounded-2xl bg-white/20 items-center justify-center mb-5">
              <User size={26} color="#FFFFFF" />
            </View>

            <Text className="text-white text-[24px] font-bold">
              {t("profile.signInTitle")}
            </Text>

            <Text className="text-white/80 text-sm leading-5 mt-2">
              {t("profile.signInBody")}
            </Text>

            <Pressable
              disabled={signingIn}
              onPress={onSignIn}
              className={`mt-6 flex-row items-center justify-center rounded-2xl bg-white px-5 py-4 ${
                signingIn ? "opacity-70" : ""
              }`}
            >
              {signingIn ? (
                <ActivityIndicator color="#6915E0" />
              ) : (
                <Globe size={20} color="#6915E0" />
              )}
              <Text className="ml-3 text-base font-bold text-[#6915E0]">
                {signingIn ? t("common.openingGoogle") : t("common.continueWithGoogle")}
              </Text>
            </Pressable>
          </CustomLinearGradient>

          {!!error && <AuthMessage message={error} />}

          <View className="mt-5">
            <SectionCard title={t("profile.whySignIn")}>
              <SettingItem
                item={{
                  icon: Shield,
                  label: t("profile.secureCheckout"),
                  sub: t("profile.secureCheckoutSub"),
                }}
              />
              <SettingItem
                item={{
                  icon: Smartphone,
                  label: t("profile.savedEsims"),
                  sub: t("profile.savedEsimsSub"),
                }}
              />
              <SettingItem
                item={{
                  icon: Gift,
                  label: t("profile.travelRewards"),
                  sub: t("profile.travelRewardsSub"),
                }}
              />
            </SectionCard>
          </View>
        </View>
      </ScrollView>
    </ProfileShell>
  );
}

export function LoadingProfile() {
  const { t } = useI18n();

  return (
    <ProfileShell>
      <View className="flex-1 items-center justify-center px-6">
        <ActivityIndicator color="#6915E0" />
        <Text className="mt-3 text-sm font-medium text-gray-500">
          {t("profile.loading")}
        </Text>
      </View>
    </ProfileShell>
  );
}
