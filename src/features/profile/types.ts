import type React from "react";

export type IconComponent = React.ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

export type ProfileUser = {
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

export type StatItem = {
  label: string;
  value: string;
  icon: IconComponent;
  from: string;
  to: string;
};

export type QuickAction = {
  icon: IconComponent;
  label: string;
  sub: string;
  screen: string;
  from: string;
  to: string;
};

export type SettingRow = {
  icon: IconComponent;
  label: string;
  sub: string;
  toggle?: boolean;
  toggled?: boolean;
  danger?: boolean;
};
