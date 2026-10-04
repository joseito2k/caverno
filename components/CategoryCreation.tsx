import { useState, type ComponentProps, type ReactNode } from "react";
import { Alert, Pressable, Text as RNText, TextInput, View } from "react-native";
import Check from "@expo/material-symbols/check.xml";
import Close from "@expo/material-symbols/close.xml";
import { Icon } from "@/components/Icon";
import { useStore } from "@/store/useStore";

type CategoryInputProps = ComponentProps<typeof TextInput>;

export function CategoryCreateButton({
  onPress,
  label = "New category",
}: {
  onPress: () => void;
  label?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#41a9e3",
        borderRadius: 999,
        marginBottom: 8,
        marginHorizontal: 32,
        height: 56,
        paddingHorizontal: 16,
      }}
    >
      <RNText className="text-base text-white font-semibold">+ {label}</RNText>
    </Pressable>
  );
}

export function CategoryCreateForm({
  onCancel,
  onCreated,
  renderInput,
}: {
  onCancel: () => void;
  onCreated?: (categoryId: string) => void;
  renderInput?: (props: CategoryInputProps) => ReactNode;
}) {
  const addCategory = useStore((state) => state.addCategory);
  const [draftCategoryName, setDraftCategoryName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async () => {
    const name = draftCategoryName.trim();
    if (!name || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      const categoryId = await addCategory(name);
      if (!categoryId) {
        throw new Error("The category could not be created.");
      }

      setDraftCategoryName("");
      onCreated?.(categoryId);
    } catch (error) {
      Alert.alert(
        "Unable to create category",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const inputProps: CategoryInputProps = {
    value: draftCategoryName,
    onChangeText: setDraftCategoryName,
    placeholder: "New category name",
    placeholderTextColor: "gray",
    autoFocus: true,
    className: "text-white text-lg font-medium bg-transparent flex-1 ml-2",
    onSubmitEditing: handleCreate,
    editable: !isSaving,
  };

  return (
    <View className="px-8 pb-4">
      <View className="bg-gray-900 border border-gray-600 rounded-full pl-4 pr-2 py-2 flex-row items-center">
        {renderInput ? renderInput(inputProps) : <TextInput {...inputProps} />}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel category creation"
          className="mr-2 h-10 w-10 items-center justify-center rounded-full bg-gray-800 border border-gray-600"
          disabled={isSaving}
          onPress={onCancel}
        >
          <Icon source={Close} size={22} tint="#D1D5DB" />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Save category"
          className="h-10 w-10 items-center justify-center rounded-full bg-[#41a9e3]"
          disabled={isSaving || !draftCategoryName.trim()}
          onPress={handleCreate}
        >
          <Icon source={Check} size={22} tint="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}
