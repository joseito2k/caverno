import { create } from "zustand";
import auth from "@react-native-firebase/auth";
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "@react-native-firebase/firestore";

const getCurrentUserId = () => auth().currentUser?.uid ?? null;

export interface Song {
  id: string;
  userId?: string | null;
  category: string | null;
  cover_image: string | null;
  created_at: string;
  updatedAt?: string | null;
  lyrics: string | null;
  style: string | null;
  tempo: number | null;
  title: string;
  transpose: number | null;
}

export type CreateSongData = Omit<Song, "id" | "created_at" | "userId"> & {
  userId?: string | null;
};

interface Category {
  id: string;
  userId?: string | null;
  name?: string;
  updatedAt?: string | null;
}

interface Store {
  songs: Song[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  subscribeSongs: () => () => void;
  subscribeCategories: () => () => void;
  addSong: (data: CreateSongData) => Promise<void>;
  addCategory: (name: string) => Promise<string | null>;
  updateSong: (id: string, data: Partial<Song>) => Promise<void>;
  deleteSong: (id: string) => Promise<void>;
}

export const useStore = create<Store>((set) => ({
  songs: [],
  categories: [],
  isLoading: true,
  error: null,

  subscribeSongs: () => {
    const firestore = getFirestore();
    const uid = getCurrentUserId();

    if (!uid) {
      set({ songs: [], error: null, isLoading: false });
      return () => {};
    }

    const q = query(collection(firestore, "users", uid, "songs"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const songs: Song[] = snapshot.docs.map((doc: any) => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data.userId ?? uid,
            title: data.title ?? "",
            category: data.category ?? null,
            cover_image: data.cover_image ?? null,
            created_at: data.created_at ?? "",
            updatedAt: data.updatedAt ?? null,
            lyrics: data.lyrics ?? null,
            style: data.style ?? null,
            tempo: data.tempo ?? null,
            transpose: data.transpose ?? null,
          };
        });
        songs.sort((a, b) => a.title.localeCompare(b.title));
        set({ songs, error: null, isLoading: false });
      },
      (err) => {
        set({ error: err.message, isLoading: false });
      }
    );
    return unsubscribe;
  },

  subscribeCategories: () => {
    const firestore = getFirestore();
    const uid = getCurrentUserId();

    if (!uid) {
      set({ categories: [], error: null, isLoading: false });
      return () => {};
    }

    const q = query(collection(firestore, "users", uid, "categories"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const categories: Category[] = snapshot.docs.map((doc: any) => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data.userId ?? uid,
            name: data.name,
            updatedAt: data.updatedAt ?? null,
          };
        });
        categories.sort((a, b) =>
          (a.name ?? "").localeCompare(b.name ?? "")
        );
        set({ categories, error: null, isLoading: false });
      },
      (err) => {
        set({ error: err.message, isLoading: false });
      }
    );
    return unsubscribe;
  },

  addSong: async (data) => {
    const firestore = getFirestore();
    const uid = getCurrentUserId();

    if (!uid) {
      throw new Error("You must be signed in before adding a song.");
    }

    await addDoc(collection(firestore, "users", uid, "songs"), {
      ...data,
      userId: uid,
      created_at: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },

  addCategory: async (name) => {
    const trimmedName = name.trim();
    const firestore = getFirestore();
    const uid = getCurrentUserId();

    if (!uid) {
      throw new Error("You must be signed in before adding a category.");
    }

    if (!trimmedName) {
      return null;
    }

    const newCategory = await addDoc(collection(firestore, "users", uid, "categories"), {
      name: trimmedName,
      userId: uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return newCategory.id;
  },

  updateSong: async (id, data) => {
    const firestore = getFirestore();
    const uid = getCurrentUserId();

    if (!uid) {
      throw new Error("You must be signed in before updating a song.");
    }

    await updateDoc(doc(firestore, "users", uid, "songs", id), {
      ...data,
      userId: uid,
      updatedAt: new Date().toISOString(),
    });
  },

  deleteSong: async (id) => {
    const firestore = getFirestore();
    const uid = getCurrentUserId();

    if (!uid) {
      throw new Error("You must be signed in before deleting a song.");
    }

    await deleteDoc(doc(firestore, "users", uid, "songs", id));
  },
}));
