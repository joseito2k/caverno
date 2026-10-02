import { useRef, useCallback } from "react";
import { View, Text as RNText, ScrollView } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { IconButton } from "@/components/IconButton";
import ArrowBack from "@expo/material-symbols/arrow_back.xml";
import Check from "@expo/material-symbols/check.xml";
import MusicNote from "@expo/material-symbols/music_note.xml";
import LibraryMusic from "@expo/material-symbols/library_music.xml";
import EditNote from "@expo/material-symbols/edit_note.xml";
import { useForm } from "react-hook-form";
import InputController from "@/components/InputController";
import FormCard from "@/components/FormCard";
import CategorySelector from "@/components/CategorySelector";
import { unsplash } from "@/utils/unsplash";
import { useStore } from "@/store/useStore";

const DEFAULT_VALUES = {
  title: "",
  style: "",
  tempo: 0,
  transpose: 0,
  category: "",
  lyrics: "",
};

export type TSong = typeof DEFAULT_VALUES;

type SongFormProps =
  | {
      edit: true;
      song: TSong & { id: string };
    }
  | {
      edit?: false;
    };

export default function SongForm(props: SongFormProps) {
  const isEdit = props.edit === true;
  const insets = useSafeAreaInsets();
  const { addSong, updateSong } = useStore();
  const { height } = useReanimatedKeyboardAnimation();
  const scrollRef = useRef<ScrollView>(null);
  const contentRef = useRef<View>(null);
  const lyricsRef = useRef<View>(null);
  const keyboardPadding = useAnimatedStyle(() => ({
    height: Math.max(-height.value, 0),
  }));
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    getValues,
  } = useForm({
    defaultValues: isEdit ? props.song : DEFAULT_VALUES,
  });

  const scrollToLyrics = useCallback(() => {
    setTimeout(() => {
      if (!contentRef.current || !lyricsRef.current) return;

      lyricsRef.current.measureLayout(
        contentRef.current,
        (_x, y) =>
          scrollRef.current?.scrollTo({
            y: Math.max(y - 24, 0),
            animated: true,
          }),
        () => {},
      );
    }, 250);
  }, []);

  const onSubmit = async () => {
    const data = getValues();
    if (process.env.EXPO_PUBLIC_READ_ONLY === "true") {
      return console.warn("Read-only mode");
    }

    if (isEdit) {
      return updateSong(props.song.id, {
        ...data,
        title: data.title!,
      }).then(() => {
        router.back();
      });
    }

    const result = await unsplash.photos.getRandom({ query: "music" });

    if (result.type === "error") return;

    return addSong({
      title: data.title!,
      style: data.style || null,
      tempo: data.tempo || null,
      transpose: data.transpose || null,
      category: data.category || null,
      lyrics: data.lyrics || null,
      // @ts-ignore
      cover_image: result.response.urls.regular!,
    }).then(() => {
      router.back();
    });
  };

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      <View className="px-6 py-4">
        <View className="flex-row justify-between items-center">
          <IconButton
            onPress={router.back} 
            source={ArrowBack}
            size={22}
            tint="#FFFFFF"
          />

          <View className="items-center">
            <RNText className="text-white text-xl font-bold">
              {isEdit ? "Edit Song" : "Create Song"}
            </RNText>
          </View>

          <IconButton
            onPress={handleSubmit(onSubmit)}
            enabled={!isSubmitting}
            source={Check}
            size={22}
            tint="#FFFFFF"
          />
        </View>
      </View>

      {/* Form Content */}
      <ScrollView
        ref={scrollRef}
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        className="flex-1"
        keyboardShouldPersistTaps="handled"
      >
        <View ref={contentRef} className="px-6 pt-6 pb-8">
          {/* Basic Information Card */}
          <FormCard title="Basic Information" icon={MusicNote}>
            <InputController
              name="title"
              label="Song Title"
              placeholder="Enter the song title"
              control={control}
              disabled={isSubmitting}
              required
              variant="large"
            />

            <InputController
              name="style"
              label="Musical Style"
              placeholder="e.g. Rock, Pop, Hip-Hop, Jazz"
              control={control}
              disabled={isSubmitting}
            />
          </FormCard>

          {/* Musical Details Card */}
          <FormCard title="Musical Details" icon={LibraryMusic}>
            <View className="flex-row gap-4">
              <View className="flex-1">
                <InputController
                  name="tempo"
                  label="Tempo (BPM)"
                  placeholder="120"
                  control={control}
                  disabled={isSubmitting}
                />
              </View>
              <View className="flex-1">
                <InputController
                  name="transpose"
                  label="Transpose"
                  placeholder="-4"
                  control={control}
                  disabled={isSubmitting}
                />
              </View>
            </View>

            <CategorySelector
              name="category"
              label="Category"
              control={control}
              disabled={isSubmitting}
            />
          </FormCard>

          {/* Lyrics Card */}
          <View ref={lyricsRef}>
            <FormCard title="Lyrics" icon={EditNote}>
              <InputController
                name="lyrics"
                label="Song Lyrics"
                placeholder="Enter your lyrics here...&#10;&#10;Verse 1:&#10;...&#10;&#10;Chorus:&#10;..."
                control={control}
                disabled={isSubmitting}
                variant="multiline"
                onFocus={scrollToLyrics}
              />
            </FormCard>
          </View>
        </View>
        <Animated.View style={keyboardPadding} />
      </ScrollView>
    </View>
  );
}
