import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ArrowBack from "@expo/material-symbols/arrow_back.xml";
import Delete from "@expo/material-symbols/delete.xml";
import { Icon } from "@/components/Icon";
import { IconButton } from "@/components/IconButton";
import {
  CategoryCreateButton,
  CategoryCreateForm,
} from "@/components/CategoryCreation";
import { useStore } from "@/store/useStore";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const categories = useStore((state) => state.categories);
  const isCategoriesLoading = useStore((state) => state.isCategoriesLoading);
  const deleteCategory = useStore((state) => state.deleteCategory);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const handleDeleteCategory = useCallback(
    (categoryId: string, categoryName: string) => {
      Alert.alert(
        "Delete category?",
        `"${categoryName}" will be removed. Songs in this category will stay in your library without a category.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              void deleteCategory(categoryId).catch((error: unknown) => {
                Alert.alert(
                  "Unable to delete category",
                  error instanceof Error ? error.message : "Please try again.",
                );
              });
            },
          },
        ],
      );
    },
    [deleteCategory],
  );

  const handleCategoryCreated = useCallback(() => {
    setIsCreatingCategory(false);
  }, []);

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-6 py-4">
        <IconButton
          onPress={router.back}
          source={ArrowBack}
          size={22}
          tint="#FFFFFF"
        />
        <Text className="flex-1 text-center text-white text-xl font-bold">
          Settings
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="px-8 pt-4 pb-3 text-gray-400 text-sm font-semibold uppercase">
          Categories
        </Text>

        {isCategoriesLoading ? (
          <ActivityIndicator className="py-6" color="#41a9e3" />
        ) : isCreatingCategory ? (
          <CategoryCreateForm
            onCancel={() => setIsCreatingCategory(false)}
            onCreated={handleCategoryCreated}
          />
        ) : (
          <CategoryCreateButton
            label="Add category"
            onPress={() => setIsCreatingCategory(true)}
          />
        )}

        {!isCategoriesLoading && categories.length === 0 ? (
          <Text className="px-8 py-4 text-gray-400">
            No categories yet.
          </Text>
        ) : !isCategoriesLoading ? (
          <View className="px-8">
            {categories.map((category) => (
              <View
                key={category.id}
                className="mb-2 flex-row items-center rounded-xl bg-[#121821] px-4 py-2"
              >
                <Text className="flex-1 text-white text-base font-medium">
                  {category.name ?? category.id}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${category.name ?? "category"}`}
                  className="h-11 w-11 items-center justify-center rounded-full bg-gray-800"
                  onPress={() =>
                    handleDeleteCategory(
                      category.id,
                      category.name ?? "this category",
                    )
                  }
                >
                  <Icon source={Delete} size={22} tint="#D1D5DB" />
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
