import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FriendSpending } from '@/src/types/analytics.types';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface FriendSpendingCardProps {
  friend: FriendSpending;
  maxTotal: number;
}

export const FriendSpendingCard = ({ friend, maxTotal }: FriendSpendingCardProps) => {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors.dark; // Force dark theme for consistency
  const progress = maxTotal > 0 ? (friend.totalShared / maxTotal) * 100 : 0;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.elevated }]}>
      <View style={styles.topRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {friend.friendName?.trim()?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>

        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]}>{friend.friendName}</Text>
          <Text style={[styles.meta, { color: colors.icon }]}>
            ₹{Math.round(friend.totalShared).toLocaleString('en-IN')} · {friend.expenseCount} expenses
          </Text>
          <Text style={[styles.groups, { color: colors.icon }]} numberOfLines={1}>
            {friend.groups.join(' · ')}
          </Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.max(6, progress)}%` }]} />
      </View>
    </View>
  );
};

export default FriendSpendingCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7C5CFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontFamily: 'Syne_700Bold',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
  },
  meta: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
  },
  groups: {
    marginTop: 2,
    fontSize: 11,
    fontFamily: 'DMSans_400Regular',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#00E5B0',
  },
});
