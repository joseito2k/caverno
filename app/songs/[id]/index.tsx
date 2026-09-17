import React from "react";
import { View, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/Icon";
import { IconButton } from "@/components/IconButton";
import SongMenu from "@/components/SongMenu";
import ArrowBack from "@expo/material-symbols/arrow_back.xml";
import Favorite from "@expo/material-symbols/favorite.xml";
import { BlurView } from "@/components/styled";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackgroundProps,
} from "@gorhom/bottom-sheet";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import MusicNote from "@expo/material-symbols/music_note.xml";
import SwapVert from "@expo/material-symbols/swap_vert.xml";
import { useSong } from "@/hooks/useSong";
import { useKeepAwake } from "expo-keep-awake";
import { useLikesStore } from "@/store/useLikesStore";

const CARD_SIZE = 300;
const SNAP_POINTS = [150, 300, "100%"];

export default function Song() {
  useKeepAwake();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const song = useSong(id);

  const bottomsheetAnimatedIndex = useSharedValue(0);
  const blurIntensity = useSharedValue(0);

  const rCardStyles = useAnimatedStyle(() => {
    if (bottomsheetAnimatedIndex.value >= 2) {
      blurIntensity.value = withTiming(100);
    } else {
      blurIntensity.value = withTiming(0);
    }

    return {
      transform: [
        {
          scale: interpolate(
            bottomsheetAnimatedIndex.value,
            [0, 1, 2],
            [1, 0.9, 1.5],
            Extrapolation.CLAMP
          ),
        },
        {
          translateY: interpolate(
            bottomsheetAnimatedIndex.value,
            [0, 1, 2],
            [0, -CARD_SIZE / 3, -CARD_SIZE * 0.75],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  const rHeaderBgOpacity = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        bottomsheetAnimatedIndex.value,
        [0, 1, 2],
        [0, 0, 0.7],
        Extrapolation.CLAMP
      ),
    };
  });

  return (
    <View className="flex-1 bg-black">
      <Animated.View
        style={[{ paddingTop: insets.top + 16 }]}
        className="flex-row justify-between items-center px-8 py-4 z-[4]"
      >
        <Animated.View style={rHeaderBgOpacity} className="absolute inset-0 bg-black">
          <BlurView
            intensity={30}
            tint="dark"
            experimentalBlurMethod="dimezisBlurView"
            className="flex-1"
          />
        </Animated.View>
        <IconButton
          onPress={router.back}
          source={ArrowBack}
          size={22}
          tint="#FFFFFF"
        />

        <View className="flex-1" />

        <LikeButton songId={id} />
        <SongMenu id={id} />
      </Animated.View>

      <View className="flex-1 items-center justify-center">
        <Animated.Image
          source={{ uri: song?.cover_image! }}
          width={CARD_SIZE}
          height={CARD_SIZE}
          resizeMode="cover"
          className="rounded-[20px]"
          style={[
            rCardStyles,
            {
              width: CARD_SIZE,
              height: CARD_SIZE,
              aspectRatio: 1,
              marginBottom: 150,
            },
          ]}
        />
        <BottomSheet
          snapPoints={SNAP_POINTS}
          backgroundComponent={CustomBackground}
          animatedIndex={bottomsheetAnimatedIndex}
          handleComponent={CustomHandle}
        >
          <View className="p-6 pb-0">
            <View
              className="flex-row items-center justify-between mb-4"
              style={{
                display:
                  song?.style || song?.tempo || song?.transpose
                    ? "flex"
                    : "none",
              }}
            >
              <View className="flex-row items-center gap-2">
                {song?.style && (
                  <View className="bg-gray-700/95 px-3 py-1 rounded-full">
                    <Text className="text-white text-sm font-medium">
                      {song.style}
                    </Text>
                  </View>
                )}
              </View>

              <View className="flex-row items-center gap-3">
                <View
                  className="flex-row items-center bg-gray-700/95 px-3 py-1 rounded-full"
                  style={{
                    display: song?.tempo && song?.tempo > 0 ? "flex" : "none",
                  }}
                >
                  <Icon source={MusicNote} size={18} tint="#FFFFFF" />
                  <Text className="text-white text-sm font-medium ml-1">
                    {song?.tempo}
                  </Text>
                </View>
                <View
                  className="flex-row items-center bg-gray-700/95 px-3 py-1 rounded-full"
                  style={{ display: song?.transpose ? "flex" : "none" }}
                >
                  <Icon source={SwapVert} size={18} tint="#FFFFFF" />
                  <Text className="text-white text-sm font-medium ml-1">
                    {song?.transpose}
                  </Text>
                </View>
              </View>
            </View>

            <Text className="text-white text-3xl font-bold capitalize mb-6">
              {song?.title}
            </Text>
          </View>

          <BottomSheetScrollView>
            <View className="p-6">
              <View className="flex-row items-center gap-2 mb-4">
                <Icon source={MusicNote} size={24} tint="#FFFFFF" />
                <Text className="text-white text-xl font-bold">Lyrics</Text>
              </View>
              <View className="bg-gray-700/95 rounded-xl p-4">
                <Text className="text-white text-base leading-relaxed">
                  {song?.lyrics}
                </Text>
              </View>
            </View>
          </BottomSheetScrollView>
        </BottomSheet>

      </View>
    </View>
  );
}

const CustomBackground = ({
  animatedIndex,
  style,
}: BottomSheetBackgroundProps) => {
  const rStyles = useAnimatedStyle(() => {
    return animatedIndex.value >= SNAP_POINTS.length - 1
      ? {
          borderTopRightRadius: withTiming(0),
          borderTopLeftRadius: withTiming(0),
        }
      : {
          borderTopRightRadius: withTiming(15),
          borderTopLeftRadius: withTiming(15),
        };
  }, []);

  return (
    <Animated.View style={[style, { backgroundColor: "#1f2937" }, rStyles]} />
  );
};

const CustomHandle = () => (
  <View
    testID="bottom-sheet-handle"
    style={{ alignItems: "center", paddingVertical: 8 }}
  >
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

function LikeButton({ songId }: { songId: string }) {
  const isLiked = useLikesStore((s) => s.likedIds.includes(songId));
  const toggle = useLikesStore((s) => s.toggle);

  return (
    <IconButton
      onPress={() => toggle(songId)}
      source={Favorite}
      size={22}
      tint={isLiked ? "#EF4444" : "#FFFFFF"}
    />
  );
}
