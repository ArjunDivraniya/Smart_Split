import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { apiService } from '@/src/services/api';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BalanceRow } from '@/components/BalanceRow';
import { SettlementModal } from '@/components/SettlementModal';
import { useSettlements } from '@/src/hooks/useSettlements';
import { Settlement as PendingSettlement } from '@/src/types/settlement.types';
import { showInfoToast } from '@/src/utils/toast';

const toSafeKey = (value: unknown, fallback: string): string => {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === 'object') {
    const objectValue = value as Record<string, any>;
    const nestedId = objectValue._id || objectValue.id || objectValue.$oid;
    return nestedId ? String(nestedId).trim() : fallback;
  }

  const normalized = String(value).trim();
  return normalized || fallback;
};

interface BalancesTabProps {
  groupId: string;
  currentUserId: string;
  currentUserName: string;
}

interface Balance {
  userId: string;
  userName: string;
  netBalance: number;
  paid: number;
  owedShare: number;
}

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

interface SettlementHistoryItem {
  id: string;
  fromUserName: string;
  toUserName: string;
  amount: number;
  note?: string;
  createdAt?: string;
}

interface SettlementModalState {
  visible: boolean;
  fromUser: { id: string; name: string };
  toUser: { id: string; name: string };
  amount: number;
}

