// Mobile-App/src/components/groups/GroupCard.tsx

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
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
  const isDaysCounted = group.type === GroupType.TRIP;
  const isTrip = group.type === GroupType.TRIP;

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
            {isTrip && group.tripStartDate && group.tripEndDate && (
              <Text style={styles.tripInfo}>
                {formatTripSummary(group)}
              </Text>
            )}
            {!isTrip && (
              <Text style={styles.memberCount}>
                {(group.members?.length ?? 0)} member{(group.members?.length ?? 0) !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Trip-specific info */}
      {isTrip && group.tripDestination && (
        <View style={styles.tripDestination}>
          <Ionicons name="location" size={14} color={COLORS.mint} />
          <Text style={styles.destinationText}>{group.tripDestination}</Text>
        </View>
      )}

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

      {/* Budget Status (Trip only) */}
      {isTrip && group.trackBudget && group.tripBudget && (
        <View style={styles.budgetBar}>
          <View style={styles.budgetBarFill} />
          <Text style={styles.budgetLabel}>
            {Math.round((group.totalSpent / group.tripBudget) * 100)}% of ₹
            {group.tripBudget.toLocaleString('en-IN')}
          </Text>
        </View>
      )}

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
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  cardHeader: {
    marginBottom: 12,
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
    marginBottom: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: `${COLORS.mint}12`,
    borderRadius: 8,
    width: 'auto',
  },
  destinationText: {
    fontSize: 11,
    color: COLORS.mint,
    fontFamily: 'DMSans_500Medium',
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
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
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
