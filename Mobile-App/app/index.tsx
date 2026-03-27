import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { STORAGE_KEYS } from '@/src/constants/categories';
import { getRefreshToken } from '@/src/services/api';

const COLORS = {
  void: '#080810',
  surface: '#0F0F1A',
  violet: '#7C5CFC',
  violetLight: '#9B7FFF',
  violetDeep: '#B06EFF',
  violetDim: 'rgba(124, 92, 252, 0.2)',
  textPrimary: '#F0F0FF',
  textMuted: '#55556A',
};

export default function SplashScreen() {
  const router = useRouter();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
      ])
    );

    pulseAnim.start();

    let cancelled = false;
    const start = Date.now();

    const bootstrap = async () => {
      let hasToken = false;
      let hasOnboarded = false;
      try {
        const [token, refreshToken, onboardingComplete] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
          getRefreshToken(),
          AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE),
        ]);
        hasToken = !!token || !!refreshToken;
        hasOnboarded = onboardingComplete === 'true';
      } catch {
        hasToken = false;
        hasOnboarded = false;
      }

      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 2000 - elapsed);

      setTimeout(() => {
        if (cancelled) {
          return;
        }
        if (hasToken) {
          router.replace('/(tabs)');
          return;
        }
        router.replace(hasOnboarded ? '/(auth)/login' : '/(auth)/onboarding');
      }, remaining);
    };

    bootstrap();

    return () => {
      cancelled = true;
      pulseAnim.stop();
    };
  }, [pulse, router]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Animated.View style={[styles.glow, { transform: [{ scale: pulse }] }]} />
      <LinearGradient colors={[COLORS.violet, COLORS.violetDeep]} style={styles.logoWrap}>
        <Text style={styles.logoText}>SS</Text>
      </LinearGradient>
      <Text style={styles.title}>SmartSplit</Text>
      <Text style={styles.subtitle}>Split smart. Settle easy.</Text>
      <View style={styles.dots}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.void,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.violetDim,
  },
  logoWrap: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: COLORS.violet,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.violet,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  logoText: {
    color: COLORS.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    fontFamily: 'Syne_800ExtraBold',
    letterSpacing: 1,
  },
  title: {
    marginTop: 18,
    fontSize: 26,
    fontWeight: '800',
    fontFamily: 'Syne_800ExtraBold',
    color: COLORS.textPrimary,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textMuted,
  },
  dots: {
    flexDirection: 'row',
    marginTop: 42,
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.violetLight,
    opacity: 0.3,
  },
  dotActive: {
    width: 20,
    borderRadius: 4,
    opacity: 1,
  },
});
