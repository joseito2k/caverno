import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
  webClientId:
    "448227223773-h9sovfdm0mj2tcq1dhq96sq2j7k8fgfa.apps.googleusercontent.com",
  offlineAccess: false,
});

export const listenToAuthChanges = (
  callback: (user: FirebaseAuthTypes.User | null) => void
) => auth().onUserChanged(callback);

export async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices();
  const response = await GoogleSignin.signIn();

  if (response.type !== "success") {
    throw new Error("Google Sign-In was cancelled.");
  }

  const { idToken } = response.data;

  if (!idToken) {
    throw new Error("Google Sign-In failed: no idToken returned.");
  }

  const googleCredential = auth.GoogleAuthProvider.credential(idToken);
  await auth().signInWithCredential(googleCredential);
}

export async function signOutOfGoogle() {
  await auth().signOut();
  await GoogleSignin.signOut();
}
