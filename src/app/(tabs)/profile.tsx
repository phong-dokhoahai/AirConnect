import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Bell,
  BookOpen,
  ChevronRight,
  Clock,
  CreditCard,
  Edit3,
  FileText,
  Gift,
  Globe,
  Headphones,
  Heart,
  HelpCircle,
  Languages,
  Lock,
  LogOut,
  MessageCircle,
  Monitor,
  Moon,
  Package,
  Settings,
  Shield,
  Smartphone,
  Star,
  Sun,
  Trash2,
  User,
  Wifi,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";

import { useAuth } from "@/lib/auth";
import type { User as SupabaseUser } from "@supabase/supabase-js";

type IconComponent = React.ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

type ProfileUser = {
  name: string;
  email: string;
  phone: string;
  memberSince: string;
  avatar: string;
  tier: string;
  points: number;
  nextTierPoints: number;
  nextTier: string;
};

function formatMemberSince(createdAt?: string) {
  if (!createdAt) {
    return "Today";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(new Date(createdAt));
}

function getInitials(name: string, email: string) {
  const source = name || email;
  const words = source
    .replace(/@.*/, "")
    .split(/[\s._-]+/)
    .filter(Boolean);

  return (
    words
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "AC"
  );
}

function getProfileUser(authUser: SupabaseUser): ProfileUser {
  const metadata = authUser.user_metadata ?? {};
  const name =
    metadata.full_name ||
    metadata.name ||
    metadata.user_name ||
    authUser.email?.split("@")[0] ||
    "AirConnect Traveler";
  const email = authUser.email ?? "No email available";

  return {
    name,
    email,
    phone: "+1 (415) 555-0192",
    memberSince: formatMemberSince(authUser.created_at),
    avatar: getInitials(name, email),
    tier: "Explorer",
    points: 4250,
    nextTierPoints: 6000,
    nextTier: "Adventurer",
  };
}

const stats = [
  {
    label: "Countries\nConnected",
    value: "12",
    icon: Globe,
    from: "#5B8DEF",
    to: "#6915E0",
  },
  {
    label: "Total Data\nUsed",
    value: "148 GB",
    icon: Wifi,
    from: "#6915E0",
    to: "#9864E1",
  },
  {
    label: "eSIMs\nPurchased",
    value: "24",
    icon: Smartphone,
    from: "#9864E1",
    to: "#C084FC",
  },
];

const quickActions = [
  {
    icon: Smartphone,
    label: "My eSIMs",
    sub: "3 active",
    screen: "/(tabs)/my-esims",
    from: "#6915E0",
    to: "#9864E1",
  },
  {
    icon: Package,
    label: "Order History",
    sub: "24 orders",
    screen: "/orders",
    from: "#5B8DEF",
    to: "#6915E0",
  },
  {
    icon: Heart,
    label: "Saved Destinations",
    sub: "8 places",
    screen: "/saved",
    from: "#EC4899",
    to: "#9864E1",
  },
  {
    icon: Headphones,
    label: "Support",
    sub: "24/7 help",
    screen: "/support",
    from: "#10B981",
    to: "#6915E0",
  },
];

type SettingRow = {
  icon: IconComponent;
  label: string;
  sub: string;
  toggle?: boolean;
  toggled?: boolean;
  danger?: boolean;
};

function SectionTitle({ title }: { title: string }) {
  return (
    <View className="px-1 mb-2">
      <Text className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
        {title}
      </Text>
    </View>
  );
}

function StatCard({ stat }: { stat: (typeof stats)[0] }) {
  const Icon = stat.icon;

  return (
    <View className="flex-1 bg-white rounded-3xl p-4 border border-gray-100 items-center">
      <LinearGradient
        colors={[stat.from, stat.to]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="w-10 h-10 rounded-xl items-center justify-center mb-3"
      >
        <Icon size={20} color="#FFFFFF" />
      </LinearGradient>

      <Text className="text-[18px] font-bold text-gray-900 mb-1">
        {stat.value}
      </Text>

      <Text className="text-xs text-center text-gray-500">{stat.label}</Text>
    </View>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View>
      <SectionTitle title={title} />

      <View className="bg-white rounded-[24px] border border-gray-100 overflow-hidden">
        {children}
      </View>
    </View>
  );
}

function SettingItem({
  item,
  onPress,
}: {
  item: SettingRow;
  onPress?: () => void;
}) {
  const Icon = item.icon;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-4 border-b border-gray-50"
    >
      <View
        className={`w-10 h-10 rounded-xl items-center justify-center ${
          item.danger ? "bg-red-50" : "bg-[#F5F0FF]"
        }`}
      >
        <Icon size={18} color={item.danger ? "#EF4444" : "#6915E0"} />
      </View>

      <View className="flex-1 ml-3">
        <Text
          className={`text-sm font-semibold ${
            item.danger ? "text-red-500" : "text-gray-900"
          }`}
        >
          {item.label}
        </Text>

        {!!item.sub && (
          <Text className="text-xs text-gray-500 mt-1">{item.sub}</Text>
        )}
      </View>

      {item.toggle ? (
        <Switch value={!!item.toggled} />
      ) : !item.danger ? (
        <ChevronRight size={18} color="#9CA3AF" />
      ) : null}
    </Pressable>
  );
}

function AuthMessage({ message }: { message: string }) {
  return (
    <View className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
      <Text className="text-sm font-medium text-red-600">{message}</Text>
    </View>
  );
}

function ProfileShell({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-6 pt-14 pb-4 flex-row items-center justify-between border-b border-gray-100">
        <Text className="text-[26px] font-bold text-gray-900">Profile</Text>

        <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
          <Settings size={20} color="#4B5563" />
        </View>
      </View>

      {children}
    </View>
  );
}

function SignedOutProfile({
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
          <LinearGradient
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
          </LinearGradient>

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

function LoadingProfile() {
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

export default function ProfileRoute() {
  const router = useRouter();
  const {
    user: authUser,
    initializing,
    signingIn,
    error,
    signInWithGoogle,
    signOut,
  } = useAuth();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [promoEnabled, setPromoEnabled] = useState(false);
  const [travelAlertsEnabled, setTravelAlertsEnabled] = useState(true);
  const [twoFAEnabled, setTwoFAEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const [rewardsBarWidth, setRewardsBarWidth] = useState(0);

  const profileUser = authUser ? getProfileUser(authUser) : null;
  const rewardsPercent = profileUser
    ? (profileUser.points / profileUser.nextTierPoints) * 100
    : 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setRewardsBarWidth(rewardsPercent);
    }, 400);

    return () => clearTimeout(timer);
  }, [rewardsPercent]);

  if (initializing) {
    return <LoadingProfile />;
  }

  if (!profileUser) {
    return (
      <SignedOutProfile
        signingIn={signingIn}
        error={error}
        onSignIn={signInWithGoogle}
      />
    );
  }

  return (
    <ProfileShell>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        <View className="px-5 pt-5">
          <View className="bg-white rounded-[28px] overflow-hidden border border-gray-100">
            <LinearGradient
              colors={["#6915E0", "#9864E1"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ height: 96 }}
            />

            <View className="px-5 pb-5 -mt-10">
              <View className="flex-row justify-between items-end mb-3">
                <LinearGradient
                  colors={["#5B8DEF", "#6915E0"]}
                  className="w-20 h-20 rounded-[20px] items-center justify-center"
                >
                  <Text className="text-white text-xl font-bold">
                    {profileUser.avatar}
                  </Text>
                </LinearGradient>

                <Pressable className="flex-row items-center bg-gray-100 px-4 py-2 rounded-full">
                  <Edit3 size={14} color="#374151" />
                  <Text className="ml-2 text-sm font-semibold text-gray-700">
                    Edit
                  </Text>
                </Pressable>
              </View>

              <Text className="text-[20px] font-bold text-gray-900">
                {profileUser.name}
              </Text>

              <Text className="text-sm text-gray-500 mt-1">
                {profileUser.email}
              </Text>

              <View className="flex-row flex-wrap mt-3">
                <View className="flex-row items-center bg-[#F5F0FF] px-3 py-2 rounded-full mr-2">
                  <Star size={14} color="#6915E0" />
                  <Text className="text-xs font-semibold text-[#6915E0] ml-1">
                    {profileUser.tier}
                  </Text>
                </View>

                <View className="flex-row items-center bg-gray-100 px-3 py-2 rounded-full">
                  <Clock size={12} color="#6B7280" />
                  <Text className="text-xs text-gray-500 ml-1">
                    Member since {profileUser.memberSince}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className="flex-row mt-5">
            {stats.map((item) => (
              <View key={item.label} className="flex-1 mx-1">
                <StatCard stat={item} />
              </View>
            ))}
          </View>

          <View className="mt-5">
            <SectionTitle title="Quick Actions" />

            <View className="flex-row flex-wrap justify-between gap-y-3">
              {quickActions.map((item) => {
                const Icon = item.icon;

                return (
                  <Pressable
                    key={item.label}
                    onPress={() => router.push(item.screen as any)}
                    className="bg-white rounded-3xl p-4 border border-gray-100"
                    style={{ width: "48%" }}
                  >
                    <LinearGradient
                      colors={[item.from, item.to]}
                      className="w-11 h-11 rounded-xl items-center justify-center mb-3"
                    >
                      <Icon size={20} color="#FFFFFF" />
                    </LinearGradient>

                    <Text className="text-sm font-semibold text-gray-900">
                      {item.label}
                    </Text>

                    <Text className="text-xs text-gray-500 mt-1">
                      {item.sub}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="mt-5">
            <SectionTitle title="Loyalty" />

            <LinearGradient
              colors={["#6915E0", "#9864E1"]}
              className="rounded-[28px] p-5"
            >
              <View className="flex-row justify-between mb-4">
                <View>
                  <View className="flex-row items-center">
                    <Gift size={16} color="#FFFFFF" />
                    <Text className="text-white ml-2">Travel Rewards</Text>
                  </View>

                  <Text className="text-white text-2xl font-bold mt-2">
                    {profileUser.points.toLocaleString()} pts
                  </Text>
                </View>

                <View className="bg-white/20 px-3 py-2 rounded-full">
                  <Text className="text-white text-xs font-bold">
                    {profileUser.tier}
                  </Text>
                </View>
              </View>

              <View className="mb-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-xs text-white/80">
                    {profileUser.tier}
                  </Text>

                  <Text className="text-xs text-white/80">
                    {profileUser.nextTier}
                  </Text>
                </View>

                <View className="h-2 rounded-full bg-white/20 overflow-hidden">
                  <View
                    className="h-full bg-white rounded-full"
                    style={{
                      width: `${rewardsBarWidth}%`,
                    }}
                  />
                </View>

                <Text className="text-xs text-white/80 mt-2">
                  {(
                    profileUser.nextTierPoints - profileUser.points
                  ).toLocaleString()}{" "}
                  pts to {profileUser.nextTier}
                </Text>
              </View>

              <Pressable className="bg-white rounded-2xl py-3 items-center">
                <Text className="font-bold text-[#6915E0]">View Rewards</Text>
              </Pressable>
            </LinearGradient>
          </View>

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

              <SettingItem
                item={{
                  icon: Trash2,
                  label: "Delete Account",
                  sub: "This action is permanent",
                  danger: true,
                }}
              />
            </View>

            {!!error && <AuthMessage message={error} />}

            <Text className="text-center text-xs text-gray-400 mt-4 mb-6">
              SimRoam v2.4.1 · Made with ❤️ for travelers
            </Text>
          </View>
        </View>
      </ScrollView>
    </ProfileShell>
  );
}
