import React, { useEffect, useState } from "react";
import AnimatedLogo from "@/components/AnimatedLogo";
import { View, Text, Image, ActivityIndicator, Alert } from "react-native";
import Circle from "@/components/Circle";
import { TrebleClef, SemiQuavers, Quavers } from "@/components/icons";
import ZStack from "@/components/ZStack";
import { EaseView } from "@/components/styled";
import { useStore } from "@/store/useStore";
import SongsBottomSheet, { SONGS_SHEET_PEEK_HEIGHT } from "@/components/SongsBottomSheet";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { useAuth } from "@/hooks/useAuth";
import { useLikesStore } from "@/store/useLikesStore";

export default function Index() {
  const { subscribeCategories, subscribeSongs } = useStore();
  const subscribeLikes = useLikesStore((state) => state.subscribeLikes);
  const [renderBottomSheet, setRenderBottomSheet] = useState(false);
  const {
    user,
    isAuthenticated,
    isLoading: isAuthLoading,
    isSigningIn,
    signIn,
  } = useAuth();
  const userId = user?.uid;

  useEffect(() => {
    if (isAuthLoading) return;

    const unsubLikes = subscribeLikes((error) => {
      Alert.alert("Likes unavailable", error.message);
    });

    if (!isAuthenticated) {
      setRenderBottomSheet(false);
      return unsubLikes;
    }

    const unsubCategories = subscribeCategories();
    const unsubSongs = subscribeSongs();
    const timer = setTimeout(() => {
      setRenderBottomSheet(true);
    }, 1500);

    return () => {
      unsubCategories();
      unsubSongs();
      unsubLikes();
      clearTimeout(timer);
    };
  }, [
    isAuthenticated,
    isAuthLoading,
    subscribeCategories,
    subscribeLikes,
    subscribeSongs,
    userId,
  ]);

  const handleGoogleSignIn = async () => {
    try {
      await signIn();
    } catch (error: any) {
      Alert.alert("Sign in failed", error?.message ?? "Unable to sign in.");
    }
  };

  return (
    <View className="flex-1">
      <View
        pointerEvents="none"
        className="absolute top-0 left-0 right-0 bottom-0 z-10 w-full flex-1 justify-center items-center"
      >
        <AnimatedLogo />
      </View>

      <EaseView
        initialAnimate={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: "timing", duration: 400, delay: 400 }}
        className="w-full flex-1"
      >
        <View className="flex-1">
          <View className="absolute top-0 items-center flex-row py-20 overflow-hidden">
            <EaseView
              initialAnimate={{ translateY: -20, translateX: 10, scale: 0.9 }}
              animate={{ translateY: 0, translateX: 0, scale: 1 }}
              transition={{ type: "timing", duration: 2000, loop: "reverse" }}
              className="-ml-50 -mt-25"
            >
              <EaseView
                initialAnimate={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "timing", duration: 800, delay: 800 }}
                style={{ filter: "blur(23px)" }}
              >
                <Circle size={500} colors={["#1dc9de 0%", "#0a3b41 100%"]} />
              </EaseView>
            </EaseView>
            <EaseView
              initialAnimate={{ translateY: -20, translateX: -20, scale: 0.8 }}
              animate={{ translateY: 20, translateX: 0, scale: 1 }}
              transition={{
                type: "timing",
                delay: 1400,
                duration: 2000,
                loop: "reverse",
              }}
              className="-ml-25 -mt-20"
            >
              <EaseView
                initialAnimate={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "timing", duration: 800, delay: 600 }}
                style={{ filter: "blur(30px)" }}
              >
                <Circle size={450} colors={["#41a9e3 10%", "#183f54 100%"]} />
              </EaseView>
            </EaseView>
          </View>
          <View
            className="flex-1 mt-20 flex-cols justify-around"
            style={{
              paddingBottom: isAuthenticated ? SONGS_SHEET_PEEK_HEIGHT : 24,
            }}
          >
            <View>
              <ZStack className="absolute bottom-[50%] w-full items-center">
                <AnimatedMusicSymbol position={[-120, -100]}>
                  <SemiQuavers size={30} color="rgba(255, 255, 255, 0.5)" />
                </AnimatedMusicSymbol>
                <AnimatedMusicSymbol position={[-50, -170]}>
                  <Quavers size={60} color="rgba(255, 255, 255, 0.5)" />
                </AnimatedMusicSymbol>
                <AnimatedMusicSymbol position={[40, -170]}>
                  <SemiQuavers size={30} color="rgba(255, 255, 255, 0.5)" />
                </AnimatedMusicSymbol>
                <AnimatedMusicSymbol position={[120, -150]}>
                  <TrebleClef size={20} color="rgba(255, 255, 255, 0.5)" />
                </AnimatedMusicSymbol>
              </ZStack>
              <EaseView
                initialAnimate={{ translateY: 0, opacity: 0, scale: 0.5 }}
                animate={{ translateY: 50, opacity: 1, scale: 1 }}
                transition={{ type: "timing", duration: 800, delay: 800 }}
              >
                <Image
                  source={require("../assets/images/keyboard.png")}
                  className="w-87.5 mx-auto"
                  resizeMode="contain"
                />
              </EaseView>
            </View>
            <View className="px-10 -mt-20">
              <EaseView
                initialAnimate={{ opacity: 0, translateX: 20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: "timing", duration: 500, delay: 1000 }}
              >
                <Text className="text-white/70 text-xl font-bold tracking-wider mb-4">
                  Perform Your
                </Text>
              </EaseView>
              <EaseView
                initialAnimate={{ opacity: 0, translateX: 20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: "timing", duration: 500, delay: 1200 }}
              >
                <Text className="text-white text-6xl font-bold tracking-wider">
                  Favourite Music
                </Text>
              </EaseView>

              {!isAuthLoading && !isAuthenticated && (
                <View className="mt-12">
                  <EaseView
                    initialAnimate={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "timing", duration: 500, delay: 1200 }}
                  >
                    <GoogleSignInButton
                      isLoading={isSigningIn}
                      onPress={handleGoogleSignIn}
                    />
                  </EaseView>
                </View>
              )}
            </View>
          </View>
        </View>
      </EaseView>
      {isAuthenticated && renderBottomSheet && <SongsBottomSheet />}
    </View>
  );
}

const AnimatedMusicSymbol = ({
  position = [0, 0],
  children,
}: {
  position: number[];
  children: React.ReactNode;
}) => {
  const [delay] = useState(() => parseInt(Math.random() * 800 + ""));
  return (
    <EaseView
      initialAnimate={{ translateX: 0, translateY: 0, opacity: 0 }}
      animate={{ translateX: position[0], translateY: position[1], opacity: 1 }}
      transition={{ type: "timing", duration: 800, delay: 800 }}
    >
      <EaseView
        initialAnimate={{ rotate: -10 }}
        animate={{ rotate: 10 }}
        transition={{
          type: "timing",
          duration: 1000,
          loop: "reverse",
          delay,
        }}
      >
        {children}
      </EaseView>
    </EaseView>
  );
};
