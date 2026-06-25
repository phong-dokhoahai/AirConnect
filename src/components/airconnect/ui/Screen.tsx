import type React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  paddedContentStyle,
  screenRootStyle,
  screenShellStyle,
  scrollViewStyle,
  unpaddedContentStyle,
} from "./layout";

export function Screen({
  children,
  padded = true,
}: {
  children: React.ReactNode;
  padded?: boolean;
}) {
  return (
    <SafeAreaView
      className="flex-1 bg-gray-50"
      edges={["top", "left", "right"]}
      style={screenRootStyle}
    >
      <View className="flex-1" style={screenShellStyle}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={
            padded ? paddedContentStyle : unpaddedContentStyle
          }
          showsVerticalScrollIndicator={false}
          style={scrollViewStyle}
        >
          {children}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
