import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { getFriendBalances } from '@/src/services/friends.service';
import { getBudgetStatus } from '@/src/services/budget.service';
import { getPendingSettlements } from '@/src/services/settlements.service';

type NudgeType = 'over-budget' | 'overdue' | 'budget-warning' | 'pending';

interface NudgePayload {
  type: NudgeType;
  text: string;
  destination: '/budget' | '/settlements';
}

const COLORS = {
  coral: '#FF5F7E',
  amber: '#FFB547',
  violet: '#7C5CFC',
  violetLight: '#9B7FFF',
};

const getBannerStyle = (type: NudgeType) => {
  switch (type) {
    case 'over-budget':
      return {
        backgroundColor: 'rgba(255,95,126,0.12)',
        borderLeftColor: COLORS.coral,
        textColor: COLORS.coral,
      };
    case 'overdue':
      return {
        backgroundColor: 'rgba(255,181,71,0.1)',
        borderLeftColor: COLORS.amber,
        textColor: COLORS.amber,
      };
    case 'budget-warning':
      return {
        backgroundColor: 'rgba(255,181,71,0.08)',
        borderLeftColor: COLORS.amber,
        textColor: COLORS.amber,
      };
    default:
      return {
        backgroundColor: 'rgba(124,92,252,0.1)',
        borderLeftColor: COLORS.violet,
        textColor: COLORS.violetLight,
      };
  }
};

export function NudgeBanner() {
  const router = useRouter();
  const [nudge, setNudge] = useState<NudgePayload | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-10)).current;

  const resolveNudge = useCallback(async () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const results = await Promise.allSettled([
      getFriendBalances(),
      getBudgetStatus(month, year),
      getPendingSettlements(),
    ]);

    const friends = results[0].status === 'fulfilled' && Array.isArray(results[0].value) ? results[0].value : [];
    const budgets = results[1].status === 'fulfilled' && Array.isArray(results[1].value) ? results[1].value : [];
    const pending =
      results[2].status === 'fulfilled' && results[2].value
        ? results[2].value
        : ({ summary: { pendingCount: 0, overdueCount: 0 }, settlements: [] } as any);

    const overBudget = budgets
      .filter((item: any) => Number(item?.percentage || 0) >= 100)
      .sort((a: any, b: any) => Number(b.percentage || 0) - Number(a.percentage || 0))[0];

    if (overBudget) {
      return {
        type: 'over-budget' as const,
        text: `🚨 You're over budget on ${String(overBudget.category || 'a category')}`,
        destination: '/budget' as const,
      };
    }

    const friendOverdueCount = friends.reduce((acc: number, item: any) => acc + Number(item?.overdueCount || 0), 0);
    const overdueCount = Number(pending?.summary?.overdueCount || friendOverdueCount || 0);

    if (overdueCount > 0) {
      const overdueSettlements = Array.isArray(pending?.settlements)
        ? pending.settlements.filter((item: any) => String(item?.status || '').toLowerCase() === 'overdue')
        : [];
      const oldestDays = overdueSettlements.reduce((acc: number, item: any) => Math.max(acc, Number(item?.daysPending || 0)), 0);

      return {
        type: 'overdue' as const,
        text: `⚠️ ${overdueCount} settlement(s) overdue - oldest ${oldestDays} days`,
        destination: '/settlements' as const,
      };
    }

    const budgetWarning = budgets
      .filter((item: any) => Number(item?.percentage || 0) >= 80 && Number(item?.percentage || 0) < 100)
      .sort((a: any, b: any) => Number(b.percentage || 0) - Number(a.percentage || 0))[0];

    if (budgetWarning) {
      const remaining = Number(budgetWarning.remaining || 0);
      return {
        type: 'budget-warning' as const,
        text: `⚡ ${String(budgetWarning.category || 'Category')} budget at ${Math.round(Number(budgetWarning.percentage || 0))}% - ₹${Math.max(0, remaining).toLocaleString('en-IN')} remaining`,
        destination: '/budget' as const,
      };
    }

    const pendingCount = Number(pending?.summary?.pendingCount || 0);
    if (pendingCount > 3) {
      return {
        type: 'pending' as const,
        text: `💰 You have ${pendingCount} pending settlements`,
        destination: '/settlements' as const,
      };
    }

    return null;
  }, []);

  const loadNudge = useCallback(async () => {
    try {
      const nextNudge = await resolveNudge();
      setNudge(nextNudge);

      if (nextNudge) {
        fadeAnim.setValue(0);
        slideAnim.setValue(-10);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();
      }
    } catch (error) {
      console.log('Nudge banner fetch failed:', error);
      setNudge(null);
    }
  }, [fadeAnim, resolveNudge, slideAnim]);

  useEffect(() => {
    loadNudge();
  }, [loadNudge]);

  useFocusEffect(
    useCallback(() => {
      loadNudge();
    }, [loadNudge])
  );

  const bannerStyle = useMemo(() => (nudge ? getBannerStyle(nudge.type) : null), [nudge]);

  if (!nudge || !bannerStyle) {
    return null;
  }

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: bannerStyle.backgroundColor,
            borderLeftColor: bannerStyle.borderLeftColor,
          },
        ]}
        activeOpacity={0.85}
        onPress={() => router.push(nudge.destination as any)}
      >
        <Text style={[styles.text, { color: bannerStyle.textColor }]}>{nudge.text}</Text>
        <Ionicons name="chevron-forward" size={18} color={bannerStyle.textColor} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default NudgeBanner;

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderLeftWidth: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  text: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'DMSans_600SemiBold',
  },
});
