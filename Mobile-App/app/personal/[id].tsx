import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { COLORS as THEME_COLORS } from '@/src/constants/theme';
import { deleteExpense, getExpenseById } from '@/src/services/personal.service';
import type { PersonalExpense } from '@/src/types/personal.types';
import { showInfoToast } from '@/src/utils/toast';

const COLORS = {
  surface: '#0F0F1A',
  card: '#14141F',
  border: 'rgba(255,255,255,0.08)',
  textPrimary: '#F0F0FF',
  textSecondary: '#8888AA',
  textMuted: '#55556A',
  coral: '#FF5F7E',
  amberBg: 'rgba(245,158,11,0.12)',
  amberBorder: 'rgba(245,158,11,0.26)',
  editBg: 'rgba(124,92,252,0.15)',
  editBorder: 'rgba(124,92,252,0.3)',
  editText: '#9B7FFF',
  deleteBg: 'rgba(255,95,126,0.12)',
  deleteBorder: 'rgba(255,95,126,0.2)',
  glowFallback: 'rgba(99,102,241,0.2)',
  iconFallback: '#CBD5E1',
  paymentIcon: '#C9C9E8',
  accent: THEME_COLORS.primary,
};

const CATEGORY_VISUALS: Record<string, { emoji: string; glow: string }> = {
  Food: { emoji: '🍔', glow: 'rgba(255,178,102,0.26)' },
  Transport: { emoji: '🚕', glow: 'rgba(94,234,212,0.26)' },
  Entertainment: { emoji: '🎬', glow: 'rgba(167,139,250,0.26)' },
  Shopping: { emoji: '🛍️', glow: 'rgba(251,146,60,0.26)' },
  Utilities: { emoji: '💡', glow: 'rgba(250,204,21,0.26)' },
  Healthcare: { emoji: '🩺', glow: 'rgba(251,113,133,0.26)' },
  Other: { emoji: '🧾', glow: 'rgba(148,163,184,0.26)' },
};

const formatINR = (value: number): string => `₹${Math.abs(Number(value || 0)).toLocaleString('en-IN')}`;

const formatDateFull = (value: string | Date): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTime = (value: string | Date): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const titleCase = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

const getNextOccurrence = (expenseDate: string | Date, recurringType?: string | null): string => {
  const source = expenseDate instanceof Date ? new Date(expenseDate) : new Date(expenseDate);
  if (Number.isNaN(source.getTime())) return '-';

  const next = new Date(source);
  switch (String(recurringType || '').toLowerCase()) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    default:
      next.setMonth(next.getMonth() + 1);
      break;
  }

  return next.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getPaymentLabelWithIcon = (paymentMethod: string): string => {
  const normalized = String(paymentMethod || '').trim().toLowerCase();
  if (normalized === 'cash') return '💵 Cash';
  if (normalized === 'upi') return '📱 UPI';
  if (normalized === 'card') return '💳 Card';
  return paymentMethod || '-';
};

