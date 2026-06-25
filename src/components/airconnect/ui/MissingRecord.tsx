import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "./Button";
import { fullScreenShellStyle } from "./layout";

export function MissingRecord({
  title,
  message,
  onBack,
}: {
  title: string;
  message: string;
  onBack: () => void;
}) {
  return (
    <SafeAreaView
      className="flex-1 bg-gray-50"
      edges={["top", "bottom", "left", "right"]}
    >
      <View className="flex-1" style={fullScreenShellStyle}>
        <View className="flex-1 items-center justify-center px-5">
          <View className="h-20 w-20 items-center justify-center rounded-3xl bg-purple-100">
            <Text className="text-3xl font-black text-[#6915E0]">?</Text>
          </View>
          <Text className="mt-6 text-center text-3xl font-black text-gray-950">
            {title}
          </Text>
          <Text className="mt-2 text-center text-base leading-6 text-gray-500">
            {message}
          </Text>
          <View className="mt-8">
            <Button label="Go Back" onPress={onBack} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
