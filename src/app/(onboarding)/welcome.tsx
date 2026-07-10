import { router } from "expo-router";
import { Globe2, MapPin, Signal } from "lucide-react-native";
import { useCallback, useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

function BouncingPin({
  size,
  color,
  delay = 0,
}: {
  size: number;
  color: string;
  delay?: number;
}) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-10, {
            duration: 600,
            easing: Easing.out(Easing.quad),
          }),
          withTiming(0, {
            duration: 600,
            easing: Easing.in(Easing.quad),
          }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <MapPin size={size} color={color} />
    </Animated.View>
  );
}

export default function WelcomeRoute() {
  const scale = useSharedValue(1);
  const navigateHome = useCallback(() => {
    router.push("/(tabs)/home");
  }, []);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.08, {
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1, {
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1,
      false,
    );
  }, [scale]);

  // useEffect(() => {
  //   if (Platform.OS !== "android") return;

  //   const subscription = BackHandler.addEventListener(
  //     "hardwareBackPress",
  //     () => {
  //       navigateHome();
  //       return true;
  //     },
  //   );

  //   return () => subscription.remove();
  // }, [navigateHome]);

  const globeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6 pt-16 pb-8">
        <View className="relative mb-8 h-64 w-64">
          <View className="absolute inset-0 items-center justify-center">
            <View className="h-48 w-48 rounded-full bg-[#7B61FF]/20" />
          </View>

          <View className="relative h-full items-center justify-center">
            <Animated.View style={globeStyle}>
              <Globe2 size={128} color="#7B61FF" strokeWidth={1.5} />
            </Animated.View>

            <View className="absolute right-16 top-12">
              <BouncingPin size={32} color="#5B8DEF" delay={100} />
            </View>

            <View className="absolute bottom-16 left-12">
              <BouncingPin size={24} color="#7B61FF" delay={300} />
            </View>

            <View className="absolute left-20 top-20">
              <BouncingPin size={28} color="#5B8DEF" delay={200} />
            </View>
          </View>
        </View>

        <Text className="mb-4 text-center text-3xl font-semibold text-gray-900">
          Stay Connected Anywhere
        </Text>

        <Text className="max-w-sm text-center text-base leading-relaxed text-gray-600">
          Buy and activate eSIMs in minutes for over 200 destinations worldwide.
        </Text>

        <View className="mt-8 flex-row items-center gap-2 rounded-full bg-gray-50 px-4 py-2">
          <Signal size={16} color="#7B61FF" />
          <Text className="text-sm text-gray-700">Instant activation</Text>
        </View>
      </View>

      <View className="gap-3 px-6 pb-8">
        <Pressable
          onPress={() => router.push("/purpose")}
          className="w-full rounded-2xl bg-[#7B61FF] px-6 py-4"
        >
          <Text className="text-center font-medium text-white">
            Get Started
          </Text>
        </Pressable>

        <Pressable onPress={navigateHome} className="w-full px-6 py-4">
          <Text className="text-center font-medium text-gray-600">Skip</Text>
        </Pressable>
      </View>
    </View>
  );
}
