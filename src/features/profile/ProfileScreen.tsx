import { useRouter } from "expo-router";
import { ScrollView, View } from "react-native";

import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

import { LoadingProfile, SignedOutProfile } from "./components/AuthStates";
import { ProfileHeaderCard } from "./components/ProfileHeaderCard";
import { ProfileShell } from "./components/ProfileShell";
import { SettingsSections } from "./components/SettingsSections";
import { QuickActionsGrid, StatsRow } from "./components/SummaryCards";
import { quickActions, stats } from "./constants";
import { useProfilePreferences } from "./hooks/useProfilePreferences";
import { useProfileStats } from "./hooks/useProfileStats";
import { getProfileUser } from "./utils";

export default function ProfileScreen() {
  const router = useRouter();
  const {
    user: authUser,
    initializing,
    signingIn,
    error,
    signInWithGoogle,
    signOut,
  } = useAuth();
  const { language } = useI18n();

  const profileUser = authUser ? getProfileUser(authUser, language) : null;
  const rewardsPercent = profileUser
    ? (profileUser.points / profileUser.nextTierPoints) * 100
    : 0;
  const preferences = useProfilePreferences(rewardsPercent);
  const profileStats = useProfileStats(authUser?.id);
  const accountStats = stats.map((stat) => ({
    ...stat,
    value:
      stat.labelKey === "profile.countriesConnected"
        ? profileStats.countriesConnected
        : stat.labelKey === "profile.totalDataUsed"
          ? profileStats.totalDataUsed
          : profileStats.esimsPurchased,
  }));

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
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="px-5 pt-5">
          <ProfileHeaderCard profileUser={profileUser} />
          <StatsRow stats={accountStats} />
          <QuickActionsGrid
            actions={quickActions}
            onActionPress={(screen) => router.push(screen as never)}
          />
          {/* <LoyaltyCard
            profileUser={profileUser}
            rewardsBarWidth={preferences.rewardsBarWidth}
          /> */}
          <SettingsSections
            pushEnabled={preferences.pushEnabled}
            setPushEnabled={preferences.setPushEnabled}
            promoEnabled={preferences.promoEnabled}
            setPromoEnabled={preferences.setPromoEnabled}
            travelAlertsEnabled={preferences.travelAlertsEnabled}
            setTravelAlertsEnabled={preferences.setTravelAlertsEnabled}
            twoFAEnabled={preferences.twoFAEnabled}
            setTwoFAEnabled={preferences.setTwoFAEnabled}
            darkMode={preferences.darkMode}
            setDarkMode={preferences.setDarkMode}
            error={error}
            signOut={signOut}
          />
        </View>
      </ScrollView>
    </ProfileShell>
  );
}
