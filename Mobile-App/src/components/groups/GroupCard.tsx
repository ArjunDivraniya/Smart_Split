import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Group, GroupType, GROUP_TYPE_MAP } from '@/src/types/group.types';
import { formatTripSummary } from '@/src/utils/tripDayCalculator';

const COLORS = {
  surface: '#0F0F1A',
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
  const membersCount = group.members?.length ?? 0;

  const subtitle = isTrip && group.tripStartDate && group.tripEndDate
    ? formatTripSummary(group)
    : `${membersCount} member${membersCount !== 1 ? 's' : ''}`;

  const locationOrType = isTrip
    ? (group.tripDestination || typeInfo.label)
    : typeInfo.label;

  const budgetText = isTrip && group.trackBudget && group.tripBudget
    ? `${Math.round((group.totalSpent / group.tripBudget) * 100)}% of Rs ${group.tripBudget.toLocaleString('en-IN')}`
    : null;

  const netBalanceColor =
    group.netBalance > 0 ? COLORS.mint : group.netBalance < 0 ? COLORS.coral : COLORS.textMuted;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.78}
    >
      <LinearGradient
        colors={['rgba(124, 92, 252, 0.24)', 'rgba(13, 13, 23, 0.92)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientLayer}
      >
        <View style={styles.topRow}>
          <View style={styles.leftHeader}>
            <View style={styles.emojiOrb}>
              <Text style={styles.emoji}>{group.emoji || typeInfo.emoji}</Text>
            </View>

            <View style={styles.titleWrap}>
              <Text style={styles.groupName} numberOfLines={1}>{group.name}</Text>
              <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
            </View>
          </View>

          <View style={[styles.statusPill, group.isActive ? styles.statusPillLive : styles.statusPillEnded]}>
            <Text style={[styles.statusPillText, group.isActive ? styles.statusTextLive : styles.statusTextEnded]}>
              {group.isActive ? 'LIVE' : 'ENDED'}
            </Text>
          </View>
        </View>

        <View style={styles.infoChipRow}>
          <View style={styles.infoChip}>
            <Ionicons name={isTrip ? 'location-outline' : 'pricetag-outline'} size={12} color={COLORS.violetLight} />
            <Text style={styles.infoChipText} numberOfLines={1}>{locationOrType}</Text>
          </View>

          <View style={styles.infoChip}>
            <Ionicons name="people-outline" size={12} color={COLORS.textSecondary} />
            <Text style={styles.infoChipText}>{membersCount} members</Text>
          </View>
        </View>

        <View style={styles.financialStrip}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Total Spent</Text>
            <Text style={styles.metricValue}>Rs {group.totalSpent.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricBoxRight}>
            <Text style={styles.metricLabel}>{group.netBalance > 0 ? 'You Get' : 'You Owe'}</Text>
            <Text style={[styles.metricValue, { color: netBalanceColor }]}>Rs {Math.abs(group.netBalance).toLocaleString('en-IN')}</Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.budgetWrap}>
            <View style={styles.budgetTrack}>
              <View
                style={[
                  styles.budgetFill,
                  {
                    width:
                      isTrip && group.trackBudget && group.tripBudget && group.tripBudget > 0
                        ? `${Math.min(100, Math.max(6, (group.totalSpent / group.tripBudget) * 100))}%`
                        : '28%',
                  },
                ]}
              />
            </View>
            <Text style={styles.budgetLabel}>{budgetText || 'Budget tracking off'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    marginBottom: 12,
    minHeight: 188,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 9,
  },
  gradientLayer: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  emojiOrb: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
  },
  emoji: {
    fontSize: 24,
  },
  titleWrap: {
    flex: 1,
  },
  groupName: {
    fontSize: 17,
    fontWeight: '800',
    fontFamily: 'Syne_800ExtraBold',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_400Regular',
    marginTop: 2,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  statusPillLive: {
    backgroundColor: 'rgba(0, 229, 176, 0.14)',
    borderColor: 'rgba(0, 229, 176, 0.35)',
  },
  statusPillEnded: {
    backgroundColor: 'rgba(85, 85, 106, 0.28)',
    borderColor: 'rgba(136, 136, 170, 0.32)',
  },
  statusPillText: {
    fontSize: 9,
    fontFamily: 'DMSans_700Bold',
    letterSpacing: 0.8,
  },
  statusTextLive: {
    color: COLORS.mint,
  },
  statusTextEnded: {
    color: COLORS.textSecondary,
  },
  infoChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  infoChip: {
    flex: 1,
    minHeight: 30,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoChipText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_600SemiBold',
    flex: 1,
  },
  financialStrip: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(9, 9, 19, 0.45)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  metricBox: {
    flex: 1,
  },
  metricBoxRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  metricLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontFamily: 'DMSans_600SemiBold',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontFamily: 'Syne_700Bold',
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginHorizontal: 10,
  },
  bottomRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  budgetWrap: {
    flex: 1,
    marginRight: 8,
  },
  budgetTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    marginBottom: 6,
  },
  budgetFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: COLORS.amber,
  },
  budgetLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: 'DMSans_500Medium',
  },
});
