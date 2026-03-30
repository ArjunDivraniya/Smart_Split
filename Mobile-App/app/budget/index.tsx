import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MonthSelector } from '@/src/components/analytics/MonthSelector';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { hapticImpactLight, hapticNotifyWarning } from '@/src/utils/haptics';

import { COLORS as ThemeColors } from '@/src/constants/theme';
import { getBudgetStatus, copyPreviousBudget, deleteBudget } from '@/src/services/budget.service';
import { getSummary as getPersonalSummary } from '@/src/services/personal.service';
import type { BudgetStatusItem } from '@/src/types/budget.types';

const COLORS = {
  surface: '#0F0F1A',
  card: '#14141F',
  elevated: '#1A1A2B',
  textPrimary: '#F0F0FF',
  textSecondary: '#8888AA',
  textMuted: '#55556A',
  border: 'rgba(255,255,255,0.06)',
  violet: ThemeColors.primary,
  violetLight: '#9B7FFF',
  mint: '#00E5B0',
  amber: '#FFB547',
  coral: '#FF5F7E',
};

const CATEGORY_EMOJI: Record<string, string> = {
  food: '🍔',
  transport: '🚕',
  shopping: '🛍️',
  entertainment: '🎬',
  health: '💊',
  healthcare: '💊',
  utilities: '💡',
  gaming: '🎮',
  other: '🧾',
};

const normalize = (value: string): string => String(value || '').trim().toLowerCase();
const formatMoney = (value: number): string => `₹${Math.abs(Number(value || 0)).toLocaleString('en-IN')}`;

const getBadgeType = (percentage: number): 'safe' | 'warning' | 'over' | 'none' => {
  if (percentage >= 100) return 'over';
  if (percentage >= 80) return 'warning';
  if (percentage < 60) return 'safe';
  return 'none';
};

const getBarAppearance = (percentage: number) => {
  if (percentage >= 100) {
    return {
      gradient: ['#FF5F7E', '#FF5F7E'] as const,
      textColor: COLORS.coral,
      glow: true,
    };
  }

  if (percentage >= 80) {
    return {
      gradient: ['#FF5F7E', '#FF8C42'] as const,
      textColor: COLORS.coral,
      glow: false,
    };
  }

  if (percentage >= 60) {
    return {
      gradient: ['#FFB547', '#FF8C42'] as const,
      textColor: COLORS.amber,
      glow: false,
    };
  }

  return {
    gradient: ['#00E5B0', '#00C4FF'] as const,
    textColor: COLORS.mint,
    glow: false,
  };
};

const getSummaryAppearance = (percentage: number) => {
  if (percentage >= 100) return ['#FF5F7E', '#FF5F7E'] as const;
  if (percentage >= 80) return ['#FF5F7E', '#FF8C42'] as const;
  if (percentage >= 60) return ['#FFB547', '#FF8C42'] as const;
  return ['#00E5B0', '#00C4FF'] as const;
};

