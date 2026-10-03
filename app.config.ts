import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Caverno",
  slug: "caverno",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "caverno",
  userInterfaceStyle: "dark",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.jtf.caverno",
  },
  android: {
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      monochromeImage: "./assets/images/adaptive-monochrome-icon.png",
      backgroundColor: "#000000",
    },
    package: "com.jtf.caverno",
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-font",
    "expo-image",
    "@react-native-firebase/app",
    "@react-native-firebase/auth",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/adaptive-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#000000",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: "379b7914-541a-4c26-b413-8e6803f2a29f",
    },
  },
  owner: "joseito.terence",
});