export default function PersonalExpenseDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();

  const expenseId = String(params.id || '');

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [expense, setExpense] = useState<PersonalExpense | null>(null);
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);

  const loadExpense = useCallback(async () => {
    if (!expenseId) {
      setError('Expense not found.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await getExpenseById(expenseId);
      setExpense(data);
    } catch (err: any) {
      setExpense(null);
      setError(err?.response?.data?.message || 'Could not load expense details');
    } finally {
      setLoading(false);
    }
  }, [expenseId]);

  useEffect(() => {
    loadExpense();
  }, [loadExpense]);

  const visual = useMemo(() => {
    const category = expense?.category || 'Other';
    return CATEGORY_VISUALS[category] || { emoji: '🧾', glow: COLORS.glowFallback };
  }, [expense?.category]);

  const receiptSource = useMemo(() => {
    if (!expense) {
      return '';
    }
    return String((expense as any).receiptImage || expense.receiptUrl || '');
  }, [expense]);

  const onPressDelete = useCallback(() => {
    if (!expense?.id) return;

    Alert.alert('Delete Expense', 'This will permanently delete this expense.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeleting(true);
            await deleteExpense(expense.id);
            showInfoToast('🗑️ Expense deleted');
            router.replace('/personal');
          } catch (err: any) {
            Alert.alert('Delete Failed', err?.response?.data?.message || 'Could not delete expense');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  }, [expense?.id, router]);

  const onPressEdit = useCallback(() => {
    if (!expense) return;

    router.push({
      pathname: '/personal/add',
      params: {
        mode: 'edit',
        expense: JSON.stringify(expense),
        id: expense.id,
        title: expense.description,
        amount: String(expense.amount),
        category: expense.category,
        paymentMethod: expense.paymentMethod,
        expenseDate: String(expense.expenseDate),
        recurring: expense.isRecurring ? '1' : '0',
        recurringType: expense.recurringType || '',
        note: expense.note || '',
        receiptUrl: String((expense as any).receiptImage || expense.receiptUrl || ''),
      },
    });
  }, [expense, router]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.85}>
            <Ionicons name="chevron-back" size={18} color={COLORS.textPrimary} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={styles.loadingText}>Loading expense details...</Text>
          </View>

          <View style={styles.skeletonHero} />
          <View style={styles.skeletonCard} />
          <View style={styles.skeletonButtonRow}>
            <View style={styles.skeletonButton} />
            <View style={styles.skeletonButton} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!expense) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.85}>
            <Ionicons name="chevron-back" size={18} color={COLORS.textPrimary} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.errorWrap}>
          <Text style={styles.errorTitle}>Could not open expense</Text>
          <Text style={styles.errorSub}>{error || 'Expense not found.'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadExpense} activeOpacity={0.88}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.85}>
          <Ionicons name="chevron-back" size={18} color={COLORS.textPrimary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}>
          <View style={[styles.heroGlow, { backgroundColor: visual.glow }]} />
          <Text style={styles.heroEmoji}>{visual.emoji}</Text>
          <Text style={styles.heroTitle}>{expense.description}</Text>
          <Text style={styles.heroAmount}>-{formatINR(expense.amount)}</Text>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>{`${visual.emoji} ${expense.category}`}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{formatDateFull(expense.expenseDate)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>{formatTime(expense.expenseDate)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment</Text>
            <Text style={styles.detailValue}>{getPaymentLabelWithIcon(expense.paymentMethod)}</Text>
          </View>
          {expense.note ? (
            <View style={[styles.detailRow, styles.detailRowNoBorder]}>
              <Text style={styles.detailLabel}>Note</Text>
              <Text style={styles.detailValue}>{expense.note}</Text>
            </View>
          ) : null}
        </View>

        {expense.isRecurring ? (
          <View style={styles.recurringCard}>
            <Text style={styles.recurringTitle}>{`🔄 Recurring · ${titleCase(expense.recurringType || 'monthly')}`}</Text>
            <Text style={styles.recurringNext}>{`Next: ${getNextOccurrence(expense.expenseDate, expense.recurringType)}`}</Text>
          </View>
        ) : null}

        {receiptSource ? (
          <View style={styles.receiptWrap}>
            <Text style={styles.receiptLabel}>📷 View Receipt</Text>
            <TouchableOpacity activeOpacity={0.86} onPress={() => setReceiptModalVisible(true)}>
              <Image source={{ uri: receiptSource }} style={styles.receiptImage} resizeMode="cover" />
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.editActionBtn} activeOpacity={0.86} onPress={onPressEdit}>
            <Text style={styles.editActionText}>✏️ Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.deleteActionBtn, deleting && styles.disabledActionBtn]}
            activeOpacity={0.86}
            onPress={onPressDelete}
            disabled={deleting}
          >
            <Text style={styles.deleteActionText}>{deleting ? 'Deleting...' : '🗑️ Delete'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={receiptModalVisible} animationType="fade" transparent onRequestClose={() => setReceiptModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setReceiptModalVisible(false)} activeOpacity={0.9}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Image source={{ uri: receiptSource }} style={styles.modalImage} resizeMode="contain" />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontFamily: 'DMSans_600SemiBold',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 14,
  },
  loaderWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
  },
  skeletonHero: {
    height: 190,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#151526',
  },
  skeletonCard: {
    height: 210,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#151526',
  },
  skeletonButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skeletonButton: {
    width: '48%',
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#151526',
  },
  heroWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  heroGlow: {
    position: 'absolute',
    top: 8,
    width: 78,
    height: 78,
    borderRadius: 39,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  heroTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    textAlign: 'center',
    fontFamily: 'Syne_700Bold',
    marginBottom: 6,
  },
  heroAmount: {
    color: COLORS.coral,
    fontSize: 32,
    textAlign: 'center',
    fontFamily: 'Syne_700Bold',
  },
  detailsCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  detailRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 10,
    gap: 10,
  },
  detailRowNoBorder: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: 'DMSans_500Medium',
    flexShrink: 0,
  },
  detailValue: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontFamily: 'DMSans_700Bold',
    textAlign: 'right',
    flex: 1,
  },
  recurringCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.amberBorder,
    backgroundColor: COLORS.amberBg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  recurringTitle: {
    color: '#FFD89A',
    fontSize: 13,
    fontFamily: 'DMSans_700Bold',
  },
  recurringNext: {
    color: '#F9D9A4',
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
  },
  receiptWrap: {
    gap: 8,
  },
  receiptLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: 'DMSans_600SemiBold',
  },
  receiptImage: {
    width: '100%',
    height: 150,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#11121A',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    gap: 10,
  },
  editActionBtn: {
    width: '48%',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.editBorder,
    backgroundColor: COLORS.editBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editActionText: {
    color: COLORS.editText,
    fontSize: 14,
    fontFamily: 'DMSans_700Bold',
  },
  deleteActionBtn: {
    width: '48%',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.deleteBorder,
    backgroundColor: COLORS.deleteBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteActionText: {
    color: COLORS.coral,
    fontSize: 14,
    fontFamily: 'DMSans_700Bold',
  },
  disabledActionBtn: {
    opacity: 0.6,
  },
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    gap: 10,
  },
  errorTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontFamily: 'Syne_700Bold',
    textAlign: 'center',
  },
  errorSub: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: 'DMSans_500Medium',
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 4,
    minWidth: 120,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124,92,252,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(124,92,252,0.35)',
  },
  retryText: {
    color: '#CFC2FF',
    fontSize: 13,
    fontFamily: 'DMSans_700Bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 56,
    right: 22,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  modalImage: {
    width: '100%',
    height: '80%',
  },
});
