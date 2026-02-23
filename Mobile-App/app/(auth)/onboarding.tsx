import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useRef, useState } from 'react';
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
    title: 'Split expenses with friends',
    description: 'Create groups, add expenses, and keep everyone in sync.',
    accent: COLORS.violet,
    icon: '👥',
    floaters: ['💸', '✅', '📊'],
  },
  {
    title: 'Track personal spending',
    description: 'Stay on top of budgets with clear categories and totals.',
    accent: COLORS.mint,
    icon: '📌',
    floaters: ['🎯', '📒', '⚡'],
  },
  {
    title: 'Settle up easily',
    description: 'See balances instantly and close out with one tap.',
    accent: COLORS.violetLight,
    icon: '🤝',
    floaters: ['💳', '✨', '✅'],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  const handleComplete = async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
    router.replace('/(auth)/login');
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
      ({ item, slideIndex }: { item: (typeof SLIDES)[number]; slideIndex: number }) => (
        <View style={styles.slide}>
          <View style={[styles.illustration, { borderColor: item.accent }]}
          >
            <Text style={styles.illusIcon}>{item.icon}</Text>
            <View style={[styles.floatChip, styles.floatOne]}>
              <Text style={styles.floatText}>{item.floaters[0]}</Text>
            </View>
            <View style={[styles.floatChip, styles.floatTwo]}>
              <Text style={styles.floatText}>{item.floaters[1]}</Text>
            </View>
            <View style={[styles.floatChip, styles.floatThree]}>
              <Text style={styles.floatText}>{item.floaters[2]}</Text>
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
        renderItem={({ item, index: slideIndex }) => renderItem({ item, slideIndex })}
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
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    backgroundColor: COLORS.violetDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  illusIcon: {
    fontSize: 54,
  },
  floatChip: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatOne: {
    top: 8,
    right: -8,
  },
  floatTwo: {
    bottom: 10,
    left: -16,
  },
  floatThree: {
    top: 18,
    left: -24,
  },
  floatText: {
    fontSize: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'Syne_800ExtraBold',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
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
