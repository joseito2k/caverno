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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Host, OutlinedTextField, Text, Icon as EuiIcon, useNativeState } from "@expo/ui/jetpack-compose";
import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";
import KeyboardArrowDown from "@expo/material-symbols/keyboard_arrow_down.xml";
import {
  CategoryCreateButton,
  CategoryCreateForm,
} from "@/components/CategoryCreation";
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
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);
  const { categories } = useStore();
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
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

  const handleSheetDismiss = useCallback(() => {
    setIsCreatingCategory(false);
  }, []);

  const handleCategoryCreated = useCallback((categoryId: string) => {
    field.onChange(categoryId);
    sheetRef.current?.close();
  }, [field]);

  const renderCreateCategoryButton = useCallback(
    () => (
      <CategoryCreateButton onPress={() => setIsCreatingCategory(true)} />
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
        snapPoints={["72%", "88%"]}
        topInset={insets.top}
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
          <CategoryCreateForm
            onCancel={() => setIsCreatingCategory(false)}
            onCreated={handleCategoryCreated}
            renderInput={(props) => <BottomSheetTextInput {...props} />}
          />
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
