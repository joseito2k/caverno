import { useRef, useState } from "react";
import { BackHandler, TouchableOpacity, View } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SongsList from "./SongsList";
import { useFocusEffect, router } from "expo-router";
import { Icon } from "@/components/Icon";
import Add from "@expo/material-symbols/add.xml";

export const SONGS_SHEET_PEEK_HEIGHT = 240;
const SNAP_POINTS = [SONGS_SHEET_PEEK_HEIGHT, 600, "88%"];

export default function SongsBottomSheet() {
  const insets = useSafeAreaInsets();
  const ref = useRef<BottomSheet>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useFocusEffect(() => {
    const backAction = () => {
      if (ref.current && currentIndex !== 0) {
        ref.current.snapToIndex(0);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => backHandler.remove();
  });

  return (
    <BottomSheet
      ref={ref}
      snapPoints={SNAP_POINTS}
      backgroundStyle={{ backgroundColor: "black" }}
      containerStyle={{ zIndex: 100 }}
      enableDynamicSizing={false}
      topInset={insets.top}
      onChange={setCurrentIndex}
      footerComponent={Footer}
    >
      <SongsList />
    </BottomSheet>
  );
}

function Footer() {
  return (
    <View className="px-6 pb-8 pt-2 items-end h-0">
      <TouchableOpacity
        onPress={() => router.push("/songs/add")}
        className="rounded-full p-3 items-center bg-[#41a9e3]/60 justify-center gap-2 -translate-y-16 h-16 w-16"
        activeOpacity={0.8}
        style={{}}
      >
        <Icon source={Add} size={30} tint="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
