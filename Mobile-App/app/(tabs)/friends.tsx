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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';

import { getFriendBalances } from '@/src/services/friends.service';
import { getPendingSettlements } from '@/src/services/settlements.service';
import { COLORS as ThemeColors } from '@/src/constants/theme';
import type { FriendBalanceItem } from '@/src/types/friends.types';
import FriendCard from '@/src/components/friends/FriendCard';

const COLORS = {
  bg: '#0F0F1A',
  card: '#14141F',
  border: 'rgba(255,255,255,0.06)',
  textPrimary: '#F0F0FF',
  textSecondary: '#8888AA',
  textMuted: '#55556A',
  accent: ThemeColors.primary,
  violetLight: '#9B7FFF',
  mint: '#00E5B0',
  coral: '#FF5F7E',
};

const currency = (value: number): string => `₹${Math.abs(Number(value || 0)).toLocaleString('en-IN')}`;

interface CountRow {
  pending: number;
  overdue: number;
}

export default function FriendsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [friends, setFriends] = useState<FriendBalanceItem[]>([]);
  const [countsByFriend, setCountsByFriend] = useState<Record<string, CountRow>>({});

  const loadBalances = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getFriendBalances();
      setFriends(data);

      const apiHasCounts = data.some(
        (item) => item.pendingCount !== undefined || item.overdueCount !== undefined
      );

      if (apiHasCounts) {
        const mapped = data.reduce<Record<string, CountRow>>((acc, item) => {
          const key = String(item.friendId || '');
          if (!key) return acc;
          acc[key] = {
            pending: Number(item.pendingCount || 0),
            overdue: Number(item.overdueCount || 0),
          };
          return acc;
        }, {});
        setCountsByFriend(mapped);
      } else {
        const pendingResponse = await getPendingSettlements();
        const settlements = Array.isArray(pendingResponse?.settlements) ? pendingResponse.settlements : [];

        const mapped = settlements.reduce<Record<string, CountRow>>((acc, item: any) => {
          const friendId = String(item?.friend?.id || '');
          if (!friendId) {
            return acc;
          }

          const prev = acc[friendId] || { pending: 0, overdue: 0 };
          prev.pending += 1;
          if (String(item?.status || '').toLowerCase() === 'overdue') {
            prev.overdue += 1;
          }
          acc[friendId] = prev;
          return acc;
        }, {});

        setCountsByFriend(mapped);
      }
    } catch (error) {
      console.error('Failed to fetch friend balances:', error);
      setFriends([]);
      setCountsByFriend({});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBalances();
    }, [loadBalances])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBalances();
  }, [loadBalances]);

  const summary = useMemo(() => {
    let totalYouOwe = 0;
    let totalYouGet = 0;

    friends.forEach((item) => {
      const value = Number(item.netBalance || 0);
      if (value < 0) {
        totalYouOwe += Math.abs(value);
      } else {
        totalYouGet += value;
      }
    });

    return {
      totalYouOwe,
      totalYouGet,
    };
  }, [friends]);

  const handleOpenFriend = useCallback(
    (friend: FriendBalanceItem) => {
      router.push({
        pathname: '/friends/[id]' as any,
        params: {
          id: friend.friendId,
          name: friend.name,
          netBalance: String(friend.netBalance || 0),
        },
      });
    },
    [router]
  );

  const handleQuickSettle = useCallback(
    (friend: FriendBalanceItem) => {
      const amount = Math.abs(Number(friend.netBalance || 0));
      if (amount <= 0) {
        return;
      }

      router.push({
        pathname: '/friends/settle' as any,
        params: {
          friendId: friend.friendId,
          friendName: friend.name,
          amount: String(amount),
        },
      });
    },
    [router]
  );

  const renderRightActions = (friend: FriendBalanceItem) => {
    if (friend.netBalance >= 0) {
      return (
        <View style={styles.swipeWrap}>
          <TouchableOpacity style={[styles.swipeAction, styles.swipeView]} onPress={() => handleOpenFriend(friend)}>
            <Ionicons name="eye-outline" size={18} color="#101020" />
            <Text style={styles.swipeTextDark}>View</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.swipeWrap}>
        <TouchableOpacity style={[styles.swipeAction, styles.swipeSettle]} onPress={() => handleQuickSettle(friend)}>
          <Ionicons name="cash-outline" size={18} color="#FFFFFF" />
          <Text style={styles.swipeTextLight}>Settle</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Friends</Text>
        <TouchableOpacity
          style={styles.settlementsPill}
          onPress={() => router.push('/settlements' as any)}
          activeOpacity={0.86}
        >
          <Text style={styles.settlementsPillText}>Settlements →</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 22 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
        >
          {friends.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="people-outline" size={34} color={COLORS.textSecondary} />
              <Text style={styles.emptyTitle}>No friend balances yet</Text>
              <Text style={styles.emptySub}>Balances will appear once you split expenses in groups.</Text>
            </View>
          ) : (
            friends.map((friend) => {
              const friendCounts = countsByFriend[String(friend.friendId || '')] || { pending: 0, overdue: 0 };
              return (
                <Swipeable
                  key={friend.friendId}
                  renderRightActions={() => renderRightActions(friend)}
                  overshootRight={false}
                  rightThreshold={32}
                >
                  <FriendCard
                    friend={friend}
                    pendingCount={friendCounts.pending}
                    overdueCount={friendCounts.overdue}
                    onPress={() => handleOpenFriend(friend)}
                  />
                </Swipeable>
              );
            })
          )}

          <View style={styles.bottomSummaryCard}>
            <Text style={styles.bottomSummaryLabel}>📊 Across all friends</Text>
            <View style={styles.bottomSummaryValuesRow}>
              <Text style={styles.bottomSummaryOwe}>You owe {currency(summary.totalYouOwe)}</Text>
              <Text style={styles.bottomSummaryGet}>You get {currency(summary.totalYouGet)}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/settlements' as any)} activeOpacity={0.86}>
              <Text style={styles.bottomSummaryLink}>View All Settlements →</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontFamily: 'Syne_700Bold',
  },
  settlementsPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(124,92,252,0.3)',
    backgroundColor: 'rgba(124,92,252,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  settlementsPillText: {
    color: '#9B7FFF',
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 12,
  },
  emptyCard: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 10,
    color: COLORS.textPrimary,
    fontSize: 16,
    fontFamily: 'DMSans_700Bold',
  },
  emptySub: {
    marginTop: 4,
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    fontFamily: 'DMSans_500Medium',
  },
  bottomSummaryCard: {
    backgroundColor: '#14141F',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  bottomSummaryLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
    marginBottom: 8,
  },
  bottomSummaryValuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  bottomSummaryOwe: {
    color: COLORS.coral,
    fontSize: 13,
    fontFamily: 'DMSans_700Bold',
    flex: 1,
  },
  bottomSummaryGet: {
    color: COLORS.mint,
    fontSize: 13,
    fontFamily: 'DMSans_700Bold',
    flex: 1,
    textAlign: 'right',
  },
  bottomSummaryLink: {
    color: COLORS.violetLight,
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
  },
  swipeWrap: {
    justifyContent: 'center',
    marginLeft: 10,
    marginBottom: 10,
    marginTop: 2,
  },
  swipeAction: {
    width: 88,
    height: 62,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  swipeSettle: {
    backgroundColor: 'rgba(255,95,126,0.9)',
    borderColor: 'rgba(255,95,126,1)',
  },
  swipeView: {
    backgroundColor: 'rgba(0,229,176,0.9)',
    borderColor: 'rgba(0,229,176,1)',
  },
  swipeTextLight: {
    marginTop: 4,
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
  },
  swipeTextDark: {
    marginTop: 4,
    color: '#101020',
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
  },
});
