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
      
      // Transform backend response to component format
      const transformedBalances = (Array.isArray(balancesData) ? balancesData : []).map((item: any) => ({
        userId: item.userId || '',
        userName: item.user || item.userName || 'Unknown', // Backend returns 'user', component expects 'userName'
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
      // Support both legacy and current backend response shapes.
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
      // Current user owes this person
      setModalState({
        visible: true,
        fromUser: { id: currentUserId, name: currentUserName },
        toUser: { id: balance.userId, name: balance.userName },
        amount,
      });
    } else {
      // This person owes current user
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
      <View style={styles.pendingSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="hourglass-outline" size={20} color="#f59e0b" />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Pending Settlements</Text>
        </View>

        {groupPendingSettlements.map((item) => {
          const isYouOwe = item.direction === 'you_owe';
          const statusColor =
            item.status === 'overdue' ? '#FF5F7E' : item.status === 'partial' ? '#FFB547' : '#8B8BA9';

          return (
            <View
              key={item.id}
              style={[styles.pendingRow, { backgroundColor: colors.card, borderColor: colors.elevated }]}
            >
              <View style={styles.pendingLeftCol}>
                <Ionicons
                  name={isYouOwe ? 'arrow-forward' : 'arrow-back'}
                  size={16}
                  color={isYouOwe ? '#FF5F7E' : '#00E5B0'}
                />
                <Text style={[styles.pendingFriendName, { color: colors.text }]} numberOfLines={1}>
                  {item.friend.name}
                </Text>
              </View>

              <Text style={[styles.pendingAmount, { color: colors.text }]}>
                ₹{Number(item.remaining || item.amount || 0).toFixed(2)}
              </Text>

              <View style={[styles.statusBadge, { borderColor: `${statusColor}66`, backgroundColor: `${statusColor}1A` }]}>
                <Text style={[styles.statusBadgeText, { color: statusColor }]}>{item.status}</Text>
              </View>

              <TouchableOpacity
                style={[styles.pendingActionBtn, isYouOwe ? styles.pendingPayBtn : styles.pendingRemindBtn]}
                onPress={() => (isYouOwe ? handlePendingPay(item) : handlePendingRemind(item))}
                activeOpacity={0.9}
              >
                <Text style={styles.pendingActionText}>{isYouOwe ? 'Pay' : 'Remind'}</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        <TouchableOpacity
          style={styles.pendingViewAllBtn}
          onPress={() => router.push({ pathname: '/settlements' as any, params: { groupId } })}
          activeOpacity={0.9}
        >
          <Text style={styles.pendingViewAllText}>View All →</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSummaryCard = () => {
    const yourBalance = balances.find((b) => b.userId === currentUserId);
    const yourNet = Number(yourBalance?.netBalance || 0);

    // Show personal, real amounts instead of whole-group totals.
    const lentAmount = Math.max(yourNet, 0);
    const owedAmount = Math.max(-yourNet, 0);

    const lentToCount = settlements.filter((s) => s.to === currentUserId).length;
    const owedToCount = settlements.filter((s) => s.from === currentUserId).length;

    return (
      <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.elevated }]}> 
        <View style={styles.summaryHeader}>
          <Ionicons name="wallet" size={24} color="#6366f1" />
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Your Balance</Text>
        </View>
        
        <View style={styles.summaryContent}>
          <View style={styles.summaryRow}>
            <Text style={yourNet >= 0 ? styles.positiveAmount : styles.negativeAmount}>
              ₹{Math.abs(yourNet).toFixed(2)}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.icon }]}>
              {yourNet > 0 ? 'You are owed' : yourNet < 0 ? 'You owe' : 'All settled'}
            </Text>
          </View>

          <View style={[styles.summaryDetails, { borderTopColor: colors.elevated }]}> 
            <View style={styles.summaryDetailItem}>
              <Text style={[styles.summaryDetailValue, { color: colors.text }]}>₹{lentAmount.toFixed(2)}</Text>
              <Text style={[styles.summaryDetailLabel, { color: colors.icon }]}>Lent ({lentToCount})</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.elevated }]} />
            <View style={styles.summaryDetailItem}>
              <Text style={[styles.summaryDetailValue, { color: colors.text }]}>₹{owedAmount.toFixed(2)}</Text>
              <Text style={[styles.summaryDetailLabel, { color: colors.icon }]}>Owed ({owedToCount})</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderOptimizedSettlements = () => {
    if (settlements.length === 0) {
      return (
        <View style={[styles.settledContainer, { backgroundColor: colors.card, borderColor: colors.elevated }]}> 
          <Ionicons name="checkmark-circle" size={64} color="#22c55e" />
          <Text style={styles.settledTitle}>All Settled Up!</Text>
          <Text style={[styles.settledSubtitle, { color: colors.icon }]}>Everyone's balance is clear</Text>
        </View>
      );
    }

    return (
      <View style={styles.optimizedSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="flash" size={20} color="#f59e0b" />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Optimized Settlements</Text>
        </View>
        <Text style={[styles.optimizedDescription, { color: colors.icon }]}>
          Settle all balances with just {settlements.length} transaction{settlements.length > 1 ? 's' : ''}
        </Text>

        {settlements.map((settlement, index) => {
          const fromBalance = balances.find((b) => b.userId === settlement.from);
          const toBalance = balances.find((b) => b.userId === settlement.to);
          
          if (!fromBalance || !toBalance) return null;

          const isCurrentUserInvolved =
            settlement.from === currentUserId || settlement.to === currentUserId;

          return (
            <TouchableOpacity
              key={`${settlement.from}-${settlement.to}-${index}`}
              style={[
                styles.settlementCard,
                { backgroundColor: colors.card, borderColor: colors.elevated },
                isCurrentUserInvolved && styles.settlementCardHighlight,
              ]}
              onPress={() => handleSettleFromOptimized(settlement)}
            >
              <View style={styles.settlementFlow}>
                <View style={styles.settlementUser}>
                  <Text style={[styles.settlementUserName, { color: colors.text }]}>
                    {settlement.from === currentUserId ? 'You' : fromBalance.userName}
                  </Text>
                </View>
                
                <View style={styles.settlementArrow}>
                  <Text style={styles.settlementAmount}>₹{settlement.amount.toFixed(2)}</Text>
                  <Ionicons name="arrow-forward" size={20} color="#6366f1" />
                </View>
                
                <View style={styles.settlementUser}>
                  <Text style={[styles.settlementUserName, { color: colors.text }]}>
                    {settlement.to === currentUserId ? 'You' : toBalance.userName}
                  </Text>
                </View>
              </View>

              {isCurrentUserInvolved && (
                <View style={[styles.recordButtonContainer, { borderTopColor: colors.elevated }]}>
                  <Ionicons name="checkmark-circle" size={16} color="#6366f1" />
                  <Text style={styles.recordButtonText}>Tap to record</Text>
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
        <Ionicons name="people" size={20} color="#6366f1" />
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
      <View style={[styles.historyCard, { backgroundColor: colors.card, borderColor: colors.elevated }]}> 
        <View style={styles.historyIcon}>
          <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
        </View>
        <View style={styles.historyContent}>
          <Text style={[styles.historyText, { color: colors.text }]}>
            {fromName} paid {toName}
          </Text>
          <Text style={[styles.historyDate, { color: colors.icon }]}>{date}</Text>
          {item.note && <Text style={[styles.historyNote, { color: colors.icon }]}>{item.note}</Text>}
        </View>
        <Text style={styles.historyAmount}>₹{Number(item.amount || 0).toFixed(2)}</Text>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
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
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 12,
  },
  summaryContent: {
    alignItems: 'center',
  },
  summaryRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  positiveAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#22c55e',
  },
  negativeAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ef4444',
  },
  summaryLabel: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 4,
  },
  summaryDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  summaryDetailItem: {
    alignItems: 'center',
  },
  summaryDetailValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  summaryDetailLabel: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e2e8f0',
  },
  settledContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingVertical: 48,
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
  },
  settledTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#22c55e',
    marginTop: 16,
  },
  settledSubtitle: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 8,
  },
  optimizedSection: {
    marginBottom: 24,
  },
  pendingSection: {
    marginBottom: 24,
  },
  pendingRow: {
    marginHorizontal: 16,
    marginVertical: 5,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pendingLeftCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  pendingFriendName: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
  },
  pendingAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  pendingActionBtn: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pendingPayBtn: {
    backgroundColor: 'rgba(124, 92, 252, 0.18)',
    borderColor: 'rgba(124, 92, 252, 0.34)',
  },
  pendingRemindBtn: {
    backgroundColor: 'rgba(0, 229, 176, 0.14)',
    borderColor: 'rgba(0, 229, 176, 0.30)',
  },
  pendingActionText: {
    color: '#F3F3FF',
    fontSize: 11,
    fontWeight: '700',
  },
  pendingViewAllBtn: {
    paddingHorizontal: 16,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  pendingViewAllText: {
    color: '#9B7FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 8,
  },
  optimizedDescription: {
    fontSize: 13,
    color: '#64748b',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  settlementCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settlementCardHighlight: {
    backgroundColor: '#eef2ff',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  settlementFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settlementUser: {
    flex: 1,
  },
  settlementUserName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  settlementArrow: {
    alignItems: 'center',
    marginHorizontal: 12,
  },
  settlementAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6366f1',
    marginBottom: 4,
  },
  recordButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#c7d2fe',
  },
  recordButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366f1',
    marginLeft: 6,
  },
  balancesSection: {
    marginBottom: 24,
  },
  historySection: {
    marginBottom: 24,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  historyIcon: {
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  historyDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  historyNote: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 4,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22c55e',
    marginLeft: 12,
  },
});
