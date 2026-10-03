import { ActivityIndicator, Image, Pressable, Text } from "react-native";

type GoogleSignInButtonProps = {
  isLoading: boolean;
  onPress: () => void;
};

export function GoogleSignInButton({
  isLoading,
  onPress,
}: GoogleSignInButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Sign in with Google"
      accessibilityState={{ disabled: isLoading }}
      disabled={isLoading}
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        backgroundColor: pressed ? "#f8fafd" : "#ffffff",
        borderColor: "#747775",
        borderRadius: 50,
        borderWidth: 1,
        flexDirection: "row",
        height: 48,
        justifyContent: "center",
        opacity: isLoading ? 0.7 : 1,
        width: "100%",
      })}
    >
      {isLoading ? (
        <ActivityIndicator color="#1f1f1f" />
      ) : (
        <>
          <Image
            source={require("@/assets/images/google-g-logo.png")}
            className="mr-3 h-5 w-5"
          />
          <Text
            style={{
              color: "#1f1f1f",
              fontSize: 14,
              fontWeight: "500",
            }}
          >
            Sign in with Google
          </Text>
        </>
      )}
    </Pressable>
  );
}