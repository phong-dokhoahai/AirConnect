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
    labelKey: "profile.countriesConnected",
    value: "12",
    icon: Globe,
    from: "#5B8DEF",
    to: "#6915E0",
  },
  {
    labelKey: "profile.totalDataUsed",
    value: "148 GB",
    icon: Wifi,
    from: "#6915E0",
    to: "#9864E1",
  },
  {
    labelKey: "profile.esimsPurchased",
    value: "24",
    icon: Smartphone,
    from: "#9864E1",
    to: "#C084FC",
  },
];

export const quickActions: QuickAction[] = [
  {
    icon: Smartphone,
    labelKey: "tabs.myEsims",
    subKey: "profile.myEsimsSub",
    screen: "/(tabs)/my-esims",
    from: "#6915E0",
    to: "#9864E1",
  },
  {
    icon: Package,
    labelKey: "profile.orderHistory",
    subKey: "profile.orderHistorySub",
    screen: "/orders",
    from: "#5B8DEF",
    to: "#6915E0",
  },
  {
    icon: Heart,
    labelKey: "profile.savedDestinations",
    subKey: "profile.savedDestinationsSub",
    screen: "/saved",
    from: "#EC4899",
    to: "#9864E1",
  },
  {
    icon: Headphones,
    labelKey: "profile.support",
    subKey: "profile.supportSub",
    screen: "/support",
    from: "#10B981",
    to: "#6915E0",
  },
];
