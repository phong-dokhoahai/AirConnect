import { Text, View } from "react-native";

type ToastProps = {
  message?: string | null;
  variant?: "success" | "error";
};

export function Toast({ message, variant = "success" }: ToastProps) {
  if (!message) return null;

  const isError = variant === "error";

  return (
    <View
      pointerEvents="none"
      className={`absolute left-5 right-5 top-14 z-50 rounded-2xl border px-4 py-3 ${
        isError
          ? "border-red-100 bg-red-50"
          : "border-emerald-100 bg-emerald-50"
      }`}
    >
      <Text
        className={`text-center text-sm font-semibold ${
          isError ? "text-red-700" : "text-emerald-700"
        }`}
      >
        {message}
      </Text>
    </View>
  );
}
