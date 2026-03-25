import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface BalanceRowProps {
  balance: {
    userId: string;
    userName: string;
    netBalance: number;
    paid: number;
    owedShare: number;
  };
  currentUserId: string;
  onSettle?: () => void;
}

export const BalanceRow: React.FC<BalanceRowProps> = ({
  balance,
  currentUserId,
  onSettle,
}) => {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const isCurrentUser = balance.userId === currentUserId;
  const isCreditor = balance.netBalance > 0;
  const isDebtor = balance.netBalance < 0;
  const isSettled = Math.abs(balance.netBalance) < 0.01;

  const getBalanceText = () => {
    if (isSettled) {
      return 'Settled up';
    } else if (isCreditor) {
      return isCurrentUser ? 'gets back' : 'owes you';
    } else {
      return isCurrentUser ? 'owes' : 'is owed';
    }
  };

  const getBalanceColor = () => {
    if (isSettled) return '#94a3b8';
    if (isCreditor) return '#22c55e';
    return '#ef4444';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.elevated }]}> 
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, isSettled && styles.avatarSettled]}>
          <Text style={styles.avatarText}>
            {balance.userName.charAt(0).toUpperCase()}
          </Text>
        </View>
        {isCurrentUser && (
          <View style={styles.youBadge}>
            <Text style={styles.youBadgeText}>You</Text>
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        <Text style={[styles.userName, { color: colors.text }]}>
          {isCurrentUser ? 'You' : balance.userName}
        </Text>
        <View style={styles.detailsRow}>
          <Text style={[styles.statusText, { color: colors.icon }]}>{getBalanceText()}</Text>
          {!isSettled && (
            <Text style={[styles.amount, { color: getBalanceColor() }]}>
              ₹{Math.abs(balance.netBalance).toFixed(2)}
            </Text>
          )}
        </View>
        <View style={styles.breakdownRow}>
          <Text style={[styles.breakdownText, { color: colors.icon }]}>
            Paid: ₹{balance.paid.toFixed(2)} • Owes: ₹{balance.owedShare.toFixed(2)}
          </Text>
        </View>
      </View>

      {!isCurrentUser && !isSettled && onSettle && (
        <TouchableOpacity
          style={[
            styles.settleButton,
            isDebtor ? styles.settleButtonOwed : styles.settleButtonOwe,
          ]}
          onPress={onSettle}
        >
          <Ionicons
            name={isDebtor ? 'wallet' : 'checkmark-circle'}
            size={20}
            color="#ffffff"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSettled: {
    backgroundColor: '#94a3b8',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  youBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#22c55e',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  youBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
  },
  contentContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 13,
    color: '#64748b',
    marginRight: 8,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
  breakdownRow: {
    marginTop: 2,
  },
  breakdownText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  settleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  settleButtonOwed: {
    backgroundColor: '#ef4444',
  },
  settleButtonOwe: {
    backgroundColor: '#22c55e',
  },
});
