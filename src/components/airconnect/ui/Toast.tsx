import { useEffect, useState } from "react";
import { Animated, Easing, Text } from "react-native";

type ToastProps = {
  message?: string | null;
  variant?: "success" | "error";
};

const DISPLAY_MS = 3000;
const ANIMATION_MS = 220;

export function Toast({ message, variant = "success" }: ToastProps) {
  const [opacity] = useState(() => new Animated.Value(message ? 1 : 0));
  const [translateY] = useState(() => new Animated.Value(message ? 0 : 12));

  useEffect(() => {
    if (!message) return;

    opacity.setValue(0);
    translateY.setValue(12);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: ANIMATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: ANIMATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const timeoutId = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: ANIMATION_MS,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 12,
          duration: ANIMATION_MS,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, DISPLAY_MS);

    return () => clearTimeout(timeoutId);
  }, [message, opacity, translateY]);

  if (!message) return null;

  const isError = variant === "error";

  return (
    <Animated.View
      pointerEvents="none"
      className={`absolute bottom-8 left-5 z-50 rounded-2xl border px-4 py-3 ${
        isError
          ? "border-red-100 bg-red-50"
          : "border-emerald-100 bg-emerald-50"
      }`}
      style={{ maxWidth: 320, opacity, transform: [{ translateY }] }}
    >
      <Text
        className={`text-sm font-semibold ${
          isError ? "text-red-700" : "text-emerald-700"
        }`}
      >
        {message}
      </Text>
    </Animated.View>
  );
}
