import { useEffect, useState } from "react";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import {
  listenToAuthChanges,
  signInWithGoogle,
  signOutOfGoogle,
} from "@/utils/auth";

export function useAuth() {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    return listenToAuthChanges((nextUser) => {
      setUser(nextUser);
      setIsLoading(false);
    });
  }, []);

  const signIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } finally {
      setIsSigningIn(false);
    }
  };

  const signOut = async () => {
    await signOutOfGoogle();
  };

  return {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    isSigningIn,
    signIn,
    signOut,
  };
}