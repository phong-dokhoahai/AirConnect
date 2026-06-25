import {
  Pressable,
  Text,
  type GestureResponderEvent,
} from "react-native";

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled,
}: {
  label: string;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
}) {
  const base = "items-center justify-center rounded-2xl px-5 py-4";
  const tone =
    variant === "primary"
      ? "bg-[#6915E0]"
      : variant === "secondary"
        ? "bg-white border border-gray-200"
        : "bg-transparent";
  const text =
    variant === "primary"
      ? "text-white"
      : variant === "secondary"
        ? "text-gray-800"
        : "text-[#6915E0]";

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      className={`w-full ${base} ${tone} ${disabled ? "opacity-45" : ""}`}
    >
      <Text className={`text-base font-semibold ${text}`}>{label}</Text>
    </Pressable>
  );
}
