import React, { useState } from "react";
import { View, Text, TouchableOpacity, SectionList } from "react-native";
import { router } from "expo-router";
import { Icon } from "@/components/Icon";
import Search from "@expo/material-symbols/search.xml";
import Close from "@expo/material-symbols/close.xml";
import { Song, useStore } from "@/store/useStore";
import { useLikesStore } from "@/store/useLikesStore";
import { LIKES_FILTER_ID } from "@/components/CategoryFilters";
import {
  BottomSheetTextInput,
  useBottomSheetScrollableCreator,
} from "@gorhom/bottom-sheet";
import { Pressable } from "react-native-gesture-handler";
import CategoryFilters from "./CategoryFilters";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SongsList() {
  const insets = useSafeAreaInsets();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { songs: data } = useStore();
  const likedIds = useLikesStore((s) => s.likedIds);

  const sections = (() => {
    if (!data) return { letters: [], data: [] };

    let songs = data;

    // Filter by likes first (independent of search)
    if (selectedCategory === LIKES_FILTER_ID) {
      songs = songs.filter((song) => likedIds.includes(song.id));
    } else if (selectedCategory) {
      songs = songs.filter((song) => song.category === selectedCategory);
    }

    // Then filter by search keyword
    if (searchKeyword) {
      songs = songs.filter((song) =>
        song.title.toLowerCase().includes(searchKeyword.toLowerCase()),
      );
    }

    // Group by first letter
    const result = songs.reduce(
      (acc, curr) => {
        const key = curr.title[0].toUpperCase();
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(curr);
        return acc;
      },
      {} as Record<string, typeof songs>,
    );

    // Format array for SectionList
    const letters = Object.keys(result).sort();

    return {
      letters,
      data:
        letters.map((letter) => ({
          title: letter,
          data: result[letter],
        })) ?? [],
    };
  })();

  const BottomSheetSectionList = useBottomSheetScrollableCreator();

  return (
    <>
      <View>
        <View className="px-8 py-2">
          <View className="bg-gray-800 rounded-full px-4 py-1 flex-row items-center">
            <Icon source={Search} size={24} tint="#FFFFFF" />
            <BottomSheetTextInput
              testID="search-input"
              placeholder="Search songs..."
              value={searchKeyword}
              onChangeText={setSearchKeyword}
              className="text-white text-lg font-medium bg-transparent flex-1 ml-2"
              placeholderTextColor="gray"
            />

            {searchKeyword.length > 0 && (
              <TouchableOpacity onPress={() => setSearchKeyword("")}>
                <Icon source={Close} size={24} tint="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <CategoryFilters
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </View>

      <SectionList
        sections={sections.data}
        keyExtractor={(item: Song) => item.id}
        stickySectionHeadersEnabled
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        renderScrollComponent={BottomSheetSectionList}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 16,
        }}
      />
    </>
  );
}

const renderSectionHeader = ({ section }: any) => {
  return (
    <View className="px-9 py-2 bg-[#121821]">
      <Text className="text-white text-lg font-semibold">{section.title}</Text>
    </View>
  );
};

const renderItem = ({ item }: any) => {
  return (
    <Pressable onPress={() => router.push(`/songs/${item.id}`)}>
      <View className="px-9 py-4 w-full">
        <Text
          numberOfLines={1}
          className="text-white text-lg font-medium capitalize"
        >
          {item.title}
        </Text>
      </View>
    </Pressable>
  );
};
