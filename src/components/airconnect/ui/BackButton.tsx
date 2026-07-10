import { router, type Href } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import {
  Platform,
  Pressable,
  type GestureResponderEvent,
} from "react-native";

export function BackButton({
  fallbackHref = "/(tabs)/home",
  onPress,
}: {
  fallbackHref?: Href;
  onPress?: (event: GestureResponderEvent) => void;
}) {
  const handlePress = () => {
    if (Platform.OS !== "web" && !router.canGoBack()) {
      router.replace(fallbackHref);
      return;
    }

    router.back();
  };

  return (
    <Pressable
      accessibilityLabel="Go back"
      accessibilityRole="button"
      hitSlop={12}
      onPress={onPress ?? handlePress}
      className="h-10 w-10 items-center justify-center rounded-full bg-white"
    >
      <ArrowLeft size={22} color="#111827" />
    </Pressable>
  );
}
