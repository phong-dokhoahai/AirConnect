import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import {
  exchangeOAuthCallbackCode,
  getOAuthCallbackCodeFromParams,
} from '@/lib/auth';

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function AuthCallbackRoute() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const finishSignIn = async () => {
      try {
        const searchParams = new URLSearchParams();

        for (const [key, value] of Object.entries(params)) {
          const paramValue = getParamValue(value);

          if (paramValue) {
            searchParams.set(key, paramValue);
          }
        }

        const code = getOAuthCallbackCodeFromParams(searchParams);
        await exchangeOAuthCallbackCode(code);
        router.replace('/(tabs)/profile');
      } catch (callbackError) {
        setError(
          callbackError instanceof Error
            ? callbackError.message
            : 'Could not finish sign in.',
        );
      }
    };

    void finishSignIn();
  }, [params, router]);

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      {!error && <ActivityIndicator color="#6915E0" />}
      <Text className="mt-3 text-sm font-medium text-gray-500">
        {error ?? 'Finishing sign in...'}
      </Text>
    </View>
  );
}
