import React, { useEffect, useMemo, useState } from 'react';
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
import { apiService } from '@/src/services/api';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { calculateSplit, Participant, SplitResult } from '@/src/utils/splitCalculator';
import { showInfoToast } from '@/src/utils/toast';
import { useBackNavigation } from '@/src/hooks/useBackNavigation';

interface ExpenseDetail {
  _id: string;
  description: string;
  amount: number;
  splitType?: 'equally' | 'unequally' | 'percentage' | 'shares';
  splitBetween?: Array<{ userId?: string; userName?: string } | string>;
  splitAmounts?: Record<string, number>;
  splitPercentages?: Record<string, number>;
  splitShares?: Record<string, number>;
  paidBy: {
    _id: string;
    name: string;
  };
  category?: string;
  date: string;
  notes?: string;
  receiptUrl?: string;
  paymentMethod?: 'cash' | 'upi' | 'card';
}

const CATEGORY_EMOJI: Record<string, string> = {
  Stay: '🏨',
  Accommodation: '🏨',
  Food: '🍔',
  Transport: '🚕',
  Fun: '🎬',
  Entertainment: '🎬',
  Shopping: '🛍️',
  Utilities: '⚡',
  Gifts: '🎁',
  Gaming: '🎮',
  Travel: '✈️',
  Health: '💊',
  Education: '📚',
  Other: '➕',
};

const paymentMethodLabel = (method?: string) => {
  switch (method) {
    case 'upi':
      return 'UPI';
    case 'card':
      return 'Card';
    default:
      return 'Cash';
  }
};

const normalizeId = (value: unknown): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Record<string, any>;
    return String(obj._id || obj.id || obj.userId || obj.$oid || '').trim();
  }
  return String(value);
};

