import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSettlements } from '@/src/hooks/useSettlements';
import { getSettlementHistory } from '@/src/services/settlements.service';
import { Settlement } from '@/src/types/settlement.types';

interface HistorySettlement {
  _id?: string;
  id?: string;
  amount: number;
  createdAt: string;
  note?: string;
  group?: {
    _id?: string;
    id?: string;
    name?: string;
    emoji?: string;
  };
  fromUser?: {
    _id?: string;
    id?: string;
    name?: string;
  };
  toUser?: {
    _id?: string;
    id?: string;
    name?: string;
  };
}

const formatAmount = (value: number): string => `₹${Math.abs(Number(value || 0)).toFixed(2)}`;

export default function FriendDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; name?: string }>();
  const friendId = String(params.id || '');
  const friendNameFromRoute = String(params.name || 'Friend');

  const {
    settlements,
    fetchSettlements,
    loading,
    remindFriend,
  } = useSettlements();

  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyItems, setHistoryItems] = useState<HistorySettlement[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const friendSettlements = useMemo(() => {
    return settlements.filter(
      (settlement) => settlement.friend.id === friendId && settlement.status !== 'completed'
    );
  }, [settlements, friendId]);

  const summary = useMemo(() => {
    return friendSettlements.reduce(
      (acc, item) => {
        const value = Number(item.remaining || item.amount || 0);
        if (item.direction === 'you_owe') {
          acc.youOwe += value;
        } else {
          acc.youGet += value;
        }
        return acc;
      },
      { youOwe: 0, youGet: 0 }
    );
  }, [friendSettlements]);

  const friendDisplayName = useMemo(() => {
    return friendSettlements[0]?.friend?.name || friendNameFromRoute || 'Friend';
  }, [friendSettlements, friendNameFromRoute]);

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await getSettlementHistory({ friendId, limit: 50, page: 1 });
      setHistoryItems(Array.isArray(response?.settlements) ? (response.settlements as HistorySettlement[]) : []);
    } catch (error) {
      console.error('Failed to fetch friend settlement history:', error);
      setHistoryItems([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [friendId]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([fetchSettlements(), fetchHistory()]);
    } finally {
      setRefreshing(false);
    }
  };

  const handlePay = (settlement: Settlement) => {
    router.push({
      pathname: '/friends/settle' as any,
      params: {
        settlementId: settlement.id,
        friendId: settlement.friend.id,
        friendName: settlement.friend.name,
        amount: String(settlement.remaining || settlement.amount),
        direction: settlement.direction,
        groupId: settlement.group?.id || '',
      },
    });
  };

  const handleRemind = async (settlement: Settlement) => {
    const result = await remindFriend(settlement.id);
    if (!result?.whatsappUrl) {
      Alert.alert('Unable to send reminder', 'No reminder link could be generated.');
      return;
    }

    const canOpen = await Linking.canOpenURL(result.whatsappUrl);
    if (!canOpen) {
      Alert.alert('WhatsApp not available', 'Please install WhatsApp to send reminder.');
      return;
    }

    await Linking.openURL(result.whatsappUrl);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.85}>
          <Ionicons name='chevron-back' size={20} color='#F0F0FF' />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{friendDisplayName}</Text>
        <View style={styles.backBtnPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor='#7C5CFC' />}
      >
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Balance Summary</Text>
          <View style={styles.summaryRow}>
            <View style={[styles.summaryBox, styles.oweBox]}>
              <Text style={styles.summaryLabel}>You Owe</Text>
              <Text style={[styles.summaryAmount, styles.oweText]}>{formatAmount(summary.youOwe)}</Text>
            </View>
            <View style={[styles.summaryBox, styles.getBox]}>
              <Text style={styles.summaryLabel}>You Get</Text>
              <Text style={[styles.summaryAmount, styles.getText]}>{formatAmount(summary.youGet)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.pendingHeaderRow}>
            <Text style={styles.sectionTitle}>Pending Settlements</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{friendSettlements.length}</Text>
            </View>
          </View>

          {friendSettlements.length === 0 ? (
            <View style={styles.allSettledRow}>
              <Ionicons name='checkmark-circle' size={18} color='#00E5B0' />
              <Text style={styles.allSettledText}>✅ All settled with this friend</Text>
            </View>
          ) : (
            friendSettlements.map((item) => (
              <View key={item.id} style={styles.pendingCompactRow}>
                <View style={styles.pendingLeft}>
                  <Text style={styles.pendingGroupName} numberOfLines={1}>
                    {item.group?.emoji ? `${item.group.emoji} ` : ''}
                    {item.group?.name || 'Personal'}
                  </Text>
                </View>

                <Text style={styles.pendingAmount}>{formatAmount(item.remaining || item.amount)}</Text>

                <TouchableOpacity
                  style={[
                    styles.pendingActionBtn,
                    item.direction === 'you_owe' ? styles.payBtn : styles.remindBtn,
                  ]}
                  onPress={() => (item.direction === 'you_owe' ? handlePay(item) : handleRemind(item))}
                  activeOpacity={0.88}
                >
                  <Text style={styles.pendingActionText}>{item.direction === 'you_owe' ? 'Pay' : 'Remind'}</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Transaction History</Text>

          {(loading || historyLoading) ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size='small' color='#7C5CFC' />
            </View>
          ) : historyItems.length === 0 ? (
            <Text style={styles.emptyText}>No completed settlements found with this friend.</Text>
          ) : (
            historyItems.map((item) => (
              <View key={item.id || item._id || item.createdAt} style={styles.historyRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyGroupText} numberOfLines={1}>
                    {item.group?.emoji ? `${item.group.emoji} ` : ''}
                    {item.group?.name || 'Direct'}
                  </Text>
                  <Text style={styles.historyDateText}>
                    {new Date(item.createdAt).toLocaleDateString('en-IN')}
                  </Text>
                </View>
                <Text style={styles.historyAmountText}>{formatAmount(item.amount)}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A2B',
  },
  backBtnPlaceholder: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    color: '#F0F0FF',
    fontSize: 19,
    fontFamily: 'Syne_700Bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 28,
  },
  sectionCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    backgroundColor: '#14141F',
    padding: 12,
  },
  sectionTitle: {
    color: '#F0F0FF',
    fontSize: 15,
    fontFamily: 'DMSans_700Bold',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  oweBox: {
    backgroundColor: 'rgba(255,95,126,0.08)',
    borderColor: 'rgba(255,95,126,0.25)',
  },
  getBox: {
    backgroundColor: 'rgba(0,229,176,0.08)',
    borderColor: 'rgba(0,229,176,0.25)',
  },
  summaryLabel: {
    color: '#A7A7C2',
    fontSize: 11,
    fontFamily: 'DMSans_500Medium',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 16,
    fontFamily: 'Syne_700Bold',
  },
  oweText: {
    color: '#FF5F7E',
  },
  getText: {
    color: '#00E5B0',
  },
  pendingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(124,92,252,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(124,92,252,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  countBadgeText: {
    color: '#9B7FFF',
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
  },
  allSettledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  allSettledText: {
    color: '#00E5B0',
    fontSize: 13,
    fontFamily: 'DMSans_600SemiBold',
  },
  pendingCompactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#1A1A2B',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 8,
    gap: 8,
  },
  pendingLeft: {
    flex: 1,
  },
  pendingGroupName: {
    color: '#DBDBF1',
    fontSize: 13,
    fontFamily: 'DMSans_600SemiBold',
  },
  pendingAmount: {
    color: '#F0F0FF',
    fontSize: 13,
    fontFamily: 'Syne_700Bold',
  },
  pendingActionBtn: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
  },
  payBtn: {
    backgroundColor: 'rgba(124,92,252,0.18)',
    borderColor: 'rgba(124,92,252,0.35)',
  },
  remindBtn: {
    backgroundColor: 'rgba(0,229,176,0.14)',
    borderColor: 'rgba(0,229,176,0.30)',
  },
  pendingActionText: {
    color: '#F0F0FF',
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
  },
  loadingWrap: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  emptyText: {
    color: '#A7A7C2',
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 10,
  },
  historyGroupText: {
    color: '#DBDBF1',
    fontSize: 13,
    fontFamily: 'DMSans_600SemiBold',
  },
  historyDateText: {
    color: '#8D8DA8',
    fontSize: 11,
    fontFamily: 'DMSans_500Medium',
    marginTop: 2,
  },
  historyAmountText: {
    color: '#F0F0FF',
    fontSize: 13,
    fontFamily: 'Syne_700Bold',
    marginLeft: 8,
  },
});
