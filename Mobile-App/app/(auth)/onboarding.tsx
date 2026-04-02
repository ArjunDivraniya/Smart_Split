import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useRef, useState } from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { STORAGE_KEYS } from '@/src/constants/categories';

const { width } = Dimensions.get('window');

const COLORS = {
  void: '#080810',
  surface: '#0F0F1A',
  elevated: '#1A1A2B',
  violet: '#7C5CFC',
  violetLight: '#9B7FFF',
  violetDeep: '#B06EFF',
  violetDim: 'rgba(124, 92, 252, 0.2)',
  mint: '#00E5B0',
  textPrimary: '#F0F0FF',
  textSecondary: '#8888AA',
  textMuted: '#55556A',
};

const SLIDES = [
  {
    emoji: '✈️',
    title: 'Split Trip Expenses',
    description: 'Add group expenses in seconds.\nEveryone sees what they owe.',
    accent: COLORS.violet,
    illustration: 'trip',
  },
  {
    emoji: '📊',
    title: 'Track Personal Spending',
    description: 'Log daily expenses and set\nbudgets for each category.',
    accent: COLORS.mint,
    illustration: 'personal',
  },
  {
    emoji: '💰',
    title: 'Settle Up Instantly',
    description: 'Pay friends via UPI or\nRazorpay — right from the app.',
    accent: COLORS.violetLight,
    illustration: 'settle',
  },
] as const;

type SlideItem = (typeof SLIDES)[number];

const TripIllustration = () => (
  <Svg width={220} height={220} viewBox="0 0 220 220" fill="none">
    <Circle cx="110" cy="110" r="96" fill="rgba(124, 92, 252, 0.12)" />
    <Rect x="44" y="126" width="132" height="44" rx="14" fill="#14142A" stroke="rgba(255,255,255,0.12)" />
    <Rect x="58" y="138" width="24" height="20" rx="6" fill="#7C5CFC" />
    <Rect x="89" y="138" width="24" height="20" rx="6" fill="#9B7FFF" />
    <Rect x="120" y="138" width="24" height="20" rx="6" fill="#00E5B0" />
    <Path d="M92 94 L154 74 L96 102" stroke="#00E5B0" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M77 102 L154 74 L86 88" stroke="#7C5CFC" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="154" cy="74" r="8" fill="#FFB547" />
  </Svg>
);

const PersonalIllustration = () => (
  <Svg width={220} height={220} viewBox="0 0 220 220" fill="none">
    <Circle cx="110" cy="110" r="96" fill="rgba(0, 229, 176, 0.13)" />
    <Rect x="52" y="48" width="116" height="124" rx="14" fill="#14142A" stroke="rgba(255,255,255,0.12)" />
    <Line x1="72" y1="84" x2="148" y2="84" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
    <Line x1="72" y1="103" x2="148" y2="103" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
    <Line x1="72" y1="122" x2="122" y2="122" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
    <Rect x="72" y="137" width="76" height="12" rx="6" fill="#00E5B0" opacity="0.9" />
    <Rect x="74" y="58" width="44" height="12" rx="6" fill="#7C5CFC" />
    <Circle cx="166" cy="58" r="18" fill="#7C5CFC" />
    <Path d="M166 49V58L173 62" stroke="#F0F0FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SettleIllustration = () => (
  <Svg width={220} height={220} viewBox="0 0 220 220" fill="none">
    <Circle cx="110" cy="110" r="96" fill="rgba(176, 110, 255, 0.14)" />
    <Rect x="38" y="78" width="72" height="56" rx="12" fill="#14142A" stroke="rgba(255,255,255,0.12)" />
    <Rect x="112" y="88" width="70" height="56" rx="12" fill="#14142A" stroke="rgba(255,255,255,0.12)" />
    <Path d="M92 146 C102 162, 118 162, 128 146" stroke="#00E5B0" strokeWidth="5" strokeLinecap="round" />
    <Path d="M128 72 C118 56, 102 56, 92 72" stroke="#7C5CFC" strokeWidth="5" strokeLinecap="round" />
    <Rect x="52" y="96" width="46" height="9" rx="4.5" fill="#7C5CFC" />
    <Rect x="126" y="106" width="42" height="9" rx="4.5" fill="#00E5B0" />
    <Circle cx="152" cy="66" r="15" fill="#FFB547" />
    <Path d="M146 66h12M152 60v12" stroke="#080810" strokeWidth="2.3" strokeLinecap="round" />
  </Svg>
);

const OnboardingIllustration = ({ type }: { type: SlideItem['illustration'] }) => {
  if (type === 'trip') {
    return <TripIllustration />;
  }

  if (type === 'personal') {
    return <PersonalIllustration />;
  }

  return <SettleIllustration />;
};

export default function OnboardingScreen() {
  const router = useRouter();
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  const handleComplete = async () => {
    try {
      console.log('🏁 Completing onboarding...');
      
      // 1. Set completion flag
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
      console.log('✅ Onboarding flag saved to storage');

      // 2. Small delay to ensure storage write and UI stability
      console.log('⏳ Waiting 100ms before transition...');
      await new Promise(resolve => setTimeout(resolve, 100));

      // 3. Attempt navigation
      console.log('➡️ Navigating to Login screen: /login');
      router.replace('/login');
      
    } catch (error: any) {
      console.error('❌ Onboarding completion failed:', error);
      
      // Standalone build debugging
      const { Alert } = require('react-native');
      Alert.alert(
        'Navigation Error',
        `Failed to reach login: ${error?.message || 'Unknown error'}. Please check if (auth)/login route exists.`
      );
    }
  };

  const handleNext = () => {
    if (index === SLIDES.length - 1) {
      handleComplete();
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  const handleSkip = () => {
    handleComplete();
  };

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setIndex(nextIndex);
  };

  const renderItem = useMemo(
    () =>
      ({ item }: { item: SlideItem }) => (
        <View style={styles.slide}>
          <View style={[styles.illustration, { borderColor: item.accent }]}>
            <OnboardingIllustration type={item.illustration} />
            <View style={[styles.floatChip, styles.floatOne]}>
              <Text style={styles.floatText}>{item.emoji}</Text>
            </View>
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      ),
    []
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.brand}>SmartSplit</Text>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => renderItem({ item })}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, dotIndex) => (
            <View
              key={`dot-${dotIndex}`}
              style={[styles.dot, dotIndex === index && styles.dotActive]}
            />
          ))}
        </View>
        <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.9}>
          <LinearGradient colors={[COLORS.violet, COLORS.violetDeep]} style={styles.buttonFill}>
            <Text style={styles.buttonText}>{index === SLIDES.length - 1 ? 'Get Started' : 'Next'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.void,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'Syne_800ExtraBold',
    color: COLORS.textPrimary,
  },
  skip: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_500Medium',
  },
  slide: {
    width,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  illustration: {
    alignSelf: 'center',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 2,
    backgroundColor: COLORS.violetDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  floatChip: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatOne: {
    top: 8,
    right: 14,
  },
  floatText: {
    fontSize: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    fontFamily: 'Syne_800ExtraBold',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 24,
    fontFamily: 'DMSans_400Regular',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 18,
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
  button: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  buttonFill: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
  },
});