export default function ExpenseDetailScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const {
    id: expenseId,
    groupId,
    expenseData,
    currentUserId,
    isCreator,
  } = useLocalSearchParams();
  const handleBack = useBackNavigation('/(tabs)/groups' as any, () => {
    const resolvedGroupId = String(groupId || '').trim();
    return resolvedGroupId ? (`/group/${resolvedGroupId}` as any) : ('/(tabs)/groups' as any);
  }, { alwaysUseFallback: true });

  const [loading, setLoading] = useState(true);
  const [expense, setExpense] = useState<ExpenseDetail | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  const canManage = useMemo(() => {
    if (!expense) return false;
    const me = String(currentUserId || '');
    return me && (me === normalizeId(expense.paidBy?._id) || String(isCreator) === '1');
  }, [expense, currentUserId, isCreator]);

  const splitRows: SplitResult[] = useMemo(() => {
    if (!expense || !expense.amount) return [];

    const members = (expense.splitBetween || []).map((entry) => {
      const memberObj = typeof entry === 'string' ? null : entry;
      const userId = typeof entry === 'string' ? entry : normalizeId(memberObj?.userId);
      const userName = memberObj?.userName || 'Member';
      let value = 0;

      if (expense.splitType === 'percentage') {
        value = Number(expense.splitPercentages?.[userId] || 0);
      } else if (expense.splitType === 'unequally') {
        value = Number(expense.splitAmounts?.[userId] || 0);
      } else if (expense.splitType === 'shares') {
        value = Number(expense.splitShares?.[userId] || 1);
      }

      return { userId, userName, value } as Participant;
    });

    if (!members.length) return [];

    try {
      return calculateSplit(expense.splitType || 'equally', Number(expense.amount), members);
    } catch {
      return [];
    }
  }, [expense]);

  useEffect(() => {
    const loadExpense = async () => {
      try {
        setLoading(true);
        if (typeof expenseData === 'string') {
          const parsed = JSON.parse(decodeURIComponent(expenseData));
          setExpense(parsed);
          return;
        }

        const response = await apiService.groupExpenses.getAll(String(groupId || ''), {
          search: String(expenseId || ''),
        });

        const data = response?.data?.data || response?.data || [];
        const found = Array.isArray(data)
          ? data.find((item: any) => normalizeId(item._id || item.id) === String(expenseId || ''))
          : null;

        if (!found) {
          Alert.alert('Not Found', 'Expense could not be loaded.');
          handleBack();
          return;
        }

        setExpense(found);
      } catch {
        Alert.alert('Error', 'Failed to load expense details.');
        handleBack();
      } finally {
        setLoading(false);
      }
    };

    loadExpense();
  }, [expenseData, expenseId, groupId, router]);

  const handleDelete = () => {
    Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiService.groups.removeExpense(String(groupId || ''), String(expenseId || ''));
            showInfoToast('🗑️ Expense deleted');
            Alert.alert('Deleted', 'Expense deleted successfully.', [{ text: 'OK', onPress: handleBack }]);
          } catch {
            Alert.alert('Error', 'Failed to delete expense.');
          }
        },
      },
    ]);
  };

  const handleEdit = () => {
    if (!expense) return;
    const payload = encodeURIComponent(JSON.stringify(expense));
    router.push(`/group/add-expense?id=${groupId}&expenseId=${expense._id}&expenseData=${payload}` as any);
  };

  if (loading || !expense) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.violet} />
        </View>
      </SafeAreaView>
    );
  }

  const category = expense.category || 'Other';
  const emoji = CATEGORY_EMOJI[category] || '➕';
  const dateObj = new Date(expense.date);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { borderBottomColor: colors.elevated }]}> 
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Expense Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.topCard, { backgroundColor: colors.card, borderColor: colors.elevated }]}> 
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={[styles.expenseTitle, { color: colors.text }]}>{expense.description || 'Untitled Expense'}</Text>
          <Text style={styles.expenseAmount}>₹{Number(expense.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.elevated }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Details</Text>

          <View style={styles.detailRow}>
            <View style={[styles.avatar, { backgroundColor: colors.violet }]}>
              <Text style={styles.avatarText}>{expense.paidBy?.name?.charAt(0).toUpperCase() || 'U'}</Text>
            </View>
            <Text style={[styles.detailText, { color: colors.text }]}>Paid by {expense.paidBy?.name || 'Unknown'}</Text>
          </View>

          <View style={styles.detailMetaRow}>
            <Text style={[styles.metaText, { color: colors.icon }]}>
              {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>

          <View style={styles.badgesRow}>
            <View style={[styles.badge, { backgroundColor: `${colors.violet}20` }]}>
              <Text style={[styles.badgeText, { color: colors.violet }]}>{paymentMethodLabel(expense.paymentMethod)}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: `${colors.mint}20` }]}>
              <Text style={[styles.badgeText, { color: colors.mint }]}>{category}</Text>
            </View>
          </View>

          {expense.notes ? (
            <Text style={[styles.notesText, { color: colors.icon }]}>{expense.notes}</Text>
          ) : null}
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.elevated }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Split</Text>
          {splitRows.map((row) => {
            const settled = normalizeId(row.userId) === normalizeId(expense.paidBy?._id) || Number(row.amount) <= 0;
            return (
              <View key={row.userId} style={[styles.splitRow, { borderBottomColor: colors.elevated }]}> 
                <View style={styles.splitLeft}>
                  <View style={[styles.avatarSmall, { backgroundColor: colors.elevated }]}>
                    <Text style={[styles.avatarSmallText, { color: colors.text }]}>{row.userName.charAt(0).toUpperCase()}</Text>
                  </View>
                  <Text style={[styles.splitName, { color: colors.text }]}>{normalizeId(row.userId) === normalizeId(currentUserId) ? 'You' : row.userName}</Text>
                </View>

                <View style={styles.splitRight}>
                  <Text style={[styles.splitAmount, { color: colors.mint }]}>₹{row.amount.toFixed(2)}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: settled ? 'rgba(34, 197, 94, 0.18)' : 'rgba(239, 68, 68, 0.18)' }]}>
                    <Text style={[styles.statusText, { color: settled ? '#22C55E' : '#EF4444' }]}>{settled ? 'Settled' : 'Pending'}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {expense.receiptUrl ? (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.elevated }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Receipt</Text>
            <TouchableOpacity activeOpacity={0.85} onPress={() => setPreviewVisible(true)}>
              <Image source={{ uri: expense.receiptUrl }} style={styles.receiptThumb} />
            </TouchableOpacity>
          </View>
        ) : null}

        {canManage ? (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.elevated }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Actions</Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: `${colors.violet}20`, borderColor: colors.violet }]} onPress={handleEdit}>
                <Ionicons name="create-outline" size={16} color={colors.violet} />
                <Text style={[styles.actionText, { color: colors.violet }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: '#EF4444' }]} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                <Text style={[styles.actionText, { color: '#EF4444' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <Modal visible={previewVisible} transparent animationType="fade" onRequestClose={() => setPreviewVisible(false)}>
        <View style={styles.previewBackdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setPreviewVisible(false)} />
          <Image source={{ uri: expense.receiptUrl }} style={styles.fullPreviewImage} resizeMode="contain" />
          <TouchableOpacity style={styles.closePreviewBtn} onPress={() => setPreviewVisible(false)}>
            <Ionicons name="close-circle" size={30} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'DMSans_700Bold',
  },
  content: {
    padding: 16,
    paddingBottom: 28,
    gap: 12,
  },
  topCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 44,
    marginBottom: 8,
  },
  expenseTitle: {
    fontSize: 18,
    fontFamily: 'DMSans_700Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  expenseAmount: {
    fontSize: 36,
    color: '#8B5CF6',
    fontFamily: 'Syne_700Bold',
    fontWeight: '700',
  },
  section: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'DMSans_700Bold',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'DMSans_700Bold',
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
  },
  detailMetaRow: {
    marginTop: 10,
  },
  metaText: {
    fontSize: 12,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
  },
  notesText: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 18,
  },
  splitRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  splitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarSmallText: {
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
  },
  splitName: {
    fontSize: 13,
  },
  splitRight: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  splitAmount: {
    fontSize: 14,
    fontFamily: 'DMSans_700Bold',
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'DMSans_700Bold',
  },
  receiptThumb: {
    width: '100%',
    height: 170,
    borderRadius: 12,
    backgroundColor: '#111827',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontFamily: 'DMSans_700Bold',
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  fullPreviewImage: {
    width: '100%',
    height: '82%',
  },
  closePreviewBtn: {
    position: 'absolute',
    top: 44,
    right: 18,
  },
});
