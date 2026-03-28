import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { AmountInput } from '@/components/expenses/AmountInput';
import { COLORS as ThemeColors } from '@/src/constants/theme';
import { createBudget, deleteBudget, getBudgetStatus, updateBudget } from '@/src/services/budget.service';
import { getSummary as getPersonalSummary } from '@/src/services/personal.service';
import type { BudgetStatusItem } from '@/src/types/budget.types';
import { showSuccessToast } from '@/src/utils/toast';
import { useBackNavigation } from '@/src/hooks/useBackNavigation';

const COLORS = {
  surface: '#0F0F1A',
  card: '#14141F',
  elevated: '#1A1A2B',
  textPrimary: '#F0F0FF',
  textSecondary: '#8888AA',
  textMuted: '#55556A',
  border: 'rgba(255,255,255,0.08)',
  violet: ThemeColors.primary,
  violetLight: '#9B7FFF',
  coral: '#FF5F7E',
};

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const QUICK_SUGGESTIONS = [1000, 2000, 3000, 5000];

type CategoryOption = { key: string; label: string; emoji: string; aliases?: string[] };

const CATEGORY_OPTIONS: CategoryOption[] = [
  { key: 'Food', label: 'Food & Drinks', emoji: '🍔', aliases: ['food', 'food & drinks'] },
  { key: 'Transport', label: 'Transport', emoji: '🚕', aliases: ['transport'] },
  { key: 'Entertainment', label: 'Entertainment', emoji: '🎬', aliases: ['entertainment'] },
  { key: 'Education', label: 'Education', emoji: '📚', aliases: ['education'] },
  { key: 'Shopping', label: 'Shopping', emoji: '🛍️', aliases: ['shopping'] },
  { key: 'Health', label: 'Health', emoji: '💊', aliases: ['health', 'healthcare'] },
  { key: 'Rent & Utilities', label: 'Rent & Utilities', emoji: '🏠', aliases: ['rent & utilities', 'utilities', 'rent'] },
  { key: 'Subscriptions', label: 'Subscriptions', emoji: '📱', aliases: ['subscriptions'] },
  { key: 'Savings', label: 'Savings', emoji: '💰', aliases: ['savings'] },
  { key: 'Gaming', label: 'Gaming', emoji: '🎮', aliases: ['gaming'] },
  { key: 'Travel', label: 'Travel', emoji: '✈️', aliases: ['travel'] },
  { key: 'Gifts', label: 'Gifts', emoji: '🎁', aliases: ['gifts'] },
  { key: 'Other', label: 'Other', emoji: '⚡', aliases: ['other'] },
];

const normalize = (value: string): string => String(value || '').trim().toLowerCase();
const parseAmount = (value: string): number => Number(String(value || '0').replace(/,/g, '')) || 0;
const formatMoney = (value: number): string => `₹${Math.abs(Number(value || 0)).toLocaleString('en-IN')}`;

const resolveCategoryFromParam = (input?: string): string => {
  const normalized = normalize(String(input || ''));
  if (!normalized) {
    return CATEGORY_OPTIONS[0].key;
  }

  const match = CATEGORY_OPTIONS.find(
    (item) => normalize(item.key) === normalized || normalize(item.label) === normalized || (item.aliases || []).includes(normalized)
  );

  return match?.key || CATEGORY_OPTIONS[0].key;
};

