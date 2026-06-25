import { ChevronRight } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

export function SectionHeader({
  title,
  showSeeAll = true,
}: {
  title: string;
  showSeeAll?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between mb-3">
      <Text className="text-lg font-semibold text-[#111827]">{title}</Text>

      {showSeeAll ? (
        <Pressable className="flex-row items-center">
          <Text className="text-[#7B61FF] mr-1">See All</Text>
          <ChevronRight size={16} color="#7B61FF" />
        </Pressable>
      ) : null}
    </View>
  );
}
