import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { getFriendHistory } from '@/src/services/friends.service';
import type { FriendHistoryItem } from '@/src/types/friends.types';
import { useBackNavigation } from '@/src/hooks/useBackNavigation';

const COLORS = {
  bg: '#0F0F1A',
  card: '#17172A',
  border: 'rgba(255,255,255,0.09)',
  textPrimary: '#F3F3FF',
  textSecondary: '#AAAAC4',
  mint: '#00E5B0',
  coral: '#FF5F7E',
  violet: '#7C5CFC',
};

const currency = (value: number): string => `₹${Math.abs(Number(value || 0)).toLocaleString('en-IN')}`;

const formatDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function FriendDetailScreen() {
  const router = useRouter();
  const handleBack = useBackNavigation('/(tabs)/friends' as any, undefined, { alwaysUseFallback: true });
  const params = useLocalSearchParams<{ id?: string; name?: string; netBalance?: string }>();

  const friendId = String(params.id || '');
  const friendName = String(params.name || 'Friend');
  const netBalance = Number(params.netBalance || 0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [historyItems, setHistoryItems] = useState<FriendHistoryItem[]>([]);

  const loadHistory = useCallback(async () => {
    if (!friendId) {
      setHistoryItems([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getFriendHistory(friendId);
      setHistoryItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch friend history:', error);
      setHistoryItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [friendId]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadHistory();
  }, [loadHistory]);

  const netLabel = useMemo(() => (netBalance >= 0 ? 'You get' : 'You owe'), [netBalance]);
  const netColor = useMemo(() => (netBalance >= 0 ? COLORS.mint : COLORS.coral), [netBalance]);

  const handleSettle = () => {
    const amount = Math.abs(netBalance);
    if (!amount && netBalance < 0) {
      return;
    }

    if (netBalance >= 0) {
      router.push({
        pathname: '/settlements' as any,
        params: {
          friendId,
          direction: 'they_owe',
        },
      });
      return;
    }

    router.push({
      pathname: '/friends/settle' as any,
      params: {
        friendId,
        friendName,
        amount: String(amount),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.85}>
          <Ionicons name="chevron-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{friendName}</Text>
        <View style={styles.backPlaceholder} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.violet} />}
      >
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Net balance</Text>
          <Text style={[styles.balanceValue, { color: netColor }]}>
            {netLabel} {currency(netBalance)}
          </Text>

          <TouchableOpacity style={styles.settleBtn} onPress={handleSettle} activeOpacity={0.88}>
            <Ionicons name={netBalance < 0 ? 'cash-outline' : 'receipt-outline'} size={16} color="#FFFFFF" />
            <Text style={styles.settleBtnText}>{netBalance < 0 ? 'Settle' : 'View Settlements'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>History</Text>

          {loading ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="small" color={COLORS.violet} />
            </View>
          ) : historyItems.length === 0 ? (
            <Text style={styles.emptyText}>No transactions with this friend yet.</Text>
          ) : (
            historyItems.map((item, index) => {
              const title = item.description || (item.type === 'settlement' ? 'Settlement' : 'Expense');
              return (
                <View key={`${item.type}-${item.date}-${index}`} style={styles.historyRow}>
                  <View style={styles.historyLeft}>
                    <Text style={styles.historyItemTitle}>{title}</Text>
                    <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
                  </View>
                  <Text style={styles.historyAmount}>{currency(item.amount)}</Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
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
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPlaceholder: {
    width: 34,
    height: 34,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
    color: COLORS.textPrimary,
    fontSize: 24,
    fontFamily: 'Syne_700Bold',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 24,
  },
  balanceCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(124,92,252,0.35)',
    backgroundColor: COLORS.card,
    padding: 14,
  },
  balanceLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: 'DMSans_500Medium',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 24,
    fontFamily: 'Syne_700Bold',
  },
  settleBtn: {
    marginTop: 12,
    borderRadius: 10,
    backgroundColor: COLORS.coral,
    borderWidth: 1,
    borderColor: COLORS.coral,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  settleBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'DMSans_700Bold',
  },
  historyCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    padding: 12,
  },
  historyTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontFamily: 'DMSans_700Bold',
    marginBottom: 8,
  },
  loaderWrap: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: 'DMSans_500Medium',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 10,
    gap: 10,
  },
  historyLeft: {
    flex: 1,
  },
  historyItemTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
  },
  historyDate: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'DMSans_500Medium',
  },
  historyAmount: {
    color: '#EDEAFF',
    fontSize: 14,
    fontFamily: 'Syne_700Bold',
  },
});
