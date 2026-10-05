import { create } from "zustand";
import { getAuth } from "@react-native-firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  setDoc,
  type FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";

const getCurrentUserId = () => getAuth().currentUser?.uid ?? null;

interface LikesStore {
  likedIds: string[];
  subscribeLikes: (onError?: (error: Error) => void) => () => void;
  toggle: (songId: string) => Promise<void>;
  isLiked: (songId: string) => boolean;
  hasLikes: () => boolean;
}

export const useLikesStore = create<LikesStore>((set, get) => ({
  likedIds: [],

  subscribeLikes: (onError) => {
    const uid = getCurrentUserId();
    if (!uid) {
      set({ likedIds: [] });
      return () => {};
    }

    set({ likedIds: [] });
    const likesQuery = collection(getFirestore(), "users", uid, "likes");
    return onSnapshot(
      likesQuery,
      (snapshot) => {
        set({
          likedIds: snapshot.docs.map(
            (like: FirebaseFirestoreTypes.QueryDocumentSnapshot) => like.id,
          ),
        });
      },
      (error) => {
        onError?.(error);
      },
    );
  },

  toggle: async (songId) => {
    const uid = getCurrentUserId();
    if (!uid) {
      throw new Error("You must be signed in before changing likes.");
    }

    const wasLiked = get().likedIds.includes(songId);
    const shouldLike = !wasLiked;
    set((state) => ({
      likedIds: shouldLike
        ? [...state.likedIds, songId]
        : state.likedIds.filter((id) => id !== songId),
    }));

    const likeRef = doc(getFirestore(), "users", uid, "likes", songId);
    try {
      if (shouldLike) {
        await setDoc(likeRef, { songId, likedAt: new Date().toISOString() });
      } else {
        await deleteDoc(likeRef);
      }
    } catch (error) {
      set((state) => {
        const isCurrentlyLiked = state.likedIds.includes(songId);
        if (isCurrentlyLiked !== shouldLike) {
          return state;
        }
        return {
          likedIds: wasLiked
            ? [...state.likedIds, songId]
            : state.likedIds.filter((id) => id !== songId),
        };
      });
      throw error;
    }
  },

  isLiked: (songId) => get().likedIds.includes(songId),
  hasLikes: () => get().likedIds.length > 0,
}));
