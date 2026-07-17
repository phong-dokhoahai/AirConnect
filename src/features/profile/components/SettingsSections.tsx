import {
  Bell,
  BookOpen,
  CreditCard,
  FileText,
  Globe,
  HelpCircle,
  Languages,
  Lock,
  LogOut,
  MessageCircle,
  Monitor,
  Moon,
  Shield,
  Star,
  Sun,
  User
} from "lucide-react-native";
import type { Dispatch, SetStateAction } from "react";
import { Text, View } from "react-native";

import { AuthMessage } from "./AuthMessage";
import { SectionCard, SectionTitle } from "./Section";
import { SettingItem } from "./SettingItem";

type SettingsSectionsProps = {
  pushEnabled: boolean;
  setPushEnabled: Dispatch<SetStateAction<boolean>>;
  promoEnabled: boolean;
  setPromoEnabled: Dispatch<SetStateAction<boolean>>;
  travelAlertsEnabled: boolean;
  setTravelAlertsEnabled: Dispatch<SetStateAction<boolean>>;
  twoFAEnabled: boolean;
  setTwoFAEnabled: Dispatch<SetStateAction<boolean>>;
  darkMode: boolean;
  setDarkMode: Dispatch<SetStateAction<boolean>>;
  error: string | null;
  signOut: () => void;
};

export function SettingsSections(props: SettingsSectionsProps) {
  return (
    <>
      <AccountSettings {...props} />
      <PreferenceSettings {...props} />
      <SecuritySettings {...props} />
      <SupportSettings />
      <AccountActions error={props.error} signOut={props.signOut} />
    </>
  );
}

function AccountSettings({
  pushEnabled,
  setPushEnabled,
  promoEnabled,
  setPromoEnabled,
  travelAlertsEnabled,
  setTravelAlertsEnabled,
}: SettingsSectionsProps) {
  return (
    <View className="mt-5">
      <SectionCard title="Account">
        <SettingItem
          item={{
            icon: User,
            label: "Personal Information",
            sub: "Name, email, phone",
          }}
        />
        <SettingItem
          item={{
            icon: CreditCard,
            label: "Payment Methods",
            sub: "2 cards saved",
          }}
        />
        <SettingItem
          item={{
            icon: Bell,
            label: "Push Notifications",
            sub: "Instant alerts",
            toggle: true,
            toggled: pushEnabled,
          }}
          onPress={() => setPushEnabled((v) => !v)}
        />
        <SettingItem
          item={{
            icon: Star,
            label: "Promotions",
            sub: "Deals & offers",
            toggle: true,
            toggled: promoEnabled,
          }}
          onPress={() => setPromoEnabled((v) => !v)}
        />
        <SettingItem
          item={{
            icon: Globe,
            label: "Travel Alerts",
            sub: "Coverage updates",
            toggle: true,
            toggled: travelAlertsEnabled,
          }}
          onPress={() => setTravelAlertsEnabled((v) => !v)}
        />
      </SectionCard>
    </View>
  );
}

function PreferenceSettings({ darkMode, setDarkMode }: SettingsSectionsProps) {
  return (
    <View className="mt-5">
      <SectionCard title="Preferences">
        <SettingItem
          item={{
            icon: darkMode ? Moon : Sun,
            label: "Appearance",
            sub: darkMode ? "Dark mode" : "Light mode",
            toggle: true,
            toggled: darkMode,
          }}
          onPress={() => setDarkMode((v) => !v)}
        />

        <SettingItem
          item={{
            icon: Languages,
            label: "Language & Region",
            sub: "English • USD • US",
          }}
        />
      </SectionCard>
    </View>
  );
}

function SecuritySettings({
  twoFAEnabled,
  setTwoFAEnabled,
}: SettingsSectionsProps) {
  return (
    <View className="mt-5">
      <SectionCard title="Security">
        <SettingItem
          item={{
            icon: Lock,
            label: "Change Password",
            sub: "Last changed 30 days ago",
          }}
        />

        <SettingItem
          item={{
            icon: Shield,
            label: "Two-Factor Authentication",
            sub: "Authenticator app",
            toggle: true,
            toggled: twoFAEnabled,
          }}
          onPress={() => setTwoFAEnabled((v) => !v)}
        />

        <SettingItem
          item={{
            icon: Monitor,
            label: "Manage Devices",
            sub: "2 active sessions",
          }}
        />

        <SettingItem
          item={{
            icon: FileText,
            label: "Privacy Settings",
            sub: "Data & permissions",
          }}
        />
      </SectionCard>
    </View>
  );
}

function SupportSettings() {
  return (
    <View className="mt-5">
      <SectionCard title="Support">
        <SettingItem
          item={{
            icon: HelpCircle,
            label: "Help Center",
            sub: "Browse articles",
          }}
        />

        <SettingItem
          item={{
            icon: MessageCircle,
            label: "Contact Support",
            sub: "Chat or email",
          }}
        />

        <SettingItem
          item={{
            icon: BookOpen,
            label: "FAQ",
            sub: "Common questions",
          }}
        />

        <SettingItem
          item={{
            icon: FileText,
            label: "Terms & Privacy Policy",
            sub: "Legal information",
          }}
        />
      </SectionCard>
    </View>
  );
}

function AccountActions({
  error,
  signOut,
}: {
  error: string | null;
  signOut: () => void;
}) {
  return (
    <View className="mt-5">
      <SectionTitle title="Account Actions" />

      <View className="bg-white rounded-[24px] border border-gray-100 overflow-hidden">
        <SettingItem
          item={{
            icon: LogOut,
            label: "Sign Out",
            sub: "See you next time!",
          }}
          onPress={signOut}
        />
      </View>

      {!!error && <AuthMessage message={error} />}

      <Text className="text-center text-xs text-gray-400 mt-4 mb-6">
        SimRoam v2.4.1 · Made with ❤️ for travelers
      </Text>
    </View>
  );
}
