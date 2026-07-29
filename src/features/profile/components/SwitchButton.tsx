import { useEffect, useState } from "react";
import { Animated, Easing } from "react-native";

export function SwitchButton({ value }: { value: boolean }) {
  const [progress] = useState(() => new Animated.Value(value ? 1 : 0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: value ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [progress, value]);

  const backgroundColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["#E5E7EB", "#6915E0"],
  });
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  return (
    <Animated.View
      className="h-7 w-12 justify-center rounded-full px-1"
      style={{ backgroundColor }}
    >
      <Animated.View
        className="h-5 w-5 rounded-full bg-white"
        style={{ transform: [{ translateX }] }}
      />
    </Animated.View>
  );
}
