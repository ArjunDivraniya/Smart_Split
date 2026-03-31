import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Group, GroupType, GROUP_TYPE_MAP } from '@/src/types/group.types';
import { AvatarGroup } from '@/src/components/groups/AvatarGroup';

const COLORS = {
  surface: '#141420',
  surfaceTrip: '#1A1830',
  violet: '#7C5CFC',
  mint: '#00E5B0',
  coral: '#FF5F7E',
  textPrimary: '#FFFFFF', // Bright white for primary
  textSecondary: '#D1D1E8', // Lighter secondary
  textMuted: '#9595B0', // Light enough to read
  border: 'rgba(255, 255, 255, 0.12)', // More distinct border
  badgeActiveBg: 'rgba(0, 229, 176, 0.18)',
  badgeEndedBg: 'rgba(255, 95, 126, 0.16)',
};

const normalizeId = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
};

interface GroupCardProps {
  group: Group;
  currentUserId: string;
  onPress: () => void;
  onLongPress?: () => void;
  onEdit?: (group: Group) => void;
  onDelete?: (group: Group) => void;
}

export function GroupCard({
  group,
  currentUserId,
  onPress,
  onLongPress,
  onEdit,
  onDelete,
}: GroupCardProps) {
  const typeInfo = GROUP_TYPE_MAP[group.type];
  const isTrip = group.type === GroupType.TRIP;
  const membersCount = group.members?.length ?? 0;
  const lastActivityDate = group.updatedAt || group.createdAt;

  const destination = isTrip ? (group.tripDestination || 'Destination not set') : null;

  const formatDate = (value?: Date): string => {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
    });
  };

  const dateRange = isTrip && group.tripStartDate && group.tripEndDate
    ? `${formatDate(group.tripStartDate)} - ${formatDate(group.tripEndDate)}`
    : null;

  const lastActivityText = (() => {
    if (!lastActivityDate) return 'No activity yet';
    const parsed = new Date(lastActivityDate);
    if (Number.isNaN(parsed.getTime())) return 'No activity yet';
    return parsed.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  })();

  const netBalanceLabel = group.netBalance >= 0 ? 'You are owed' : 'You owe';
  const netBalanceColor = group.netBalance >= 0 ? COLORS.mint : COLORS.coral;

  const memberPreview = (group.members || []).map((member) => ({
    id: member.userId,
    name: member.userName,
    email: member.email,
  }));

  const creatorRaw =
    typeof group.createdBy === 'object'
      ? group.createdBy?._id || (group.createdBy as any)?.id || (group.createdBy as any)?.userId
      : group.createdBy;

  const creatorId = normalizeId(creatorRaw);
  const signedInUserId = normalizeId(currentUserId);
  const isCreator = Boolean(signedInUserId && creatorId && creatorId === signedInUserId);
  const canSwipe = isCreator && Boolean(onEdit || onDelete);

  const renderRightActions = () => (
    <View style={styles.actionsOuter}>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editAction]}
          onPress={() => onEdit?.(group)}
          activeOpacity={0.85}
        >
          <Ionicons name="create-outline" size={16} color="#FFFFFF" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteAction]}
          onPress={() => onDelete?.(group)}
          activeOpacity={0.85}
        >
          <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const cardContent = (
    <TouchableOpacity
      style={[
        styles.card,
        isTrip ? styles.tripCard : styles.regularCard,
        { backgroundColor: isTrip ? COLORS.surfaceTrip : COLORS.surface },
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.78}
    >
      <View style={styles.contentWrap}>
        <View style={styles.topRow}>
          <View style={styles.leftBlock}>
            <View style={styles.emojiWrap}>
              <Text style={styles.emoji}>{group.emoji || typeInfo.emoji}</Text>
            </View>

            <View style={styles.titleBlock}>
              <Text style={styles.groupName} numberOfLines={1}>
                {group.name}
              </Text>

              <View style={styles.memberRow}>
                <AvatarGroup members={memberPreview} size="small" />
                <Text style={styles.memberCountText}>{membersCount} member{membersCount !== 1 ? 's' : ''}</Text>
              </View>

              {isTrip && (
                <View style={styles.tripInfoRow}>
                  <View style={styles.tripMetaItem}>
                    <Ionicons name="location-outline" size={13} color={COLORS.textSecondary} />
                    <Text style={styles.tripMetaText} numberOfLines={1}>{destination}</Text>
                  </View>
                  {dateRange ? (
                    <View style={styles.tripMetaItem}>
                      <Ionicons name="calendar-outline" size={13} color={COLORS.textSecondary} />
                      <Text style={styles.tripMetaText}>{dateRange}</Text>
                    </View>
                  ) : null}
                </View>
              )}
            </View>
          </View>

          {isTrip && (
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: group.isActive ? COLORS.badgeActiveBg : COLORS.badgeEndedBg },
              ]}
            >
              <Text style={[styles.statusBadgeText, { color: group.isActive ? COLORS.mint : COLORS.coral }]}> 
                {group.isActive ? 'Active' : 'Ended'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricBlock}>
            <Text style={styles.metricLabel}>Total Spent</Text>
            <Text style={styles.metricValue}>Rs {Number(group.totalSpent || 0).toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.metricBlockRight}>
            <Text style={styles.metricLabel}>{netBalanceLabel}</Text>
            <Text style={[styles.metricValue, { color: netBalanceColor }]}>Rs {Math.abs(Number(group.netBalance || 0)).toLocaleString('en-IN')}</Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.lastActivityText}>Last activity: {lastActivityText}</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!canSwipe) {
    return cardContent;
  }

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      overshootRight={false}
      rightThreshold={24}
      friction={2}
    >
      {cardContent}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
  },
  regularCard: {
    minHeight: 154,
  },
  tripCard: {
    minHeight: 184,
  },
  contentWrap: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  leftBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 12,
  },
  emojiWrap: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emoji: {
    fontSize: 30,
  },
  titleBlock: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  memberCountText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_500Medium',
    marginLeft: 8,
  },
  tripInfoRow: {
    marginTop: 2,
    gap: 5,
  },
  tripMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  tripMetaText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_500Medium',
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  statusBadgeText: {
    fontSize: 10,
    fontFamily: 'DMSans_700Bold',
  },
  metricsRow: {
    flexDirection: 'row',
    marginTop: 6,
    marginBottom: 10,
    gap: 10,
  },
  metricBlock: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  metricBlockRight: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'flex-start',
  },
  metricLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: 'DMSans_500Medium',
    marginBottom: 5,
  },
  metricValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontFamily: 'Syne_700Bold',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastActivityText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_400Regular',
    flex: 1,
  },
  actionsOuter: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '92%',
  },
  actionButton: {
    width: 82,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  editAction: {
    backgroundColor: COLORS.violet,
  },
  deleteAction: {
    backgroundColor: COLORS.coral,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'DMSans_600SemiBold',
  },
});
