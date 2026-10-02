import { Host, OutlinedTextField, Text, useNativeState } from "@expo/ui/jetpack-compose";
import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";
import { useController } from "react-hook-form";
import { DARK_TEXTFIELD_COLORS } from "@/constants/colors";

interface InputControllerProps {
  name: string;
  label: string;
  placeholder: string;
  control: any;
  disabled?: boolean;
  required?: boolean;
  variant?: "default" | "large" | "multiline";
  onFocus?: () => void;
}

export default function InputController({
  name,
  label,
  placeholder,
  control,
  disabled,
  required,
  variant = "default",
  onFocus,
}: InputControllerProps) {
  const { field, fieldState } = useController({
    name,
    control,
    rules: required ? { required: `${label} is required` } : undefined,
  });
  const state = useNativeState(field.value?.toString() ?? "");
  const isMultiline = variant === "multiline";

  const textStyle =
    variant === "large"
      ? { fontSize: 30, fontWeight: "600" as const, color: "#FFFFFF" }
      : variant === "multiline"
        ? { fontSize: 14, lineHeight: 24, color: "#FFFFFF" }
        : { fontSize: 20, color: "#FFFFFF" };

  return (
    <Host matchContents={{ vertical: true }} style={{ marginBottom: 16 }}>
      <OutlinedTextField
        modifiers={[fillMaxWidth()]}
        value={state}
        onValueChange={field.onChange}
        enabled={!disabled}
        isError={!!fieldState.error}
        singleLine={!isMultiline}
        minLines={isMultiline ? 4 : undefined}
        maxLines={isMultiline ? 10 : undefined}
        textStyle={textStyle}
        colors={DARK_TEXTFIELD_COLORS}
        onFocusChanged={(focused) => {
          if (focused) onFocus?.();
        }}
      >
        <OutlinedTextField.Label>
          <Text>{label}</Text>
        </OutlinedTextField.Label>
        <OutlinedTextField.Placeholder>
          <Text>{placeholder}</Text>
        </OutlinedTextField.Placeholder>
        {fieldState.error?.message && (
          <OutlinedTextField.SupportingText>
            <Text>{fieldState.error.message}</Text>
          </OutlinedTextField.SupportingText>
        )}
      </OutlinedTextField>
    </Host>
  );
}