function BudgetCard({ item, onEdit, onDelete }: { item: BudgetStatusItem; onEdit: (item: BudgetStatusItem) => void; onDelete: (item: BudgetStatusItem) => void; }) {
  const fillAnim = useRef(new Animated.Value(0)).current;

  const percentage = Number(item.percentage || 0);
  const clampedFill = Math.max(0, Math.min(100, percentage));
  const appearance = getBarAppearance(percentage);
  const badgeType = getBadgeType(percentage);
  const statusText =
    percentage >= 100
      ? `🚨 Over by ${formatMoney(item.spent - item.limit)}`
      : percentage >= 80
      ? '⚡ Almost at limit'
      : `${formatMoney(item.remaining)} remaining`;

  useEffect(() => {
    fillAnim.setValue(0);
    Animated.timing(fillAnim, {
      toValue: clampedFill,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [clampedFill, fillAnim]);

  const widthInterpolate = fillAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const emoji = CATEGORY_EMOJI[normalize(item.category)] || '🧾';

  return (
    <View style={styles.budgetCard}>
      <View style={styles.cardTopRow}>
        <Text style={styles.categoryTitle}>{emoji} {item.category}</Text>

        <View style={styles.cardTopRight}>
          <View style={{flexDirection: 'row', gap: 14, alignItems: 'center', marginBottom: 6}}>
            <TouchableOpacity onPress={() => onEdit(item)} hitSlop={10} activeOpacity={0.7}>
              <Ionicons name="pencil-outline" size={15} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(item)} hitSlop={10} activeOpacity={0.7}>
              <Ionicons name="trash-outline" size={15} color={COLORS.coral} />
            </TouchableOpacity>
          </View>
          {badgeType !== 'none' ? (
            <View
              style={[
                styles.badge,
                badgeType === 'safe' && styles.badgeSafe,
                badgeType === 'warning' && styles.badgeWarning,
                badgeType === 'over' && styles.badgeOver,
              ]}
            >
              <Text style={styles.badgeText}>
                {badgeType === 'safe' ? '✓ Safe' : badgeType === 'warning' ? '⚡ Warning' : '🚨 Over'}
              </Text>
            </View>
          ) : null}
          <Text style={styles.amountText}>{formatMoney(item.spent)} / {formatMoney(item.limit)}</Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFillWrap,
            {
              width: widthInterpolate,
            },
            appearance.glow && styles.progressOverGlow,
          ]}
        >
          <LinearGradient colors={[...appearance.gradient]} style={styles.progressFillGradient} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} />
        </Animated.View>
      </View>

      <View style={styles.cardBottomRow}>
        <Text style={[styles.percentageText, { color: appearance.textColor }]}>{Math.round(percentage)}%</Text>
        <Text
          style={[
            styles.statusText,
            percentage >= 100 && { color: COLORS.coral },
            percentage >= 80 && percentage < 100 && { color: COLORS.amber },
          ]}
        >
          {statusText}
        </Text>
      </View>
    </View>
  );
}

function BudgetCardSkeleton({ pulse }: { pulse: Animated.Value }) {
  return (
    <View style={styles.budgetCard}>
      <View style={styles.cardTopRow}>
        <Animated.View style={[styles.skeletonLineLarge, { opacity: pulse }]} />
        <Animated.View style={[styles.skeletonLineMedium, { opacity: pulse }]} />
      </View>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.skeletonProgress, { opacity: pulse }]} />
      </View>
      <View style={styles.cardBottomRow}>
        <Animated.View style={[styles.skeletonLineTiny, { opacity: pulse }]} />
        <Animated.View style={[styles.skeletonLineMedium, { opacity: pulse }]} />
      </View>
    </View>
  );
}

