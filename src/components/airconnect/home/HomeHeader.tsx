import { LinearGradient } from "expo-linear-gradient";
import { Bell, Search } from "lucide-react-native";
import { Pressable, Text, TextInput, View } from "react-native";

export function HomeHeader({
  greeting,
  search,
  onSearchChange,
}: {
  greeting: string;
  search: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <View className="bg-white px-6 pt-14 pb-6 rounded-b-[32px]">
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-1 pr-4">
          <Text className="text-[28px] font-semibold text-[#111827]">
            {greeting},
          </Text>

          <Text className="text-[28px] font-semibold text-[#111827]">
            John {"\uD83D\uDC4B"}
          </Text>

          <Text className="text-sm text-[#6B7280] mt-1">
            Ready for your next trip?
          </Text>
        </View>

        <View className="flex-row items-center">
          <Pressable className="mr-3 p-2">
            <View>
              <Bell size={24} color="#4B5563" />

              <View
                style={{
                  position: "absolute",
                  top: 1,
                  right: 1,
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: "#7B61FF",
                }}
              />
            </View>
          </Pressable>

          <LinearGradient
            colors={["#5B8DEF", "#7B61FF"]}
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text className="text-white font-semibold">J</Text>
          </LinearGradient>
        </View>
      </View>

      <View className="relative">
        <View
          style={{
            position: "absolute",
            left: 16,
            top: 16,
            zIndex: 10,
          }}
        >
          <Search size={20} color="#9CA3AF" />
        </View>

        <TextInput
          value={search}
          onChangeText={onSearchChange}
          placeholder="Search destination, region, or eSIM"
          className="bg-[#F3F4F6] rounded-2xl pl-12 pr-4 py-4 text-[#111827]"
        />
      </View>
    </View>
  );
}
