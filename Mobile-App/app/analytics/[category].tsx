import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BarChart } from 'react-native-gifted-charts';
import { getBudgetStatus } from '@/src/services/budget.service';
import { getCategoryBreakdown } from '@/src/services/analytics.service';
import { getExpenses } from '@/src/services/personal.service';
import { PersonalExpense } from '@/src/types/personal.types';
import { MonthSelector } from '@/src/components/analytics/MonthSelector';
import { useBackNavigation } from '@/src/hooks/useBackNavigation';

const COLORS = {
  surface: '#0F0F1A',
  elevated: '#14141F',
  card: '#1A1A2B',
  violet: '#7C5CFC',
  mint: '#00E5B0',
  coral: '#FF5F7E',
  amber: '#FFB547',
  textPrimary: '#F0F0FF',
  textSecondary: '#8888AA',
  textMuted: '#55556A',
  border: 'rgba(255,255,255,0.06)',
};

const EMOJI_BY_CATEGORY: Record<string, string> = {
  'Food & Drinks': '🍔',
  Transport: '🚕',
  Entertainment: '🎬',
  Shopping: '🛍️',
  Health: '💊',
  Education: '📚',
  Rent: '🏠',
  Subscriptions: '📺',
  Gaming: '🎮',
  Travel: '✈️',
  Gifts: '🎁',
  Other: '📦',
};

const getMonthRange = (month: number, year: number) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { start, end };
};

const formatDate = (value: string | Date) => {
  const date = new Date(value);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });
};

