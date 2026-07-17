import type { User as SupabaseUser } from "@supabase/supabase-js";

import type { ProfileUser } from "./types";

export function formatMemberSince(createdAt?: string) {
  if (!createdAt) {
    return "Today";
  }

  return new Intl.DateTimeFormat("en", {
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

export function getProfileUser(authUser: SupabaseUser): ProfileUser {
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
