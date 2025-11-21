import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Text, TextInput } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

// Empêcher le splash screen de se cacher automatiquement
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  const [loaded] = useFonts({
    'Area-Regular': require('../assets/fonts/Area/Area-Regular.otf'),
    'Area-Bold': require('../assets/fonts/Area/Area-Bold.otf'),
    'Area-SemiBold': require('../assets/fonts/Area/Area-SemiBold.otf'),
    'Area-Thin': require('../assets/fonts/Area/Area-Thin.otf'),
  });

  useEffect(() => {
    if (loaded) {
      // Appliquer la police Area globalement à tous les Text et TextInput
      // @ts-ignore - defaultProps existe à runtime
      if (Text.defaultProps == null) Text.defaultProps = {};
      // @ts-ignore
      Text.defaultProps.style = { fontFamily: 'Area-Regular' };

      // @ts-ignore
      if (TextInput.defaultProps == null) TextInput.defaultProps = {};
      // @ts-ignore
      TextInput.defaultProps.style = { fontFamily: 'Area-Regular' };

      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack  screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000000' },
        }}>
       <Stack.Screen name="index" />
        <Stack.Screen name="OnBoarding/onboarding" options={{ gestureEnabled: false }} />
        <Stack.Screen name="Auth/Index" />
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
