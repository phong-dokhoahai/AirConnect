import { Text, View } from "react-native";

export function Flag({
  value,
  large = false,
}: {
  value: string;
  large?: boolean;
}) {
  return (
    <View
      className={`${
        large ? "h-16 w-16 rounded-3xl" : "h-12 w-12 rounded-2xl"
      } items-center justify-center bg-[#6915E0]`}
    >
      <Text
        className={`${large ? "text-xl" : "text-base"} font-bold text-white`}
      >
        {value}
      </Text>
    </View>
  );
}