export const BalancesTab: React.FC<BalancesTabProps> = ({
  groupId,
  currentUserId,
  currentUserName,
}) => {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const { settlements: pendingSettlementsData, remindFriend } = useSettlements();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [settlementHistory, setSettlementHistory] = useState<SettlementHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalState, setModalState] = useState<SettlementModalState>({
    visible: false,
    fromUser: { id: '', name: '' },
    toUser: { id: '', name: '' },
    amount: 0,
  });

  useEffect(() => {
    if (groupId) {
      setLoading(true);
      Promise.all([fetchBalances(), fetchSettlements()]);
    }
  }, [groupId]);

  useFocusEffect(
    useCallback(() => {
      if (groupId) {
        fetchBalances();
        fetchSettlements();
      }
    }, [groupId])
  );

  const fetchBalances = async () => {
    try {
      setLoading(true);
      const response = await apiService.groupExpenses.getBalances(groupId);
      const balancesData = response?.data?.data || response?.data || [];
      
      const transformedBalances = (Array.isArray(balancesData) ? balancesData : []).map((item: any) => ({
        userId: item.userId || '',
        userName: item.user || item.userName || 'Unknown',
        netBalance: Number(item.netBalance || 0),
        paid: Number(item.paid || 0),
        owedShare: Number(item.owedShare || 0),
      }));
      
      setBalances(transformedBalances);
    } catch (error) {
      console.error('Error fetching balances:', error);
      Alert.alert('Error', 'Failed to load balances');
      setBalances([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSettlements = async () => {
    try {
      const response = await apiService.groups.getSettlements(groupId);
      const data = response?.data?.data || response?.data || {};
      const rawOptimized = Array.isArray(data.optimizedSettlements)
        ? data.optimizedSettlements
        : Array.isArray(data.optimized)
        ? data.optimized
        : [];

      const normalizedOptimized: Settlement[] = rawOptimized
        .map((item: any) => ({
          from: String(item.from || item.fromUserId || item.fromUser || ''),
          to: String(item.to || item.toUserId || item.toUser || ''),
          amount: Number(item.amount || 0),
        }))
        .filter((item: Settlement) => Boolean(item.from) && Boolean(item.to) && item.amount > 0);

      const rawHistory = Array.isArray(data.settlements)
        ? data.settlements
        : Array.isArray(data.history)
        ? data.history
        : [];

      const normalizedHistory: SettlementHistoryItem[] = rawHistory.map((item: any, index: number) => ({
        id: toSafeKey(item.id || item._id, `history-${index}-${item.createdAt || Date.now()}`),
        fromUserName: item.fromUserName || item.fromUser?.name || 'Unknown',
        toUserName: item.toUserName || item.toUser?.name || 'Unknown',
        amount: Number(item.amount || 0),
        note: item.note || '',
        createdAt: item.createdAt,
      }));

      setSettlements(normalizedOptimized);
      setSettlementHistory(normalizedHistory);
    } catch (error) {
      console.error('Error fetching settlements:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBalances();
    fetchSettlements();
  };

  const handleSettle = (balance: Balance) => {
    const isDebtor = balance.netBalance < 0;
    const amount = Math.abs(balance.netBalance);

    if (isDebtor) {
      setModalState({
        visible: true,
        fromUser: { id: currentUserId, name: currentUserName },
        toUser: { id: balance.userId, name: balance.userName },
        amount,
      });
    } else {
      setModalState({
        visible: true,
        fromUser: { id: balance.userId, name: balance.userName },
        toUser: { id: currentUserId, name: currentUserName },
        amount,
      });
    }
  };

  const handleSettleFromOptimized = (settlement: Settlement) => {
    const fromBalance = balances.find((b) => b.userId === settlement.from);
    const toBalance = balances.find((b) => b.userId === settlement.to);

    if (!fromBalance || !toBalance) return;

    setModalState({
      visible: true,
      fromUser: { id: fromBalance.userId, name: fromBalance.userName },
      toUser: { id: toBalance.userId, name: toBalance.userName },
      amount: settlement.amount,
    });
  };

  const closeModal = () => {
    setModalState({
      visible: false,
      fromUser: { id: '', name: '' },
      toUser: { id: '', name: '' },
      amount: 0,
    });
  };

  const handleSettlementSuccess = () => {
    fetchBalances();
    fetchSettlements();
  };

  const groupPendingSettlements = React.useMemo(() => {
    return pendingSettlementsData.filter(
      (item) => item.group?.id === groupId && item.status !== 'completed'
    );
  }, [pendingSettlementsData, groupId]);

  const handlePendingPay = (item: PendingSettlement) => {
    const amount = Number(item.remaining || item.amount || 0);
    if (amount <= 0) {
      return;
    }

    setModalState({
      visible: true,
      fromUser: { id: currentUserId, name: currentUserName },
      toUser: { id: item.friend.id, name: item.friend.name },
      amount,
    });
  };

  const handlePendingRemind = async (item: PendingSettlement) => {
    const result = await remindFriend(item.id);
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
    showInfoToast('📱 Reminder sent via WhatsApp');
  };

  const renderPendingSettlementsCompact = () => {
    if (groupPendingSettlements.length === 0) {
      return null;
    }

    return (
      <View style={[styles.pendingSection, { backgroundColor: `${colors.amber}08`, borderRadius: 16, padding: 12, marginHorizontal: 16 }]}>
        <View style={styles.sectionHeaderCompact}>
          <Ionicons name="hourglass" size={18} color={colors.amber} />
          <Text style={[styles.sectionTitleSmall, { color: colors.text }]}>Pending Settlements</Text>
        </View>

        {groupPendingSettlements.map((item) => {
          const isYouOwe = item.direction === 'you_owe';

          return (
            <View
              key={item.id}
              style={[styles.pendingRow, { backgroundColor: colors.elevated, borderColor: `${colors.violet}20` }]}
            >
              <View style={styles.pendingLeftCol}>
                <View style={[styles.directionDot, { backgroundColor: isYouOwe ? colors.coral : colors.mint }]} />
                <Text style={[styles.pendingFriendName, { color: colors.text }]} numberOfLines={1}>
                  {item.friend.name}
                </Text>
              </View>

              <Text style={[styles.pendingAmount, { color: colors.text }]}>
                ₹{Number(item.remaining || item.amount || 0).toLocaleString('en-IN')}
              </Text>

              <TouchableOpacity
                style={[styles.pendingActionBtn, { backgroundColor: isYouOwe ? `${colors.coral}15` : `${colors.violet}15`, borderColor: isYouOwe ? `${colors.coral}30` : `${colors.violet}30` }]}
                onPress={() => (isYouOwe ? handlePendingPay(item) : handlePendingRemind(item))}
                activeOpacity={0.7}
              >
                <Text style={[styles.pendingActionText, { color: isYouOwe ? colors.coral : colors.violet }]}>
                  {isYouOwe ? 'Pay' : 'Remind'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}

        <TouchableOpacity
          style={[styles.pendingViewAllBtn, { backgroundColor: `${colors.violet}15`, borderColor: `${colors.violet}30` }]}
          onPress={() => router.push({ pathname: '/settlements' as any, params: { groupId } })}
          activeOpacity={0.8}
        >
          <Text style={[styles.pendingViewAllText, { color: colors.violet }]}>View All Settlements →</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSummaryCard = () => {
    const yourBalance = balances.find((b) => b.userId === currentUserId);
    const yourNet = Number(yourBalance?.netBalance || 0);

    const lentAmount = Math.max(yourNet, 0);
    const owedAmount = Math.max(-yourNet, 0);

    const lentToCount = settlements.filter((s) => s.to === currentUserId).length;
    const owedToCount = settlements.filter((s) => s.from === currentUserId).length;

    return (
      <View style={[styles.summaryCard, { backgroundColor: colors.elevated, borderColor: `${colors.violet}20` }]}> 
        <View style={styles.summaryHeader}>
          <View style={[styles.summaryIconBox, { backgroundColor: `${colors.violet}15` }]}>
            <Ionicons name="wallet" size={20} color={colors.violet} />
          </View>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Group Balance</Text>
        </View>
        
        <View style={styles.summaryContent}>
          <Text style={[yourNet >= 0 ? styles.positiveAmount : styles.negativeAmount, { color: colors.text }]}>
            ₹{Math.abs(yourNet).toLocaleString('en-IN')}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.icon }]}>
            {yourNet > 0 ? 'Total to receive' : yourNet < 0 ? 'Total you owe' : 'Group is settled'}
          </Text>

          <View style={[styles.summaryStatsRow, { borderTopColor: `${colors.violet}10` }]}> 
            <View style={styles.summaryStatItem}>
              <Text style={[styles.statSubValue, { color: colors.mint }]}>₹{lentAmount.toLocaleString('en-IN')}</Text>
              <Text style={[styles.statSubLabel, { color: colors.icon }]}>Lent ({lentToCount})</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: `${colors.violet}10` }]} />
            <View style={styles.summaryStatItem}>
              <Text style={[styles.statSubValue, { color: colors.coral }]}>₹{owedAmount.toLocaleString('en-IN')}</Text>
              <Text style={[styles.statSubLabel, { color: colors.icon }]}>Owed ({owedToCount})</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderOptimizedSettlements = () => {
    if (settlements.length === 0) {
      return (
        <View style={[styles.settledContainer, { backgroundColor: colors.elevated, borderColor: `${colors.mint}30` }]}> 
          <Ionicons name="checkmark-circle" size={56} color={colors.mint} />
          <Text style={styles.settledTitle}>All Settled Up!</Text>
          <Text style={[styles.settledSubtitle, { color: colors.icon }]}>Everyone's balance is clear</Text>
        </View>
      );
    }

    return (
      <View style={styles.optimizedSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="flash" size={20} color={colors.amber} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Optimized Settlements</Text>
        </View>
        <Text style={[styles.optimizedDescription, { color: colors.icon }]}>
          Settle all balances with just {settlements.length} transaction{settlements.length > 1 ? 's' : ''}
        </Text>

        {settlements.map((settlement, index) => {
          const fromBalance = balances.find((b) => b.userId === settlement.from);
          const toBalance = balances.find((b) => b.userId === settlement.to);
          
          if (!fromBalance || !toBalance) return null;

          const isCurrentUserInvolved = settlement.from === currentUserId || settlement.to === currentUserId;

          return (
            <TouchableOpacity
              key={`${settlement.from}-${settlement.to}-${index}`}
              style={[
                styles.settlementCard,
                { backgroundColor: colors.elevated, borderColor: isCurrentUserInvolved ? colors.violet : `${colors.violet}15` },
              ]}
              onPress={() => handleSettleFromOptimized(settlement)}
            >
              <View style={styles.settlementFlow}>
                <View style={styles.settlementUser}>
                  <Text style={[styles.settlementUserName, { color: settlement.from === currentUserId ? colors.violet : colors.text }]} numberOfLines={1}>
                    {settlement.from === currentUserId ? 'You' : fromBalance.userName}
                  </Text>
                </View>
                
                <View style={styles.settlementArrowWrap}>
                  <Text style={[styles.settlementAmount, { color: colors.text }]}>₹{settlement.amount.toLocaleString('en-IN')}</Text>
                  <Ionicons name="arrow-forward" size={18} color={colors.violet} />
                </View>
                
                <View style={[styles.settlementUser, { alignItems: 'flex-end' }]}>
                  <Text style={[styles.settlementUserName, { color: settlement.to === currentUserId ? colors.violet : colors.text }]} numberOfLines={1}>
                    {settlement.to === currentUserId ? 'You' : toBalance.userName}
                  </Text>
                </View>
              </View>

              {isCurrentUserInvolved && (
                <View style={[styles.recordActionRow, { borderTopColor: `${colors.violet}10` }]}>
                  <Ionicons name="flash" size={14} color={colors.violet} />
                  <Text style={[styles.recordActionText, { color: colors.violet }]}>Involved in this payment · Tap to record</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderBalancesList = () => (
    <View style={styles.balancesSection}>
      <View style={styles.sectionHeader}>
        <Ionicons name="people" size={20} color={colors.violet} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>All Balances</Text>
      </View>

      {balances.map((balance) => (
        <BalanceRow
          key={balance.userId}
          balance={balance}
          currentUserId={currentUserId}
          onSettle={() => handleSettle(balance)}
        />
      ))}
    </View>
  );

  const renderHistoryItem = ({ item }: { item: SettlementHistoryItem }) => {
    const fromName = item.fromUserName || 'Unknown';
    const toName = item.toUserName || 'Unknown';
    const date = item.createdAt
      ? new Date(item.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'Recently';

    return (
      <View style={[styles.historyCard, { backgroundColor: colors.elevated, borderColor: `${colors.mint}20` }]}> 
        <View style={styles.historyIcon}>
          <Ionicons name="checkmark-circle" size={24} color={colors.mint} />
        </View>
        <View style={styles.historyContent}>
          <Text style={[styles.historyText, { color: colors.text }]}>
            {fromName} paid {toName}
          </Text>
          <Text style={[styles.historyDate, { color: colors.icon }]}>{date}</Text>
          {item.note && <Text style={[styles.historyNote, { color: colors.icon }]}>{item.note}</Text>}
        </View>
        <Text style={[styles.historyAmount, { color: colors.mint }]}>₹{item.amount.toLocaleString('en-IN')}</Text>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.violet} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={
          <>
            {renderSummaryCard()}
            {renderOptimizedSettlements()}
            {renderPendingSettlementsCompact()}
            {renderBalancesList()}
            
            {settlementHistory.length > 0 && (
              <View style={styles.historySection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="time" size={20} color={colors.icon} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Settlement History</Text>
                </View>
                {settlementHistory.map((item) => (
                  <View key={item.id}>
                    {renderHistoryItem({ item })}
                  </View>
                ))}
              </View>
            )}
          </>
        }
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.listContent}
      />

      <SettlementModal
        visible={modalState.visible}
        onClose={closeModal}
        groupId={groupId}
        fromUser={modalState.fromUser}
        toUser={modalState.toUser}
        suggestedAmount={modalState.amount}
        onSuccess={handleSettlementSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 40,
  },
  summaryCard: {
    borderWidth: 1,
    margin: 16,
    padding: 20,
    borderRadius: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  summaryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
  },
  summaryContent: {
    alignItems: 'center',
  },
  positiveAmount: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'Syne_800ExtraBold',
    marginBottom: 4,
  },
  negativeAmount: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'Syne_800ExtraBold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
    marginBottom: 24,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    width: '100%',
    paddingTop: 20,
    borderTopWidth: 1,
  },
  summaryStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  statSubValue: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    marginBottom: 2,
  },
  statSubLabel: {
    fontSize: 11,
    fontFamily: 'DMSans_500Medium',
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: '70%',
    alignSelf: 'center',
  },
  settledContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    marginHorizontal: 16,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  settledTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    fontFamily: 'Syne_700Bold',
  },
  settledSubtitle: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    marginTop: 8,
  },
  optimizedSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
  },
  optimizedDescription: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  settlementCard: {
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 16,
  },
  settlementFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settlementUser: {
    flex: 1.2,
  },
  settlementUserName: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans_700Bold',
  },
  settlementArrowWrap: {
    flex: 1,
    alignItems: 'center',
  },
  settlementAmount: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    marginBottom: 4,
  },
  recordActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 6,
  },
  recordActionText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'DMSans_500Medium',
  },
  pendingSection: {
    marginVertical: 12,
    marginBottom: 24,
  },
  sectionHeaderCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitleSmall: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    textTransform: 'uppercase',
  },
  pendingRow: {
    marginVertical: 4,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pendingLeftCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  directionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pendingFriendName: {
    fontSize: 13,
    fontFamily: 'DMSans_700Bold',
    flexShrink: 1,
  },
  pendingAmount: {
    fontSize: 14,
    fontFamily: 'Syne_700Bold',
  },
  pendingActionBtn: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pendingActionText: {
    fontSize: 11,
    fontFamily: 'DMSans_700Bold',
  },
  pendingViewAllBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 12,
    alignSelf: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  pendingViewAllText: {
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balancesSection: {
    marginTop: 12,
    marginBottom: 24,
  },
  historySection: {
    marginBottom: 24,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
  },
  historyIcon: {
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyText: {
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
  },
  historyDate: {
    fontSize: 11,
    fontFamily: 'DMSans_400Regular',
    marginTop: 2,
  },
  historyNote: {
    fontSize: 11,
    fontFamily: 'DMSans_400Regular_Italic',
    marginTop: 2,
  },
  historyAmount: {
    fontSize: 14,
    fontFamily: 'Syne_700Bold',
    marginLeft: 12,
  },
});
