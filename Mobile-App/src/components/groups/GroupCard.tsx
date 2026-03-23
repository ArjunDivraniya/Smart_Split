// Mobile-App/src/components/groups/GroupCard.tsx

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Group, GroupType, GROUP_TYPE_MAP } from '@/src/types/group.types';
import { formatTripSummary } from '@/src/utils/tripDayCalculator';

const COLORS = {
  surface: '#0F0F1A',
  elevated: '#1A1A2B',
  violet: '#7C5CFC',
  violetLight: '#9B7FFF',
  mint: '#00E5B0',
  coral: '#FF5F7E',
  amber: '#FFB547',
  textPrimary: '#F0F0FF',
  textSecondary: '#8888AA',
  textMuted: '#55556A',
  border: 'rgba(255, 255, 255, 0.06)',
};

interface GroupCardProps {
  group: Group;
  onPress: () => void;
  onLongPress?: () => void;
}

export function GroupCard({ group, onPress, onLongPress }: GroupCardProps) {
  const typeInfo = GROUP_TYPE_MAP[group.type];
  const isTrip = group.type === GroupType.TRIP;
  const secondaryInfo = isTrip && group.tripStartDate && group.tripEndDate
    ? formatTripSummary(group)
    : `${(group.members?.length ?? 0)} member${(group.members?.length ?? 0) !== 1 ? 's' : ''}`;
  const tertiaryInfo = isTrip
    ? (group.tripDestination || typeInfo.label)
    : typeInfo.label;
  const budgetText = isTrip && group.trackBudget && group.tripBudget
    ? `${Math.round((group.totalSpent / group.tripBudget) * 100)}% of ₹${group.tripBudget.toLocaleString('en-IN')}`
    : null;

  const netBalanceColor =
    group.netBalance > 0 ? COLORS.mint : group.netBalance < 0 ? COLORS.coral : COLORS.textMuted;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {/* Header Row */}
      <View style={styles.cardHeader}>
        <View style={styles.titleSection}>
          <Text style={styles.emoji}>{group.emoji || typeInfo.emoji}</Text>
          <View style={styles.titleInfo}>
            <Text style={styles.groupName} numberOfLines={1}>
              {group.name}
            </Text>
            <Text style={styles.tripInfo} numberOfLines={1}>
              {secondaryInfo}
            </Text>
            <View style={styles.tripDestination}>
              <Ionicons name={isTrip ? 'location' : 'pricetag'} size={14} color={isTrip ? COLORS.mint : COLORS.violetLight} />
              <Text style={styles.destinationText} numberOfLines={1}>{tertiaryInfo}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Row with totals */}
      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.footerLabel}>Total Spent</Text>
          <Text style={styles.footerValue}>
            ₹{group.totalSpent.toLocaleString('en-IN')}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.alignRight}>
          <Text style={styles.footerLabel}>
            {group.netBalance > 0 ? 'You Get' : 'You Owe'}
          </Text>
          <Text style={[styles.footerValue, { color: netBalanceColor }]}>
            ₹{Math.abs(group.netBalance).toLocaleString('en-IN')}
          </Text>
        </View>
      </View>

      <View style={styles.budgetSlot}>
        {budgetText ? (
          <View style={styles.budgetBar}>
            <View style={styles.budgetBarFill} />
            <Text style={styles.budgetLabel}>{budgetText}</Text>
          </View>
        ) : (
          <Text style={styles.budgetPlaceholder}> </Text>
        )}
      </View>

      {/* Status Indicator */}
      {!group.isActive && (
        <View style={styles.inactiveOverlay}>
          <Text style={styles.inactiveText}>Ended</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.elevated,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    minHeight: 178,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  cardHeader: {
    marginBottom: 10,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  emoji: {
    fontSize: 32,
  },
  titleInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'Syne_800ExtraBold',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  tripInfo: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: 'DMSans_400Regular',
    marginTop: 2,
  },
  memberCount: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_400Regular',
  },
  tripDestination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: `${COLORS.mint}12`,
    borderRadius: 8,
    minHeight: 30,
  },
  destinationText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_500Medium',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: 'DMSans_400Regular',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footerValue: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
  },
  alignRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  budgetBar: {
    paddingTop: 4,
  },
  budgetBarFill: {
    height: 4,
    backgroundColor: COLORS.amber,
    borderRadius: 2,
    marginBottom: 6,
  },
  budgetLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: 'DMSans_400Regular',
  },
  budgetSlot: {
    minHeight: 24,
    justifyContent: 'center',
  },
  budgetPlaceholder: {
    fontSize: 10,
    opacity: 0,
  },
  inactiveOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: `${COLORS.textMuted}40`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  inactiveText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textMuted,
  },
});
