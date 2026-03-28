import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold } from '@expo-google-fonts/dm-sans';
import { Syne_400Regular, Syne_600SemiBold, Syne_700Bold, Syne_800ExtraBold } from '@expo-google-fonts/syne';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import Toast from 'react-native-toast-message';

import { AuthProvider } from '@/src/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
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
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="group" options={{ headerShown: false }} />
            <Stack.Screen name="settlements" options={{ headerShown: false }} />
            <Stack.Screen name="notifications" options={{ headerShown: false }} />
            <Stack.Screen name="friends/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="friends/settle" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ headerShown: false }} />
            <Stack.Screen name="budget" options={{ headerShown: false }} />
            <Stack.Screen name="analytics" options={{ headerShown: false }} />
            <Stack.Screen name="analytics/[category]" options={{ headerShown: false }} />
            <Stack.Screen name="personal" options={{ headerShown: false }} />
            <Stack.Screen name="redirect" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
          <Toast config={toastConfig} />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
