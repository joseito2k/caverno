import { useRef, useCallback, useEffect, useState } from "react";
import { View, Text as RNText, Pressable, Keyboard } from "react-native";
import {
  BottomSheetModal,
  BottomSheetFlatList,
  BottomSheetBackdrop,
  BottomSheetTextInput,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { useController } from "react-hook-form";
import { Host, OutlinedTextField, Text, Icon as EuiIcon, useNativeState } from "@expo/ui/jetpack-compose";
import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";
import KeyboardArrowDown from "@expo/material-symbols/keyboard_arrow_down.xml";
import Check from "@expo/material-symbols/check.xml";
import Close from "@expo/material-symbols/close.xml";
import { Icon } from "@/components/Icon";
import { useStore } from "@/store/useStore";
import { DARK_TEXTFIELD_COLORS } from "@/constants/colors";

const CustomHandle = () => (
  <View style={{ alignItems: "center", paddingVertical: 8 }}>
    <View
      style={{
        width: 40,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: "#888",
      }}
    />
  </View>
);

interface CategorySelectorProps {
  name: string;
  control: any;
  disabled?: boolean;
  label?: string;
  required?: boolean;
}

export default function CategorySelector({
  name,
  control,
  disabled = false,
  label = "Category",
  required = false,
}: CategorySelectorProps) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const addCategory = useStore((state) => state.addCategory);
  const { categories } = useStore();
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [draftCategoryName, setDraftCategoryName] = useState("");
  const { field, fieldState } = useController({
    name,
    control,
    rules: required ? { required: `${label} is required` } : undefined,
  });

  const selectedCategory = categories.find((cat) => cat.id === field.value);
  const state = useNativeState(selectedCategory?.name ?? "");

  useEffect(() => {
    const name = selectedCategory?.name ?? "";
    if (state.value !== name) {
      state.value = name;
    }
  }, [field.value]);

  const handleOpen = useCallback(() => {
    if (!disabled) {
      Keyboard.dismiss();
      sheetRef.current?.present();
    }
  }, [disabled]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        onPress={() => sheetRef.current?.dismiss()}
      />
    ),
    [],
  );

  const handleCreateCategory = useCallback(async () => {
    const finalName = draftCategoryName.trim();
    if (!finalName) {
      return;
    }

    const newCategoryId = await addCategory(finalName);
    if (newCategoryId) {
      field.onChange(newCategoryId);
      sheetRef.current?.close();
    }

    setIsCreatingCategory(false);
    setDraftCategoryName("");
  }, [addCategory, draftCategoryName, field]);

  const handleCancelCreateCategory = useCallback(() => {
    setDraftCategoryName("");
    setIsCreatingCategory(false);
  }, []);

  const handleSheetDismiss = useCallback(() => {
    setDraftCategoryName("");
    setIsCreatingCategory(false);
  }, []);

  const renderCreateCategoryButton = useCallback(
    () => (
      <Pressable
        onPress={() => setIsCreatingCategory(true)}
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
        <RNText className="text-base text-white font-semibold">
          + New category
        </RNText>
      </Pressable>
    ),
    [],
  );

  const renderItem = useCallback(
    (onChange: (id: string) => void, value: unknown) =>
      function CategoryItem({ item }: { item: { id: string; name?: string } }) {
        return (
          <Pressable
            onPress={() => {
              onChange(item.id);
              sheetRef.current?.close();
            }}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              backgroundColor:
                value === item.id
                  ? "rgba(96, 165, 250, 0.2)"
                  : "transparent",
              marginBottom: 4,
            }}
          >
            <RNText
              className={`text-base ${value === item.id ? "text-blue-400 font-medium" : "text-white"
                }`}
            >
              {item.name ?? item.id}
            </RNText>
          </Pressable>
        );
      },
    [],
  );

  return (
    <>
      <Pressable onPress={handleOpen}>
        <Host matchContents={{ vertical: true }} style={{ marginBottom: 16 }}>
          <OutlinedTextField
            modifiers={[fillMaxWidth()]}
            value={state}
            readOnly
            singleLine
            isError={!!fieldState.error}
            textStyle={{ fontSize: 20, color: "#FFFFFF" }}
            colors={DARK_TEXTFIELD_COLORS}
          >
            <OutlinedTextField.Label>
              <Text>{label}</Text>
            </OutlinedTextField.Label>
            <OutlinedTextField.TrailingIcon>
              <EuiIcon source={KeyboardArrowDown} size={16} tint="#9CA3AF" />
            </OutlinedTextField.TrailingIcon>
            {fieldState.error?.message && (
              <OutlinedTextField.SupportingText>
                <Text>{fieldState.error.message}</Text>
              </OutlinedTextField.SupportingText>
            )}
          </OutlinedTextField>
        </Host>
      </Pressable>

      <BottomSheetModal
        ref={sheetRef}
        index={categories.length === 0 ? 1 : 0}
        snapPoints={["72%", "90%"]}
        onDismiss={handleSheetDismiss}
        enablePanDownToClose
        handleComponent={CustomHandle}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: "#1f2937" }}
      >
        <RNText className="text-white text-lg font-semibold mb-4 text-center">
          Select Category
        </RNText>

        {isCreatingCategory ? (
          <View className="px-8 pb-4">
            <View className="bg-gray-900 border border-gray-600 rounded-full pl-4 pr-2 py-2 flex-row items-center">
              <BottomSheetTextInput
                value={draftCategoryName}
                onChangeText={setDraftCategoryName}
                placeholder="New category name"
                placeholderTextColor="gray"
                autoFocus
                className="text-white text-lg font-medium bg-transparent flex-1 ml-2"
                onSubmitEditing={handleCreateCategory}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancel category creation"
                className="mr-2 h-10 w-10 items-center justify-center rounded-full bg-gray-800 border border-gray-600"
                onPress={handleCancelCreateCategory}
              >
                <Icon source={Close} size={22} tint="#D1D5DB" />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Save category"
                className="h-10 w-10 items-center justify-center rounded-full bg-[#41a9e3]"
                onPress={handleCreateCategory}
              >
                <Icon source={Check} size={22} tint="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        ) : null}

        <BottomSheetFlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderItem(field.onChange, field.value)}
          ListHeaderComponent={isCreatingCategory ? null : renderCreateCategoryButton}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      </BottomSheetModal>
    </>
  );
}
