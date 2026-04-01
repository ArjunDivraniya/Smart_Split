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
  const colors = Colors.dark; // Force dark theme for consistency
  const isCurrentUser = balance.userId === currentUserId;
  const isCreditor = balance.netBalance > 0;
  const isDebtor = balance.netBalance < 0;
  const isSettled = Math.abs(balance.netBalance) < 0.01;

  const getBalanceText = () => {
    if (isSettled) {
      return 'Settled up';
    } else if (isCreditor) {
      return isCurrentUser ? 'Gives back' : 'Owes you';
    } else {
      return isCurrentUser ? 'You Owe' : 'Is owed';
    }
  };

  const getBalanceColor = () => {
    if (isSettled) return colors.icon;
    if (isCreditor) return colors.mint;
    return colors.coral;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.elevated, borderColor: `${colors.violet}10` }]}> 
      <View style={styles.avatarWrap}>
        <View style={[styles.avatar, { backgroundColor: isSettled ? `${colors.icon}20` : `${colors.violet}20` }]}>
          <Text style={[styles.avatarText, { color: isSettled ? colors.icon : colors.violet }]}>
            {balance.userName.charAt(0).toUpperCase()}
          </Text>
        </View>
        {isCurrentUser && (
          <View style={[styles.youBadge, { backgroundColor: colors.mint, borderColor: colors.elevated }]}>
            <Text style={styles.youBadgeText}>YOU</Text>
          </View>
        )}
      </View>

      <View style={styles.infoSection}>
        <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
          {isCurrentUser ? 'Your Balance' : balance.userName}
        </Text>
        <View style={styles.amountRow}>
          <Text style={[styles.statusLabel, { color: colors.icon }]}>{getBalanceText()}</Text>
          {!isSettled && (
            <Text style={[styles.netAmount, { color: getBalanceColor() }]}>
              ₹{Math.abs(balance.netBalance).toLocaleString('en-IN')}
            </Text>
          )}
        </View>
        <Text style={[styles.breakdownSub, { color: colors.tabIconDefault }]}>
          Paid ₹{balance.paid.toLocaleString('en-IN')} · Share ₹{balance.owedShare.toLocaleString('en-IN')}
        </Text>
      </View>

      {!isCurrentUser && !isSettled && onSettle && (
        <TouchableOpacity
          style={[
            styles.settleQuickBtn,
            { backgroundColor: isDebtor ? `${colors.coral}15` : `${colors.mint}15`, borderColor: isDebtor ? `${colors.coral}30` : `${colors.mint}30` }
          ]}
          onPress={onSettle}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isDebtor ? 'arrow-up' : 'arrow-down'}
            size={18}
            color={isDebtor ? colors.coral : colors.mint}
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
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Syne_800ExtraBold',
  },
  youBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  youBadgeText: {
    fontSize: 7,
    fontWeight: '900',
    fontFamily: 'DMSans_700Bold',
    color: '#080810',
  },
  infoSection: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    marginBottom: 2,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusLabel: {
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
  },
  netAmount: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: 'Syne_800ExtraBold',
  },
  breakdownSub: {
    fontSize: 10,
    fontFamily: 'DMSans_400Regular',
    marginTop: 2,
  },
  settleQuickBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
