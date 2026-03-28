import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { MonthSelector } from '@/src/components/analytics/MonthSelector';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { hapticImpactLight, hapticNotifyWarning } from '@/src/utils/haptics';

import type { PersonalExpense } from '@/src/types/personal.types';
import { deleteExpense, getExpenses } from '@/src/services/personal.service';

type CategoryFilter = 'All' | 'Food' | 'Transport' | 'Shopping';

interface SectionGroup {
  title: 'TODAY' | 'YESTERDAY' | 'OLDER';
  items: PersonalExpense[];
}

const COLORS = {
  surface: '#0F0F1A',
  elevated: '#171727',
  card: '#1A1A2B',
  textPrimary: '#F0F0FF',
  textSecondary: '#8888AA',
  textMuted: '#5F5F7A',
  border: 'rgba(255,255,255,0.08)',
  violet: '#7C5CFC',
  mint: '#00E5B0',
  amber: '#FFB547',
  coral: '#FF5F7E',
};

const CATEGORIES: CategoryFilter[] = ['All', 'Food', 'Transport', 'Shopping'];

const categoryEmoji = (category: string): string => {
  switch (category) {
    case 'Food':
      return '🍔';
    case 'Transport':
      return '🚕';
    case 'Shopping':
      return '🛍️';
    case 'Entertainment':
      return '🎬';
    case 'Utilities':
      return '💡';
    default:
      return '⚪';
  }
};

