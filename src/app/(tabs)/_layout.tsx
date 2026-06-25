import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import {
  Globe,
  Home as HomeIcon,
  Smartphone,
  User,
} from 'lucide-react-native';
import type { ComponentProps, ComponentType } from 'react';
import { Pressable, Text, View } from 'react-native';

type IconComponent = ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

const active = '#6915E0';
const inactive = '#9CA3AF';

const tabItems: Record<string, { icon: IconComponent; label: string }> = {
  home: { icon: HomeIcon, label: 'Home' },
  explore: { icon: Globe, label: 'Explore' },
  'my-esims': { icon: Smartphone, label: 'My eSIMs' },
  profile: { icon: User, label: 'Profile' },
};

const CustomTabBar: NonNullable<ComponentProps<typeof Tabs>['tabBar']> = ({
  state,
  descriptors,
  navigation,
}) => {
  return (
    <View className="border-t border-[#F3F4F6] bg-white px-2 py-3">
      <View className="flex-row items-center justify-around">
        {state.routes.map((route, index) => {
          const options = descriptors[route.key]?.options;
          const item = tabItems[route.name];
          const label =
            item?.label ??
            (typeof options?.title === 'string' ? options.title : route.name);
          const Icon = item?.icon ?? HomeIcon;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options?.tabBarAccessibilityLabel}
              testID={options?.tabBarButtonTestID}
              onPress={onPress}
              className="items-center px-3 py-1"
            >
              {isFocused ? (
                <LinearGradient
                  colors={['#6915E0', '#9864E1']}
                  style={{
                    width: 40,
                    height: 24,
                    borderRadius: 999,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 2,
                  }}
                >
                  <Icon size={14} color="#FFFFFF" strokeWidth={2.4} />
                </LinearGradient>
              ) : (
                <Icon size={20} color={inactive} strokeWidth={2.4} />
              )}

              <Text
                className="mt-1 text-xs font-medium"
                style={{ color: isFocused ? active : inactive }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="home"
        options={{ title: 'Home' }}
      />
      <Tabs.Screen
        name="explore"
        options={{ title: 'Explore' }}
      />
      <Tabs.Screen
        name="my-esims"
        options={{ title: 'My eSIMs' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile' }}
      />
    </Tabs>
  );
}
