import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { Syne_400Regular, Syne_600SemiBold, Syne_700Bold, Syne_800ExtraBold } from '@expo-google-fonts/syne';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import Toast from 'react-native-toast-message';

import { AuthProvider } from '@/src/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { customHeaderOptions } from '@/src/utils/screenOptions';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = 'dark'; // Forced dark mode for premium production look
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    Syne_400Regular,
    Syne_600SemiBold,
    Syne_700Bold,
    Syne_800ExtraBold,
  });

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  const toastConfig: ToastConfig = {
    success: (props) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: '#00E5B0', backgroundColor: '#101A1A', borderRadius: 10 }}
        text1Style={{ color: '#F0F0FF', fontFamily: 'DMSans_600SemiBold', fontSize: 14 }}
        text2Style={{ color: '#A0A0BF', fontFamily: 'DMSans_400Regular', fontSize: 12 }}
      />
    ),
    error: (props) => (
      <ErrorToast
        {...props}
        style={{ borderLeftColor: '#FF5F7E', backgroundColor: '#1C1216', borderRadius: 10 }}
        text1Style={{ color: '#F0F0FF', fontFamily: 'DMSans_600SemiBold', fontSize: 14 }}
        text2Style={{ color: '#A0A0BF', fontFamily: 'DMSans_400Regular', fontSize: 12 }}
      />
    ),
    info: (props) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: '#7C5CFC', backgroundColor: '#14122A', borderRadius: 10 }}
        text1Style={{ color: '#F0F0FF', fontFamily: 'DMSans_600SemiBold', fontSize: 14 }}
        text2Style={{ color: '#A0A0BF', fontFamily: 'DMSans_400Regular', fontSize: 12 }}
      />
    ),
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={DarkTheme}>
          <AuthProvider>
            <Stack screenOptions={customHeaderOptions}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="group" options={{ headerShown: false, presentation: 'transparentModal' }} />
              <Stack.Screen name="settlements" options={{ headerShown: false }} />
              <Stack.Screen name="notifications" options={{ headerShown: false }} />
              <Stack.Screen name="friends" options={{ headerShown: false, presentation: 'transparentModal' }} />
              <Stack.Screen name="profile" options={{ headerShown: false }} />
              <Stack.Screen name="budget" options={{ headerShown: false }} />
              <Stack.Screen name="analytics" options={{ headerShown: false }} />
              <Stack.Screen name="analytics/[category]" options={{ headerShown: false }} />
              <Stack.Screen name="personal" options={{ headerShown: false, presentation: 'transparentModal' }} />
              <Stack.Screen name="redirect" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'fullScreenModal', title: 'Modal', headerShown: true }} />
            </Stack>
            <StatusBar style="light" />
            <Toast config={toastConfig} />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
