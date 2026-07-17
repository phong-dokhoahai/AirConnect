import { useEffect, useState } from "react";

export function useProfilePreferences(rewardsPercent: number) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [promoEnabled, setPromoEnabled] = useState(false);
  const [travelAlertsEnabled, setTravelAlertsEnabled] = useState(true);
  const [twoFAEnabled, setTwoFAEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [rewardsBarWidth, setRewardsBarWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRewardsBarWidth(rewardsPercent);
    }, 400);

    return () => clearTimeout(timer);
  }, [rewardsPercent]);

  return {
    pushEnabled,
    setPushEnabled,
    promoEnabled,
    setPromoEnabled,
    travelAlertsEnabled,
    setTravelAlertsEnabled,
    twoFAEnabled,
    setTwoFAEnabled,
    darkMode,
    setDarkMode,
    rewardsBarWidth,
  };
}
