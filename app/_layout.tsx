import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Asset } from "expo-asset";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Text, TextInput } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Fonts } from "@/constants/theme";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";
import { GlobalAudioPlayer } from "@/components/GlobalAudioPlayer";

// Empêcher le splash screen de se cacher automatiquement
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    [Fonts.regular]: require("../assets/fonts/Area-Regular.otf"),
    [Fonts.bold]: require("../assets/fonts/Area-Bold.otf"),
    [Fonts.semiBold]: require("../assets/fonts/Area-SemiBold.otf"),
    [Fonts.thin]: require("../assets/fonts/Area-Thin.otf"),
    [Fonts.normalBlack]: require("../assets/fonts/Area-NormalBlack.otf"),
    [Fonts.extraBold]: require("../assets/fonts/Area-ExtraBold.otf"),
    [Fonts.header]: require("../assets/fonts/ClashDisplay-Semibold.otf"),
  });

  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    Asset.loadAsync([
      require("@/assets/images/LogoDifract.png"),
      require("@/assets/images/onbo1.png"),
      require("@/assets/images/onbo2.png"),
      require("@/assets/images/onbo3.png"),
      require("@/assets/images/onbo4.png"),
      require("@/assets/images/onboChoix1.png"),
      require("@/assets/images/onboChoix2.png"),
      require("@/assets/images/onboar1.png"),
      require("@/assets/images/onboar2.png"),
      require("@/assets/images/onboar3.png"),
      require("@/assets/images/Votes 3.png"),
      require("@/assets/images/scene.png"),
      require("@/assets/images/ImgLogin.png"),
    ]).then(() => setImagesLoaded(true));
  }, []);

  useEffect(() => {
    if (fontsLoaded && imagesLoaded) {
      // Appliquer la police Area globalement à tous les Text et TextInput
      // @ts-ignore - defaultProps existe à runtime
      if (Text.defaultProps == null) Text.defaultProps = {};
      // @ts-ignore
      Text.defaultProps.style = { fontFamily: Fonts.regular };

      // @ts-ignore
      if (TextInput.defaultProps == null) TextInput.defaultProps = {};
      // @ts-ignore
      TextInput.defaultProps.style = { fontFamily: Fonts.regular };

      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, imagesLoaded]);

  if (!fontsLoaded || !imagesLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AudioPlayerProvider>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#111111" },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen
              name="OnBoarding/onboarding"
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="Auth/Index" options={{ gestureEnabled: false }} />
            <Stack.Screen name="Auth/Login" options={{ gestureEnabled: false }} />
            <Stack.Screen name="Auth/register" options={{ gestureEnabled: false }} />
            <Stack.Screen name="Auth/register-public" options={{ gestureEnabled: false }} />
            <Stack.Screen name="Auth/register-artist" options={{ gestureEnabled: false }} />
            <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
          </Stack>
          <GlobalAudioPlayer />
          <StatusBar style="auto" />
        </ThemeProvider>
      </AudioPlayerProvider>
    </GestureHandlerRootView>
  );
}
