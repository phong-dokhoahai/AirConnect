import { useRouter } from "expo-router";
import { ScrollView, View } from "react-native";

import { useAuth } from "@/lib/auth";

import { LoadingProfile, SignedOutProfile } from "./components/AuthStates";
import { LoyaltyCard } from "./components/LoyaltyCard";
import { ProfileHeaderCard } from "./components/ProfileHeaderCard";
import { ProfileShell } from "./components/ProfileShell";
import { SettingsSections } from "./components/SettingsSections";
import { QuickActionsGrid, StatsRow } from "./components/SummaryCards";
import { quickActions, stats } from "./constants";
import { useProfilePreferences } from "./hooks/useProfilePreferences";
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

  const profileUser = authUser ? getProfileUser(authUser) : null;
  const rewardsPercent = profileUser
    ? (profileUser.points / profileUser.nextTierPoints) * 100
    : 0;
  const preferences = useProfilePreferences(rewardsPercent);

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
          <StatsRow stats={stats} />
          <QuickActionsGrid
            actions={quickActions}
            onActionPress={(screen) => router.push(screen as never)}
          />
          <LoyaltyCard
            profileUser={profileUser}
            rewardsBarWidth={preferences.rewardsBarWidth}
          />
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