export default function CategoryDrilldownScreen() {
  const router = useRouter();
  const handleBack = useBackNavigation('/(tabs)/analytics' as any, undefined, { alwaysUseFallback: true });
  const params = useLocalSearchParams<{ category?: string; month?: string; year?: string }>();

  const now = new Date();
  const category = decodeURIComponent(String(params.category || 'Other'));
  const [month, setMonth] = useState<number>(Number(params.month || now.getMonth() + 1));
  const [year, setYear] = useState<number>(Number(params.year || now.getFullYear()));

  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<PersonalExpense[]>([]);
  const [budgetLimit, setBudgetLimit] = useState<number | null>(null);
  const [thisMonthTotal, setThisMonthTotal] = useState(0);
  const [lastMonthTotal, setLastMonthTotal] = useState(0);
  const [trendData, setTrendData] = useState<Array<{ value: number; label: string }>>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [budgetStatus, currentMonthExpenses, currentBreakdown] = await Promise.all([
          getBudgetStatus(month, year),
          getExpenses(month, year, category, 100, 1),
          getCategoryBreakdown(month, year),
        ]);

        const normalizedExpenses = Array.isArray(currentMonthExpenses?.data?.expenses)
          ? currentMonthExpenses.data.expenses
          : [];

        const sortedExpenses = [...normalizedExpenses].sort(
          (a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime()
        );

        setExpenses(sortedExpenses);

        const breakdownItem = (currentBreakdown.categories || []).find((item) => item.category === category);
        setThisMonthTotal(Number(breakdownItem?.total || 0));

        const previous = new Date(year, month - 2, 1);
        const previousMonth = previous.getMonth() + 1;
        const previousYear = previous.getFullYear();

        const previousBreakdown = await getCategoryBreakdown(previousMonth, previousYear);
        const previousItem = (previousBreakdown.categories || []).find((item) => item.category === category);
        setLastMonthTotal(Number(previousItem?.total || 0));

        const budgetItem = (budgetStatus || []).find((item) => item.category === category);
        setBudgetLimit(budgetItem ? Number(budgetItem.limit || 0) : null);

        const trendMonths = Array.from({ length: 6 }, (_, index) => {
          const d = new Date(year, month - 1 - (5 - index), 1);
          return { month: d.getMonth() + 1, year: d.getFullYear(), label: d.toLocaleString('en-US', { month: 'short' }) };
        });

        const trendResponses = await Promise.all(
          trendMonths.map((m) => getCategoryBreakdown(m.month, m.year))
        );

        const trend = trendResponses.map((response, index) => {
          const item = (response.categories || []).find((entry) => entry.category === category);
          return {
            label: trendMonths[index].label,
            value: Number(item?.total || 0),
          };
        });

        setTrendData(trend);
      } catch (error) {
        console.error('Failed to load category drilldown:', error);
        setExpenses([]);
        setBudgetLimit(null);
        setThisMonthTotal(0);
        setLastMonthTotal(0);
        setTrendData([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [category, month, year]);

  const averagePerExpense = useMemo(() => {
    if (!expenses.length) {
      return 0;
    }
    return thisMonthTotal / expenses.length;
  }, [expenses.length, thisMonthTotal]);

  const monthlyChange = useMemo(() => {
    if (lastMonthTotal <= 0) {
      return thisMonthTotal > 0 ? 100 : 0;
    }
    return Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100);
  }, [lastMonthTotal, thisMonthTotal]);

  const budgetProgress = useMemo(() => {
    if (!budgetLimit || budgetLimit <= 0) {
      return 0;
    }
    return Math.min(100, Math.round((thisMonthTotal / budgetLimit) * 100));
  }, [budgetLimit, thisMonthTotal]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Category Detail</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>{EMOJI_BY_CATEGORY[category] || '📦'}</Text>
          <Text style={styles.heroTitle}>{category}</Text>
          <MonthSelector month={month} year={year} onChange={(nextMonth, nextYear) => {
            setMonth(nextMonth);
            setYear(nextYear);
          }} />
        </View>

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={COLORS.violet} />
          </View>
        ) : (
          <>
            <View style={styles.summaryStrip}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Spent</Text>
                <Text style={styles.summaryValue}>₹{Math.round(thisMonthTotal).toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Transactions</Text>
                <Text style={styles.summaryValue}>{expenses.length}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Avg / txn</Text>
                <Text style={styles.summaryValue}>₹{Math.round(averagePerExpense).toLocaleString('en-IN')}</Text>
              </View>
            </View>

            <View style={styles.compareCard}>
              <Text style={styles.compareText}>
                {monthlyChange >= 0 ? '⬆' : '⬇'} {Math.abs(monthlyChange)}% vs last month
              </Text>
              <Text style={styles.compareSubText}>
                ₹{Math.round(thisMonthTotal).toLocaleString('en-IN')} vs ₹{Math.round(lastMonthTotal).toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Budget Status</Text>
              {budgetLimit ? (
                <>
                  <Text style={styles.sectionBodyText}>
                    ₹{Math.round(thisMonthTotal).toLocaleString('en-IN')} of ₹{Math.round(budgetLimit).toLocaleString('en-IN')}
                  </Text>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.max(5, budgetProgress)}%`,
                          backgroundColor: budgetProgress > 100 ? COLORS.coral : COLORS.mint,
                        },
                      ]}
                    />
                  </View>
                  {thisMonthTotal > budgetLimit ? (
                    <Text style={styles.warningText}>⚠ Over budget by ₹{Math.round(thisMonthTotal - budgetLimit).toLocaleString('en-IN')}</Text>
                  ) : null}
                </>
              ) : (
                <TouchableOpacity onPress={() => router.push('/budget' as any)}>
                  <Text style={styles.linkText}>Set budget for this category →</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Expense List</Text>
              {expenses.length ? (
                expenses.map((expense) => (
                  <TouchableOpacity
                    key={expense.id}
                    style={styles.expenseItem}
                    onPress={() => router.push(`/personal/${expense.id}` as any)}
                  >
                    <View style={styles.expenseTextWrap}>
                      <Text style={styles.expenseDesc}>{expense.description}</Text>
                      <Text style={styles.expenseMeta}>{formatDate(expense.expenseDate)} · {expense.paymentMethod}</Text>
                    </View>
                    <Text style={styles.expenseAmount}>₹{Math.round(expense.amount).toLocaleString('en-IN')}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.sectionBodyText}>No expenses in this category for selected month.</Text>
              )}
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Monthly Trend</Text>
              <BarChart
                data={trendData.map((item) => ({
                  value: item.value,
                  label: item.label,
                  frontColor: '#7C5CFC',
                }))}
                width={16}
                spacing={24}
                hideRules
                xAxisColor="rgba(255,255,255,0.14)"
                yAxisColor="rgba(255,255,255,0.14)"
                yAxisTextStyle={{ color: '#8888AA', fontSize: 10 }}
                xAxisLabelTextStyle={{ color: '#8888AA', fontSize: 10 }}
                isAnimated
                animationDuration={700}
                maxValue={Math.max(...trendData.map((item) => item.value), 100)}
              />
            </View>
          </>
        )}

        <View style={{ height: 36 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontFamily: 'Syne_700Bold',
  },
  heroCard: {
    marginTop: 16,
    gap: 10,
  },
  heroEmoji: {
    fontSize: 36,
  },
  heroTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontFamily: 'Syne_700Bold',
  },
  loaderWrap: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryStrip: {
    marginTop: 16,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: 'DMSans_500Medium',
  },
  summaryValue: {
    color: COLORS.textPrimary,
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'DMSans_600SemiBold',
  },
  compareCard: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  compareText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
  },
  compareSubText: {
    marginTop: 4,
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
  },
  sectionCard: {
    marginTop: 14,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    gap: 10,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontFamily: 'Syne_600SemiBold',
  },
  sectionBodyText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  warningText: {
    color: COLORS.coral,
    fontSize: 12,
    fontFamily: 'DMSans_600SemiBold',
  },
  linkText: {
    color: COLORS.violet,
    fontSize: 13,
    fontFamily: 'DMSans_600SemiBold',
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  expenseTextWrap: {
    flex: 1,
    paddingRight: 8,
  },
  expenseDesc: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontFamily: 'DMSans_500Medium',
  },
  expenseMeta: {
    marginTop: 2,
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: 'DMSans_400Regular',
  },
  expenseAmount: {
    color: COLORS.amber,
    fontSize: 13,
    fontFamily: 'DMSans_600SemiBold',
  },
});
