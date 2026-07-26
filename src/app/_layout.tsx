import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from "react-native-safe-area-context";

import "@/global.css";
import { AuthProvider } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n";

export default function RootLayout() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <I18nProvider>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="plan/[id]" />
            <Stack.Screen name="plan-details" />
            <Stack.Screen name="checkout" />
            <Stack.Screen name="success" />
            <Stack.Screen name="esim-details" />
            <Stack.Screen name="orders" />
            <Stack.Screen name="saved" />
            <Stack.Screen name="support" />
            <Stack.Screen name="auth/callback" />
          </Stack>
          <StatusBar style="dark" />
        </AuthProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}
