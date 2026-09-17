import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createMMKV } from "react-native-mmkv";

const mmkv = createMMKV();

const storage = createJSONStorage(() => ({
  getItem: (name) => mmkv.getString(name) ?? null,
  setItem: (name, value) => mmkv.set(name, value),
  removeItem: (name) => mmkv.remove(name),
}));

interface LikesStore {
  likedIds: string[];
  toggle: (songId: string) => void;
  isLiked: (songId: string) => boolean;
  hasLikes: () => boolean;
}

export const useLikesStore = create<LikesStore>()(
  persist(
    (set, get) => ({
      likedIds: [],
      toggle: (songId) =>
        set((state) => ({
          likedIds: state.likedIds.includes(songId)
            ? state.likedIds.filter((id) => id !== songId)
            : [...state.likedIds, songId],
        })),
      isLiked: (songId) => get().likedIds.includes(songId),
      hasLikes: () => get().likedIds.length > 0,
    }),
    {
      name: "caverno-likes",
      storage,
    }
  )
);
