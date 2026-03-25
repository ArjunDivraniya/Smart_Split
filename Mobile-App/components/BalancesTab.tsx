import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { apiService } from '@/src/services/api';
import { BalanceRow } from '@/components/BalanceRow';
import { SettlementModal } from '@/components/SettlementModal';

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
  const [balances, setBalances] = useState<Balance[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [settlementHistory, setSettlementHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showOptimized, setShowOptimized] = useState(true);
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
      setSettlements(data.optimizedSettlements || []);
      setSettlementHistory(data.settlements || []);
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

  const renderSummaryCard = () => {
    const totalOwed = balances
      .filter((b) => b.netBalance < 0)
      .reduce((sum, b) => sum + Math.abs(b.netBalance), 0);
    
    const totalOwedToYou = balances
      .filter((b) => b.netBalance > 0)
      .reduce((sum, b) => sum + b.netBalance, 0);

    const yourBalance = balances.find((b) => b.userId === currentUserId);
    const yourNet = yourBalance?.netBalance || 0;

    return (
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Ionicons name="wallet" size={24} color="#6366f1" />
          <Text style={styles.summaryTitle}>Your Balance</Text>
        </View>
        
        <View style={styles.summaryContent}>
          <View style={styles.summaryRow}>
            <Text style={yourNet >= 0 ? styles.positiveAmount : styles.negativeAmount}>
              ₹{Math.abs(yourNet).toFixed(2)}
            </Text>
            <Text style={styles.summaryLabel}>
              {yourNet > 0 ? 'You are owed' : yourNet < 0 ? 'You owe' : 'All settled'}
            </Text>
          </View>

          <View style={styles.summaryDetails}>
            <View style={styles.summaryDetailItem}>
              <Text style={styles.summaryDetailValue}>₹{totalOwedToYou.toFixed(2)}</Text>
              <Text style={styles.summaryDetailLabel}>Lent</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryDetailItem}>
              <Text style={styles.summaryDetailValue}>₹{totalOwed.toFixed(2)}</Text>
              <Text style={styles.summaryDetailLabel}>Owed</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderOptimizedSettlements = () => {
    if (settlements.length === 0) {
      return (
        <View style={styles.settledContainer}>
          <Ionicons name="checkmark-circle" size={64} color="#22c55e" />
          <Text style={styles.settledTitle}>All Settled Up!</Text>
          <Text style={styles.settledSubtitle}>Everyone's balance is clear</Text>
        </View>
      );
    }

    return (
      <View style={styles.optimizedSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="flash" size={20} color="#f59e0b" />
          <Text style={styles.sectionTitle}>Optimized Settlements</Text>
        </View>
        <Text style={styles.optimizedDescription}>
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
                isCurrentUserInvolved && styles.settlementCardHighlight,
              ]}
              onPress={() => handleSettleFromOptimized(settlement)}
            >
              <View style={styles.settlementFlow}>
                <View style={styles.settlementUser}>
                  <Text style={styles.settlementUserName}>
                    {settlement.from === currentUserId ? 'You' : fromBalance.userName}
                  </Text>
                </View>
                
                <View style={styles.settlementArrow}>
                  <Text style={styles.settlementAmount}>₹{settlement.amount.toFixed(2)}</Text>
                  <Ionicons name="arrow-forward" size={20} color="#6366f1" />
                </View>
                
                <View style={styles.settlementUser}>
                  <Text style={styles.settlementUserName}>
                    {settlement.to === currentUserId ? 'You' : toBalance.userName}
                  </Text>
                </View>
              </View>

              {isCurrentUserInvolved && (
                <View style={styles.recordButtonContainer}>
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
        <Text style={styles.sectionTitle}>All Balances</Text>
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

  const renderHistoryItem = ({ item }: { item: any }) => {
    const fromName = item.fromUser?.name || 'Unknown';
    const toName = item.toUser?.name || 'Unknown';
    const date = new Date(item.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <View style={styles.historyCard}>
        <View style={styles.historyIcon}>
          <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
        </View>
        <View style={styles.historyContent}>
          <Text style={styles.historyText}>
            {fromName} paid {toName}
          </Text>
          <Text style={styles.historyDate}>{date}</Text>
          {item.note && <Text style={styles.historyNote}>{item.note}</Text>}
        </View>
        <Text style={styles.historyAmount}>₹{item.amount.toFixed(2)}</Text>
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
    <View style={styles.container}>
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={
          <>
            {renderSummaryCard()}
            {renderOptimizedSettlements()}
            {renderBalancesList()}
            
            {settlementHistory.length > 0 && (
              <View style={styles.historySection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="time" size={20} color="#64748b" />
                  <Text style={styles.sectionTitle}>Settlement History</Text>
                </View>
                {settlementHistory.map((item) => (
                  <View key={toSafeKey(item._id, `history-${item.from}-${item.to}-${item.createdAt}`)}>
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