export default function SetBudgetScreen() {
  const router = useRouter();
  const handleBack = useBackNavigation('/budget' as any, undefined, { alwaysUseFallback: true });
  const params = useLocalSearchParams<{ month?: string; year?: string; category?: string }>();

  const now = new Date();
  const initialMonth = Number(params.month || now.getMonth() + 1);
  const initialYear = Number(params.year || now.getFullYear());

  const [selectedCategory, setSelectedCategory] = useState<string>(() => resolveCategoryFromParam(String(params.category || '')));
  const [amountInput, setAmountInput] = useState('0');
  const [month, setMonth] = useState(initialMonth >= 1 && initialMonth <= 12 ? initialMonth : now.getMonth() + 1);
  const [year, setYear] = useState(initialYear >= 2000 ? initialYear : now.getFullYear());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [amountError, setAmountError] = useState('');
  const [allBudgets, setAllBudgets] = useState<BudgetStatusItem[]>([]);
  const [spentByCategory, setSpentByCategory] = useState<Record<string, number>>({});

  const numericAmount = useMemo(() => parseAmount(amountInput), [amountInput]);

  const selectedMeta = useMemo(() => {
    return CATEGORY_OPTIONS.find((item) => item.key === selectedCategory) || CATEGORY_OPTIONS[0];
  }, [selectedCategory]);

  const existingBudget = useMemo(() => {
    return allBudgets.find((item) => normalize(item.category) === normalize(selectedCategory));
  }, [allBudgets, selectedCategory]);

  const currentSpent = useMemo(() => {
    const exact = spentByCategory[normalize(selectedCategory)] || 0;
    return Number(exact || 0);
  }, [selectedCategory, spentByCategory]);

  const isEditMode = Boolean(existingBudget?.id);

  const validateAmount = useCallback((amountValue: number): string => {
    if (!amountValue || amountValue <= 0) {
      return 'Enter an amount greater than ₹0';
    }

    if (amountValue > 100000) {
      return 'Amount cannot exceed ₹1,00,000';
    }

    return '';
  }, []);

  const fetchMonthData = useCallback(async () => {
    try {
      setLoading(true);

      const [budgetsResponse, summaryResponse] = await Promise.all([
        getBudgetStatus(month, year),
        getPersonalSummary(month, year),
      ]);

      const budgets = Array.isArray(budgetsResponse) ? budgetsResponse : [];
      setAllBudgets(budgets);

      const categorySpendMap: Record<string, number> = {};
      const categories = Array.isArray(summaryResponse?.data?.categories) ? summaryResponse.data.categories : [];
      categories.forEach((item: any) => {
        const key = normalize(String(item?.name || ''));
        if (!key) return;
        categorySpendMap[key] = Number(item?.total || 0);
      });
      setSpentByCategory(categorySpendMap);

      const match = budgets.find((item) => normalize(item.category) === normalize(selectedCategory));
      if (match) {
        setAmountInput(String(Math.round(Number(match.limit || 0))));
        setAmountError('');
      } else {
        setAmountInput('0');
      }
    } catch (error) {
      console.error('Failed to load set budget data:', error);
      setAllBudgets([]);
      setSpentByCategory({});
      setAmountInput('0');
    } finally {
      setLoading(false);
    }
  }, [month, selectedCategory, year]);

  useFocusEffect(
    useCallback(() => {
      fetchMonthData();
    }, [fetchMonthData])
  );

  const handleCategoryPress = (categoryKey: string) => {
    setSelectedCategory(categoryKey);
    const existing = allBudgets.find((item) => normalize(item.category) === normalize(categoryKey));
    if (existing) {
      setAmountInput(String(Math.round(Number(existing.limit || 0))));
      setAmountError('');
      return;
    }
    setAmountInput('0');
  };

  const handleAmountChange = (value: string) => {
    setAmountInput(value);
    const nextAmount = parseAmount(value);
    setAmountError(validateAmount(nextAmount));
  };

  const handleSuggestion = (amount: number) => {
    setAmountInput(String(amount));
    setAmountError(validateAmount(amount));
  };

  const handleSave = async () => {
    if (!selectedCategory) {
      setAmountError('Please select a category');
      return;
    }

    const validation = validateAmount(numericAmount);
    if (validation) {
      setAmountError(validation);
      return;
    }

    try {
      setSaving(true);
      setAmountError('');

      const payload = {
        category: selectedCategory,
        limit: numericAmount,
        monthlyLimit: numericAmount,
        month,
        year,
      } as any;

      if (existingBudget?.id) {
        await updateBudget(existingBudget.id, { limit: numericAmount });
      } else {
        await createBudget(payload);
      }

      showSuccessToast('🎯 Budget saved');

      router.replace({
        pathname: '/budget' as any,
        params: { month: String(month), year: String(year) },
      });
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.response?.data?.error || 'Failed to save budget';
      Alert.alert('Save failed', message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingBudget?.id) {
      return;
    }

    Alert.alert('Remove Budget', `Remove budget for ${selectedMeta.label}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeleting(true);
            await deleteBudget(existingBudget.id);
            router.replace({
              pathname: '/budget' as any,
              params: { month: String(month), year: String(year) },
            });
          } catch (error: any) {
            const message =
              error?.response?.data?.message || error?.response?.data?.error || 'Failed to remove budget';
            Alert.alert('Delete failed', message);
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.85}>
            <Ionicons name="chevron-back" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Set Budget</Text>
          <View style={styles.backPlaceholder} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORY_OPTIONS.map((item) => {
                const selected = selectedCategory === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.categoryCell, selected && styles.categoryCellSelected]}
                    onPress={() => handleCategoryPress(item.key)}
                    activeOpacity={0.85}
                  >
                    {selected ? (
                      <View style={styles.selectedBadge}>
                        <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                      </View>
                    ) : null}
                    <Text style={styles.categoryEmoji}>{item.emoji}</Text>
                    <Text style={[styles.categoryLabel, selected && styles.categoryLabelSelected]} numberOfLines={2}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Monthly limit for {selectedMeta.label}</Text>
            <AmountInput value={amountInput} onChange={handleAmountChange} error={amountError || undefined} />

            <View style={styles.suggestionRow}>
              {QUICK_SUGGESTIONS.map((value) => {
                const active = numericAmount === value;
                return (
                  <TouchableOpacity
                    key={value}
                    style={[styles.suggestionPill, active && styles.suggestionPillActive]}
                    onPress={() => handleSuggestion(value)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.suggestionText, active && styles.suggestionTextActive]}>₹{value.toLocaleString('en-IN')}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>For the month of:</Text>
            <View style={styles.monthRow}>
              <TouchableOpacity style={styles.monthArrow} onPress={() => {
                if (month === 1) {
                  setMonth(12);
                  setYear((prev) => prev - 1);
                } else {
                  setMonth((prev) => prev - 1);
                }
              }}>
                <Ionicons name="chevron-back" size={16} color={COLORS.textPrimary} />
              </TouchableOpacity>

              <Text style={styles.monthLabel}>{MONTH_NAMES[month - 1]} {year}</Text>

              <TouchableOpacity style={styles.monthArrow} onPress={() => {
                if (month === 12) {
                  setMonth(1);
                  setYear((prev) => prev + 1);
                } else {
                  setMonth((prev) => prev + 1);
                }
              }}>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {currentSpent > 0 ? (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                You've already spent {formatMoney(currentSpent)} on {selectedMeta.label} this month
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.saveWrap, (!selectedCategory || numericAmount <= 0 || Boolean(amountError) || loading || deleting) && styles.saveWrapDisabled]}
            onPress={handleSave}
            activeOpacity={0.9}
            disabled={!selectedCategory || numericAmount <= 0 || Boolean(amountError) || saving || loading || deleting}
          >
            <LinearGradient
              colors={(!selectedCategory || numericAmount <= 0 || Boolean(amountError) || loading || deleting)
                ? ['#3C3C4A', '#3C3C4A']
                : [ThemeColors.primary, ThemeColors.primaryLight]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.saveGradient}
            >
              {saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.saveText}>{isEditMode ? 'Update Budget' : 'Save Budget'}</Text>}
            </LinearGradient>
          </TouchableOpacity>

          {isEditMode ? (
            <TouchableOpacity onPress={handleDelete} disabled={deleting || saving} style={styles.removeWrap}>
              {deleting ? <ActivityIndicator size="small" color={COLORS.coral} /> : <Text style={styles.removeText}>Remove Budget</Text>}
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPlaceholder: {
    width: 34,
    height: 34,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontFamily: 'Syne_700Bold',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 28,
  },
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    padding: 14,
    gap: 10,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontFamily: 'DMSans_700Bold',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  categoryCell: {
    width: '48.5%',
    minHeight: 74,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#1A1A2B',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    position: 'relative',
  },
  categoryCellSelected: {
    borderColor: 'rgba(124,92,252,0.3)',
    backgroundColor: 'rgba(124,92,252,0.12)',
  },
  selectedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: ThemeColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'DMSans_600SemiBold',
  },
  categoryLabelSelected: {
    color: COLORS.violetLight,
  },
  suggestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 2,
  },
  suggestionPill: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.elevated,
    paddingVertical: 8,
    alignItems: 'center',
  },
  suggestionPillActive: {
    backgroundColor: 'rgba(124,92,252,0.15)',
    borderColor: 'rgba(124,92,252,0.35)',
  },
  suggestionText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
  },
  suggestionTextActive: {
    color: COLORS.violetLight,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  monthArrow: {
    width: 30,
    height: 30,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontFamily: 'DMSans_700Bold',
    minWidth: 146,
    textAlign: 'center',
  },
  infoBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(124,92,252,0.2)',
    backgroundColor: 'rgba(124,92,252,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  infoText: {
    color: '#C9B6FF',
    fontSize: 12,
    fontFamily: 'DMSans_600SemiBold',
  },
  saveWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 4,
  },
  saveWrapDisabled: {
    opacity: 0.85,
  },
  saveGradient: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'DMSans_700Bold',
  },
  removeWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  removeText: {
    color: COLORS.coral,
    fontSize: 13,
    fontFamily: 'DMSans_700Bold',
  },
});
