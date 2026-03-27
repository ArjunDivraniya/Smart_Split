import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS as ThemeColors } from '@/src/constants/theme';
import type { FriendBalanceItem } from '@/src/types/friends.types';

const COLORS = {
  card: '#14141F',
  border: 'rgba(255,255,255,0.06)',
  textPrimary: '#F0F0FF',
  textSecondary: '#8888AA',
  textMuted: '#55556A',
  mint: '#00E5B0',
  coral: '#FF5F7E',
  violet: ThemeColors.primary,
};

const currency = (value: number): string => `₹${Math.abs(Number(value || 0)).toLocaleString('en-IN')}`;
const getInitial = (name: string): string => (name?.trim()?.[0] || 'F').toUpperCase();

interface FriendCardProps {
  friend: FriendBalanceItem;
  pendingCount: number;
  overdueCount: number;
  onPress: () => void;
}

export function FriendCard({ friend, pendingCount, overdueCount, onPress }: FriendCardProps) {
  const net = Number(friend.netBalance ?? friend.netAmount ?? 0);
  const isYouGet = net >= 0;
  const isAllSettled = pendingCount <= 0 && overdueCount <= 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.86}>
      <View style={styles.leftRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitial(friend.name)}</Text>
        </View>
        <View style={styles.nameWrap}>
          <Text style={styles.friendName} numberOfLines={1}>{friend.name}</Text>
          <Text style={[styles.balanceText, { color: isYouGet ? COLORS.mint : COLORS.coral }]}>
            {isYouGet ? 'You get ' : 'You owe '}
            {currency(net)}
          </Text>

          {isAllSettled ? (
            <Text style={styles.allSettledText}>✅ All settled</Text>
          ) : (
            <View style={styles.infoRow}>
              <Text style={styles.pendingText}>{pendingCount} pending</Text>
              {overdueCount > 0 ? <Text style={styles.overdueText}> · ⚠️ {overdueCount} overdue</Text> : null}
            </View>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );
}

export default FriendCard;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124,92,252,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(124,92,252,0.45)',
  },
  avatarText: {
    color: '#DBCEFF',
    fontSize: 14,
    fontFamily: 'DMSans_700Bold',
  },
  nameWrap: {
    marginLeft: 10,
    flex: 1,
  },
  friendName: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontFamily: 'DMSans_700Bold',
    marginBottom: 2,
  },
  balanceText: {
    fontSize: 13,
    fontFamily: 'DMSans_600SemiBold',
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingText: {
    color: '#55556A',
    fontSize: 10,
    fontFamily: 'DMSans_500Medium',
  },
  overdueText: {
    color: '#FF5F7E',
    fontSize: 10,
    fontFamily: 'DMSans_600SemiBold',
  },
  allSettledText: {
    color: '#00E5B0',
    fontSize: 10,
    fontFamily: 'DMSans_600SemiBold',
  },
});