export default function BudgetOverviewScreen() {
  const router = useRouter();
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [budgets, setBudgets] = useState<BudgetStatusItem[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<string[]>([]);
  const [isCopying, setIsCopying] = useState(false);
  const budgetLimitHapticKey = useRef('');

  const skeletonPulse = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(skeletonPulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(skeletonPulse, { toValue: 0.45, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [skeletonPulse]);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const [budgetItems, summary] = await Promise.all([
        getBudgetStatus(month, year),
        getPersonalSummary(month, year),
      ]);

      setBudgets(Array.isArray(budgetItems) ? budgetItems : []);

      const categoriesFromExpenses = Array.isArray(summary?.data?.categories)
        ? summary.data.categories
            .filter((entry: any) => Number(entry?.count || 0) > 0 || Number(entry?.total || 0) > 0)
            .map((entry: any) => String(entry?.name || '').trim())
            .filter(Boolean)
        : [];

      setExpenseCategories(categoriesFromExpenses);
    } catch (error) {
      console.error('Failed to load budget overview:', error);
      setError('Failed to load budget overview');
      setBudgets([]);
      setExpenseCategories([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [month, year]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void hapticImpactLight();
    loadData();
  }, [loadData]);

  const handleCopyPreviousBudget = async () => {
    try {
      setIsCopying(true);
      const success = await copyPreviousBudget(month, year);
      if (success) {
        void hapticImpactLight();
        await loadData();
      }
    } catch (err: any) {
      console.log('Copy budget error:', err);
      Alert.alert('Copy Failed', err?.response?.data?.message || 'Could not copy budgets');
    } finally {
      setIsCopying(false);
    }
  };

  const handleEdit = useCallback((item: BudgetStatusItem) => {
    router.push({
      pathname: '/budget/set' as any,
      params: { 
        month: String(month), 
        year: String(year), 
        category: item.category,
        amount: String(item.limit),
        budgetId: item.id
      },
    });
  }, [month, year, router]);

  const handleDelete = useCallback((item: BudgetStatusItem) => {
    Alert.alert('Remove Budget', `Are you sure you want to remove the budget for ${item.category}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteBudget(item.id);
            void hapticImpactLight();
            await loadData();
          } catch (err: any) {
            Alert.alert('Error', 'Failed to remove budget');
          }
        },
      },
    ]);
  }, [loadData]);

  useEffect(() => {
    if (!budgets.length) {
      return;
    }

    const hasOverLimit = budgets.some((item) => Number(item.percentage || 0) >= 100);
    const currentKey = `${year}-${month}`;
    if (hasOverLimit && budgetLimitHapticKey.current !== currentKey) {
      budgetLimitHapticKey.current = currentKey;
      void hapticNotifyWarning();
    }
  }, [budgets, month, year]);

  const summary = useMemo(() => {
    const totalBudget = budgets.reduce((acc, item) => acc + Number(item.limit || 0), 0);
    const totalSpent = budgets.reduce((acc, item) => acc + Number(item.spent || 0), 0);
    const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    return { totalBudget, totalSpent, percentage };
  }, [budgets]);

  const noBudgetCategories = useMemo(() => {
    const budgeted = new Set(budgets.map((item) => normalize(item.category)));
    return expenseCategories.filter((name) => !budgeted.has(normalize(name)));
  }, [budgets, expenseCategories]);

  const summaryColors = getSummaryAppearance(summary.percentage);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()} activeOpacity={0.85}>
          <Ionicons name="chevron-back" size={18} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Budget</Text>

        <View style={{flexDirection: 'row', gap: 8, alignItems: 'center'}}>
          <TouchableOpacity
            style={styles.copyHeaderBtn}
            onPress={handleCopyPreviousBudget}
            disabled={isCopying}
            activeOpacity={0.85}
          >
            {isCopying ? <ActivityIndicator size="small" color={COLORS.violetLight} /> : <Ionicons name="copy-outline" size={16} color={COLORS.violetLight} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.setBudgetBtn}
            onPress={() =>
              router.push({
                pathname: '/budget/set' as any,
                params: { month: String(month), year: String(year) },
              })
            }
            activeOpacity={0.85}
          >
            <Text style={styles.setBudgetBtnText}>+ Set Budget</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.monthSelectorRow}>
        <MonthSelector
          month={month}
          year={year}
          onChange={(nextMonth, nextYear) => {
            setMonth(nextMonth);
            setYear(nextYear);
          }}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.violet} />}
      >
        <View style={styles.summaryStrip}>
          {loading ? (
            <>
              <Animated.View style={[styles.skeletonLineWide, { opacity: skeletonPulse }]} />
              <View style={styles.summaryProgressTrack}>
                <Animated.View style={[styles.skeletonProgress, { opacity: skeletonPulse }]} />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.summaryText}>
                {formatMoney(summary.totalSpent)} spent of {formatMoney(summary.totalBudget)} total budget
              </Text>
              <View style={styles.summaryProgressTrack}>
                <LinearGradient
                  colors={[...summaryColors]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={[styles.summaryProgressFill, { width: `${Math.max(0, Math.min(100, summary.percentage))}%` }]}
                />
              </View>
            </>
          )}
        </View>

        {loading ? (
          <>
            <BudgetCardSkeleton pulse={skeletonPulse} />
            <BudgetCardSkeleton pulse={skeletonPulse} />
            <BudgetCardSkeleton pulse={skeletonPulse} />
          </>
        ) : budgets.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyTitle}>No budgets set yet</Text>
            <Text style={styles.emptySubtitle}>Set spending limits to track your expenses or copy them from the previous month.</Text>
            
            <View style={styles.emptyActionRow}>
              <TouchableOpacity 
                style={[styles.emptyActionBtn, isCopying && { opacity: 0.7 }]} 
                onPress={handleCopyPreviousBudget}
                disabled={isCopying}
                activeOpacity={0.8}
              >
                {isCopying ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                   <Text style={styles.emptyActionText}>Copy from Past Month</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.emptyActionBtnSecondary}
                onPress={() =>
                  router.push({
                    pathname: '/budget/set' as any,
                    params: { month: String(month), year: String(year) },
                  })
                }
                disabled={isCopying}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyActionTextSecondary}>Start Fresh</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {budgets.map((item) => (
              <BudgetCard key={item.id} item={item} onEdit={handleEdit} onDelete={handleDelete} />
            ))}

            {noBudgetCategories.length > 0 ? (
              <View style={styles.noBudgetWrap}>
                <Text style={styles.noBudgetTitle}>No budget set for:</Text>
                <View style={styles.pillWrap}>
                  {noBudgetCategories.map((category) => (
                    <View key={category} style={styles.noBudgetPill}>
                      <Text style={styles.noBudgetPillText}>{category}</Text>
                      <TouchableOpacity
                        style={styles.noBudgetSetBtn}
                        onPress={() =>
                          router.push({
                            pathname: '/budget/set' as any,
                            params: {
                              month: String(month),
                              year: String(year),
                              category,
                            },
                          })
                        }
                        activeOpacity={0.85}
                      >
                        <Text style={styles.noBudgetSetBtnText}>+ Set</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.elevated,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontFamily: 'Syne_700Bold',
  },
  setBudgetBtn: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: 'rgba(124,92,252,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(124,92,252,0.3)',
  },
  copyHeaderBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124,92,252,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(124,92,252,0.3)',
  },
  setBudgetBtnText: {
    color: COLORS.violetLight,
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
  },
  monthSelectorRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  monthArrow: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.elevated,
  },
  monthLabel: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontFamily: 'DMSans_700Bold',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  summaryStrip: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    padding: 16,
    marginBottom: 12,
  },
  summaryText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontFamily: 'DMSans_600SemiBold',
    marginBottom: 10,
  },
  summaryProgressTrack: {
    width: '100%',
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: COLORS.elevated,
  },
  summaryProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  budgetCard: {
    backgroundColor: '#14141F',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  categoryTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontFamily: 'DMSans_700Bold',
    flex: 1,
  },
  cardTopRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  amountText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: 'DMSans_600SemiBold',
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  badgeSafe: {
    backgroundColor: 'rgba(0,229,176,0.12)',
    borderColor: 'rgba(0,229,176,0.25)',
  },
  badgeWarning: {
    backgroundColor: 'rgba(255,181,71,0.12)',
    borderColor: 'rgba(255,181,71,0.25)',
  },
  badgeOver: {
    backgroundColor: 'rgba(255,95,126,0.12)',
    borderColor: 'rgba(255,95,126,0.25)',
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'DMSans_700Bold',
    color: COLORS.textPrimary,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#1A1A2B',
    marginBottom: 10,
  },
  progressFillWrap: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFillGradient: {
    width: '100%',
    height: '100%',
  },
  progressOverGlow: {
    shadowColor: '#FF5F7E',
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  percentageText: {
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
  },
  statusText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_500Medium',
  },
  noBudgetWrap: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
  },
  noBudgetTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontFamily: 'DMSans_700Bold',
    marginBottom: 8,
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  noBudgetPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.elevated,
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noBudgetPillText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontFamily: 'DMSans_600SemiBold',
  },
  noBudgetSetBtn: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(124,92,252,0.4)',
    backgroundColor: 'rgba(124,92,252,0.15)',
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  noBudgetSetBtnText: {
    color: COLORS.violetLight,
    fontSize: 10,
    fontFamily: 'DMSans_700Bold',
  },
  emptyWrap: {
    marginTop: 42,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyEmoji: {
    fontSize: 52,
    marginBottom: 10,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontFamily: 'Syne_700Bold',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: 'DMSans_500Medium',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyActionBtn: {
    backgroundColor: COLORS.violet,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'DMSans_700Bold',
  },
  emptyActionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 4,
  },
  emptyActionBtnSecondary: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emptyActionTextSecondary: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontFamily: 'DMSans_700Bold',
  },
  skeletonLineWide: {
    width: '72%',
    height: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.14)',
    marginBottom: 10,
  },
  skeletonLineLarge: {
    width: '46%',
    height: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  skeletonLineMedium: {
    width: 92,
    height: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  skeletonLineTiny: {
    width: 38,
    height: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  skeletonProgress: {
    width: '60%',
    height: '100%',
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
});
