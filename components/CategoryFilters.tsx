import { Text } from "react-native";
import { useStore } from "@/store/useStore";
import { useLikesStore } from "@/store/useLikesStore";
import { Pressable, FlatList } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

export const LIKES_FILTER_ID = "likes";

export default function CategoryFilters({
  selectedCategory,
  setSelectedCategory,
}: {
  selectedCategory: string | null;
  setSelectedCategory: (categoryId: string | null) => void;
}) {
  const categories = useStore((state) => state.categories);
  const likedCount = useLikesStore((s) => s.likedIds.length);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const items = [
    ...categories,
    ...(likedCount > 0 ? [{ id: LIKES_FILTER_ID, name: "Likes" }] : []),
  ];

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginLeft: 12,
        gap: 8,
      }}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => {
            toggleCategory(item.id);
          }}
        >
          <Animated.View
            className="flex-row items-center justify-center px-4 py-2"
            style={{
              borderRadius: selectedCategory === item.id ? 8 : 9999,
              backgroundColor:
                selectedCategory === item.id
                  ? "#364153"
                  : "#1e2939",
              transitionProperty: ['borderRadius', 'backgroundColor'],
              transitionDuration: 300,
            }}
          >
            <Text
              className={`text-sm font-medium ${selectedCategory === item.id ? "text-white" : "text-gray-400"}`}
            >
              {item.name}
            </Text>
          </Animated.View>
        </Pressable>
      )}
    />
  );
}
