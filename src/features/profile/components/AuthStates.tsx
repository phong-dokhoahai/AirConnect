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
              Sign in to AirConnect
            </Text>

            <Text className="text-white/80 text-sm leading-5 mt-2">
              Use Google to create your account or continue to your travel
              profile.
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
                {signingIn ? "Opening Google..." : "Continue with Google"}
              </Text>
            </Pressable>
          </CustomLinearGradient>

          {!!error && <AuthMessage message={error} />}

          <View className="mt-5">
            <SectionCard title="Why Sign In">
              <SettingItem
                item={{
                  icon: Shield,
                  label: "Secure checkout",
                  sub: "Keep purchases tied to your account",
                }}
              />
              <SettingItem
                item={{
                  icon: Smartphone,
                  label: "Saved eSIMs",
                  sub: "Access plans across devices",
                }}
              />
              <SettingItem
                item={{
                  icon: Gift,
                  label: "Travel rewards",
                  sub: "Track points and benefits",
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
  return (
    <ProfileShell>
      <View className="flex-1 items-center justify-center px-6">
        <ActivityIndicator color="#6915E0" />
        <Text className="mt-3 text-sm font-medium text-gray-500">
          Loading your profile...
        </Text>
      </View>
    </ProfileShell>
  );
}