const toDate = (value: Date | string): Date => (value instanceof Date ? value : new Date(value));

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const formatTime = (value: Date | string): string => {
  const date = toDate(value);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getExpenseId = (item: PersonalExpense & { _id?: string }): string => item.id || item._id || '';

export default function PersonalExpenseScreen() {
  const router = useRouter();
  const today = new Date();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)');
  };

  const [expenses, setExpenses] = useState<PersonalExpense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');

  const fetchExpenses = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      const response = await getExpenses(
        selectedMonth,
        selectedYear,
        selectedCategory === 'All' ? undefined : selectedCategory,
        50,
        1
      );
      const list = response?.data?.expenses || [];
      setExpenses(Array.isArray(list) ? list : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch personal expenses');
      setExpenses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const sections: SectionGroup[] = useMemo(() => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const todayItems: PersonalExpense[] = [];
    const yesterdayItems: PersonalExpense[] = [];
    const olderItems: PersonalExpense[] = [];

    expenses.forEach((item) => {
      const date = toDate(item.expenseDate);
      if (isSameDay(date, now)) {
        todayItems.push(item);
      } else if (isSameDay(date, yesterday)) {
        yesterdayItems.push(item);
      } else {
        olderItems.push(item);
      }
    });

    return [
      { title: 'TODAY' as const, items: todayItems },
      { title: 'YESTERDAY' as const, items: yesterdayItems },
      { title: 'OLDER' as const, items: olderItems },
    ].filter((section) => section.items.length > 0);
  }, [expenses]);

  const handleDelete = useCallback((expenseId: string) => {
    Alert.alert('Delete Expense', 'Are you sure you want to delete this personal expense?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            void hapticNotifyWarning();
            await deleteExpense(expenseId);
            setExpenses((prev) => prev.filter((item) => getExpenseId(item as PersonalExpense & { _id?: string }) !== expenseId));
          } catch (err: any) {
            Alert.alert('Delete Failed', err?.response?.data?.message || 'Could not delete expense');
          }
        },
      },
    ]);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    void hapticImpactLight();
    await fetchExpenses();
  }, [fetchExpenses]);

  const renderRightAction = (expenseId: string) => (
    <TouchableOpacity style={styles.deleteAction} onPress={() => handleDelete(expenseId)} activeOpacity={0.85}>
      <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  );

  const renderExpenseCard = (item: PersonalExpense) => {
    const expenseId = getExpenseId(item as PersonalExpense & { _id?: string });
    const date = toDate(item.expenseDate);

    return (
      <Swipeable key={expenseId} renderRightActions={() => renderRightAction(expenseId)} overshootRight={false}>
        <TouchableOpacity
          style={styles.expenseCard}
          activeOpacity={0.88}
          onPress={() =>
            router.push({
              pathname: '/personal/[id]',
              params: {
                id: expenseId,
                title: item.description,
                amount: String(item.amount),
                category: item.category,
                paymentMethod: item.paymentMethod,
                expenseDate: String(item.expenseDate),
                recurring: item.isRecurring ? '1' : '0',
                recurringType: item.recurringType || '',
                note: item.note || '',
                receiptUrl: item.receiptUrl || '',
              },
            })
          }
        >
          <View style={styles.leftBlock}>
            <Text style={styles.categoryIcon}>{categoryEmoji(item.category)}</Text>
            <View style={styles.textBlock}>
              <View style={styles.titleRow}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.description}
                </Text>
                {item.isRecurring ? <Text style={styles.recurringBadge}>🔄</Text> : null}
              </View>
              <Text style={styles.metaText}>
                {item.paymentMethod} • {formatTime(date)}
              </Text>
            </View>
          </View>

          <Text style={styles.amount}>₹{Number(item.amount || 0).toLocaleString('en-IN')}</Text>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.headerWrap}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.backBtn} activeOpacity={0.85} onPress={handleBack}>
            <Ionicons name="chevron-back" size={18} color={COLORS.textPrimary} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addBtn}
            activeOpacity={0.85}
            onPress={() => router.push('/personal/add')}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerRow}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerTitle}>Personal Expenses</Text>
            <Text style={styles.headerSub}>Track your daily spending</Text>
          </View>
        </View>
      </View>

      <View style={styles.monthSelectorWrap}>
        <View style={styles.monthSelectorCard}>
          <MonthSelector
            month={selectedMonth}
            year={selectedYear}
            onChange={(month, year) => {
              setSelectedMonth(month);
              setSelectedYear(year);
            }}
          />
        </View>
      </View>

      <View style={styles.categoryWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {CATEGORIES.map((category) => {
            const selected = selectedCategory === category;
            return (
              <TouchableOpacity
                key={category}
                style={[styles.categoryPill, selected && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(category)}
                activeOpacity={0.85}
              >
                <Text style={[styles.categoryText, selected && styles.categoryTextActive]}>{category}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.listWrap}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.violet} />}
      >
        {loading ? <Text style={styles.infoText}>Loading expenses...</Text> : null}
        {!loading && error ? <ErrorState onRetry={onRefresh} /> : null}

        {!loading && !error && sections.length === 0 ? (
          <EmptyState
            emoji="📝"
            title="No expenses this month"
            subtitle="Start tracking your personal spending"
          />
        ) : null}

        {sections.map((section) => (
          <View key={section.title} style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCards}>{section.items.map((item) => renderExpenseCard(item))}</View>
          </View>
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  headerWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: 'rgba(23, 23, 39, 0.45)',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backBtn: {
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.elevated,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  backText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontFamily: 'DMSans_600SemiBold',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerTextBlock: {
    flex: 1,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 23,
    fontFamily: 'Syne_800ExtraBold',
    letterSpacing: -0.3,
  },
  headerSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'DMSans_500Medium',
  },
  addBtn: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: COLORS.violet,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'DMSans_600SemiBold',
  },
  monthSelectorWrap: {
    paddingTop: 6,
    paddingBottom: 8,
  },
  monthSelectorCard: {
    paddingHorizontal: 16,
  },
  monthRow: {
    paddingHorizontal: 16,
    gap: 10,
  },
  monthPill: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthPillActive: {
    backgroundColor: COLORS.violet,
    borderColor: COLORS.violet,
  },
  monthText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: 'DMSans_600SemiBold',
  },
  monthTextActive: {
    color: '#FFFFFF',
  },
  categoryWrap: {
    paddingBottom: 8,
  },
  categoryRow: {
    paddingHorizontal: 16,
    gap: 10,
  },
  categoryPill: {
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPillActive: {
    backgroundColor: 'rgba(124, 92, 252, 0.2)',
    borderColor: 'rgba(124, 92, 252, 0.7)',
  },
  categoryText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: 'DMSans_600SemiBold',
  },
  categoryTextActive: {
    color: COLORS.textPrimary,
  },
  listWrap: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sectionBlock: {
    marginBottom: 18,
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    letterSpacing: 1.1,
    marginBottom: 10,
    fontFamily: 'DMSans_600SemiBold',
  },
  sectionCards: {
    gap: 10,
  },
  expenseCard: {
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  leftBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  categoryIcon: {
    fontSize: 20,
    width: 30,
    textAlign: 'center',
    marginRight: 8,
  },
  textBlock: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
    flexShrink: 1,
  },
  recurringBadge: {
    marginLeft: 6,
    fontSize: 14,
  },
  metaText: {
    color: COLORS.textSecondary,
    marginTop: 3,
    fontSize: 11,
    fontFamily: 'DMSans_500Medium',
  },
  amount: {
    color: COLORS.amber,
    fontSize: 15,
    fontFamily: 'Syne_700Bold',
  },
  deleteAction: {
    width: 88,
    marginLeft: 8,
    borderRadius: 14,
    backgroundColor: COLORS.coral,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'DMSans_600SemiBold',
  },
  infoText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: 'DMSans_500Medium',
    paddingVertical: 16,
  },
  errorText: {
    color: COLORS.coral,
    fontSize: 13,
    fontFamily: 'DMSans_500Medium',
    paddingVertical: 16,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 42,
  },
  emptyEmoji: {
    fontSize: 26,
    marginBottom: 8,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'DMSans_600SemiBold',
  },
  emptySub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
  },
});
