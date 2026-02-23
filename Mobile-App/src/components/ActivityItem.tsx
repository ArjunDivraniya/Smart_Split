import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export interface ActivityItemData {
  id: string;
  name: string;
  description: string;
  amount: number;
  type: 'expense' | 'settlement' | 'personal' | 'paid' | 'owe';
  avatarLabel: string;
  avatarColor: string;
  timestamp?: string;
  date?: string;
}

interface ActivityItemProps {
  item: ActivityItemData;
  onPress?: () => void;
}

const COLORS = {
  border: 'rgba(255, 255, 255, 0.06)',
  textPrimary: '#F0F0FF',
  textMuted: '#55556A',
  textSecondary: '#8888AA',
  coral: '#FF5F7E',
  mint: '#00E5B0',
  amber: '#FFB547',
  violet: '#7C5CFC',
};

export const ActivityItem: React.FC<ActivityItemProps> = ({ item, onPress }) => {
  const getAmountColor = () => {
    if (item.type === 'settlement' || item.type === 'paid') return COLORS.mint;
    if (item.type === 'expense' || item.type === 'owe') return COLORS.coral;
    return COLORS.textSecondary;
  };

  const getAmountPrefix = () => {
    if (item.type === 'settlement' || item.type === 'paid') return '+';
    if (item.type === 'expense' || item.type === 'owe') return '-';
    return '';
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
        <Text style={styles.avatarText}>{item.avatarLabel}</Text>
      </View>
      
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
      </View>
      
      <Text style={[styles.amount, { color: getAmountColor() }]}>
        {getAmountPrefix()}₹{Math.abs(item.amount).toLocaleString('en-IN')}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  description: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: 'DMSans_400Regular',
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
  },
});
