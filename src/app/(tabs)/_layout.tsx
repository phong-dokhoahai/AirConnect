import AnimatedTabBar, {
  type TabsConfigsType,
} from "curved-bottom-navigation-bar";
import { Tabs } from "expo-router";
import { Globe, Home as HomeIcon, Smartphone, User } from "lucide-react-native";
import type { ComponentProps, ComponentType } from "react";
import { useI18n } from "@/lib/i18n";

type IconComponent = ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

const active = "#5B21B6";
const inactive = "#4B5563";
const barColor = "#F5F3FF";

function createTabConfig(Icon: IconComponent): TabsConfigsType[string] {
  return {
    icon: ({ focused }) => (
      <Icon
        size={focused ? 24 : 22}
        color={focused ? "#FFFFFF" : inactive}
        strokeWidth={2.5}
      />
    ),
  };
}

const tabs: TabsConfigsType = {
  home: createTabConfig(HomeIcon),
  explore: createTabConfig(Globe),
  "my-esims": createTabConfig(Smartphone),
  profile: createTabConfig(User),
};

type ExpoTabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0];

const CurvedTabBar = AnimatedTabBar as unknown as ComponentType<
  ExpoTabBarProps & {
    tabs: TabsConfigsType;
    barColor?: string;
    dotColor?: string;
    dotSize?: number;
    barHeight?: number;
    duration?: number;
    titleShown?: boolean;
  }
>;

export default function TabsLayout() {
  const { t } = useI18n();

  return (
    <Tabs
      tabBar={(props) => (
        <CurvedTabBar
          {...props}
          tabs={tabs}
          barColor={barColor}
          dotColor={active}
          dotSize={56}
          barHeight={72}
          duration={420}
          titleShown={true}
        />
      )}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" options={{ title: t("tabs.home") }} />
      <Tabs.Screen name="explore" options={{ title: t("tabs.explore") }} />
      <Tabs.Screen name="my-esims" options={{ title: t("tabs.myEsims") }} />
      <Tabs.Screen name="profile" options={{ title: t("tabs.profile") }} />
    </Tabs>
  );
}
