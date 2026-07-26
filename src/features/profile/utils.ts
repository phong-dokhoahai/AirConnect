import type { User as SupabaseUser } from "@supabase/supabase-js";

import type { ProfileUser } from "./types";
import type { LanguageCode } from "@/lib/i18n";

export function formatMemberSince(createdAt?: string, language: LanguageCode = "en") {
  if (!createdAt) {
    return language === "vi" ? "hôm nay" : "Today";
  }

  return new Intl.DateTimeFormat(language === "vi" ? "vi" : "en", {
    month: "short",
    year: "numeric",
  }).format(new Date(createdAt));
}

export function getInitials(name: string, email: string) {
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

export function getProfileUser(
  authUser: SupabaseUser,
  language: LanguageCode = "en",
): ProfileUser {
  const metadata = authUser.user_metadata ?? {};
  const name =
    metadata.full_name ||
    metadata.name ||
    metadata.user_name ||
    authUser.email?.split("@")[0] ||
    "AirConnect Traveler";
  const email = authUser.email ?? (language === "vi" ? "Không có email" : "No email available");

  return {
    name,
    email,
    phone: "+1 (415) 555-0192",
    memberSince: formatMemberSince(authUser.created_at, language),
    avatar: getInitials(name, email),
    tier: "Explorer",
    points: 4250,
    nextTierPoints: 6000,
    nextTier: "Adventurer",
  };
}
