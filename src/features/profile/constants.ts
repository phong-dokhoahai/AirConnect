import {
  Globe,
  Headphones,
  Heart,
  Package,
  Smartphone,
  Wifi,
} from "lucide-react-native";

import type { QuickAction, StatItem } from "./types";

export const stats: StatItem[] = [
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

export const quickActions: QuickAction[] = [
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
