import "../global.css";
import type {
  ParamListBase,
  StackNavigationState,
} from "expo-router/react-navigation";
import { withLayoutContext } from "expo-router";
import Transition, {
  createNativeStackNavigator,
  type NativeStackNavigationEventMap,
  type NativeStackNavigationOptions,
} from "react-native-screen-transitions";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { SafeAreaListener } from "react-native-safe-area-context";
import { Uniwind } from "uniwind";
import * as SystemUI from "expo-system-ui";

SystemUI.setBackgroundColorAsync("transparent");

const { Navigator } = createNativeStackNavigator();
const Stack = withLayoutContext<
  NativeStackNavigationOptions,
  typeof Navigator,
  StackNavigationState<ParamListBase>,
  NativeStackNavigationEventMap
>(Navigator);

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <SafeAreaListener
          onChange={({ insets }) => {
            Uniwind.updateInsets(insets);
          }}
        >
          <BottomSheetModalProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen
              name="index"
              options={{ contentStyle: { backgroundColor: "black" } }}
            />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
            <Stack.Screen
              name="songs/[id]/index"
              options={{
                ...Transition.presets.DraggableCard(),
              }}
            />
          </Stack>
        </BottomSheetModalProvider>
        </SafeAreaListener>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
