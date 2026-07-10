import { ActivityIndicator, Text, View } from 'react-native';

export default function AuthCallbackRoute() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <ActivityIndicator color="#6915E0" />
      <Text className="mt-3 text-sm font-medium text-gray-500">
        Finishing sign in...
      </Text>
    </View>
  );
}
