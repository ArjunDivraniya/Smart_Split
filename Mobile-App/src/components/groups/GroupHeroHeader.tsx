import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GROUP_TYPE_MAP, GroupType } from '@/src/types/group.types';

interface Member {
  id: string;
  name: string;
  email: string;
}

interface GroupHeroHeaderProps {
  groupName: string;
  groupType: GroupType;
  groupEmoji?: string;
  tripDestination?: string;
  tripDateRange?: string;
  totalSpent: number;
  yourShare: number;
  netBalance: number;
  netBalanceLabel: string;
  netBalanceColor: string;
  membersCount: number;
  memberPreview: Member[];
  budgetLimit?: number;
  budgetProgressPercent?: number;
  budgetProgress?: number;
  isTrip: boolean;
  isCreator: boolean;
  colors: any;
  onMembersPress: () => void;
  onMenuPress: () => void;
  onBackPress: () => void;
  AvatarGroup: React.ComponentType<any>;
}

// Map group types to brand colors for premium visual distinction
const getGroupTypeColor = (groupType?: GroupType): string => {
  switch (groupType?.toLowerCase?.()) {
    case 'trip':
      return '#7C5CFC'; // Violet
    case 'food':
      return '#FFB547'; // Amber
    case 'college':
      return '#38BDF8'; // Sky
    case 'flatmates':
      return '#00E5B0'; // Mint
    case 'event':
      return '#FF5F7E'; // Coral
    default:
      return '#7C5CFC'; // Default to violet
  }
};

export const GroupHeroHeader: React.FC<GroupHeroHeaderProps> = ({
  groupName,
  groupType,
  groupEmoji,
  tripDestination,
  tripDateRange,
  totalSpent,
  yourShare,
  netBalance,
  netBalanceLabel,
  netBalanceColor,
  membersCount,
  memberPreview,
  budgetLimit,
  budgetProgressPercent,
  budgetProgress,
  isTrip,
  isCreator,
  colors,
  onMembersPress,
  onMenuPress,
  onBackPress,
  AvatarGroup,
}) => {
  const typeInfo = GROUP_TYPE_MAP[groupType];
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [floatAnim]);

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return (
    <View style={[styles.heroWrap, { borderBottomColor: colors.elevated }]}>
      {/* Top row: back button and menu */}
      <View style={styles.heroTopRow}>
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>

        {isCreator ? (
          <TouchableOpacity onPress={onMenuPress} style={styles.menuButton} activeOpacity={0.8}>
            <Ionicons name="ellipsis-vertical" size={22} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.menuPlaceholder} />
        )}
      </View>

      {/* Main hero row: emoji, name, metadata */}
      <View style={styles.heroMainRow}>
        <Animated.View
          style={[
            styles.emojiGlowWrap,
            {
              transform: [{ translateY: floatY }],
            },
          ]}
        >
          <View
            style={[
              styles.emojiGlow,
              {
                backgroundColor: getGroupTypeColor(groupType) + '26',
              },
            ]}
          />
          <Text style={styles.groupEmojiHero}>{groupEmoji || typeInfo.emoji}</Text>
        </Animated.View>

        <View style={styles.heroTextBlock}>
          <Text style={[styles.groupNameHero, { color: colors.text }]} numberOfLines={1}>
            {groupName}
          </Text>

          <View style={[styles.typeBadge, { backgroundColor: `${getGroupTypeColor(groupType)}20`, borderColor: `${getGroupTypeColor(groupType)}45` }]}>
            <Text style={[styles.typeBadgeText, { color: getGroupTypeColor(groupType) }]}>{typeInfo.label}</Text>
          </View>

          {isTrip && (tripDestination || tripDateRange) ? (
            <View style={styles.tripMetaWrap}>
              {tripDestination ? (
                <View style={styles.tripMetaRow}>
                  <Ionicons name="location" size={13} color={colors.icon} />
                  <Text style={[styles.tripMetaTextHero, { color: colors.icon }]} numberOfLines={1}>
                    {tripDestination}
                  </Text>
                </View>
              ) : null}

              {tripDateRange ? (
                <View style={styles.tripMetaRow}>
                  <Ionicons name="calendar" size={13} color={colors.icon} />
                  <Text style={[styles.tripMetaTextHero, { color: colors.icon }]}>{tripDateRange}</Text>
                </View>
              ) : null}
            </View>
          ) : null}

          <TouchableOpacity style={styles.membersHeroRow} onPress={onMembersPress} activeOpacity={0.8}>
            <AvatarGroup members={memberPreview} size="medium" />
            <Text style={[styles.membersHeroText, { color: colors.icon }]}>{membersCount} members</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats row */}
      <View style={[styles.statsRowContainer, { marginBottom: 12 }]}>
        <View style={[styles.statCellBox, { borderColor: colors.elevated }]}>
          <Text style={[styles.statLabel, { color: colors.icon }]}>Total Spent</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>Rs {totalSpent.toLocaleString('en-IN')}</Text>
        </View>

        <View
          style={[
            styles.statCellBox,
            {
              borderColor: colors.elevated,
              backgroundColor: netBalance < 0 ? `${colors.coral}14` : `${colors.mint}14`,
            },
          ]}
        >
          <Text style={[styles.statLabel, { color: colors.icon }]}>{netBalanceLabel}</Text>
          <Text style={[styles.statValue, { color: netBalanceColor }]}>
            Rs {Math.abs(netBalance).toLocaleString('en-IN')}
          </Text>
        </View>

        <View style={[styles.statCellBox, { borderColor: colors.elevated }]}>
          <Text style={[styles.statLabel, { color: colors.icon }]}>Your Share</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>Rs {yourShare.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
        </View>
      </View>

      {/* Budget bar (trips only) */}
      {isTrip && budgetLimit && budgetLimit > 0 ? (
        <View style={styles.budgetWrap}>
          <View style={styles.budgetHeaderRow}>
            <Text style={[styles.budgetLabel, { color: colors.icon }]}>Trip Budget</Text>
            <Text style={[styles.budgetValue, { color: colors.text }]}>
              Rs {totalSpent.toLocaleString('en-IN')} / Rs {budgetLimit.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={[styles.budgetTrack, { backgroundColor: colors.elevated }]}>
            <View
              style={[
                styles.budgetFill,
                {
                  width: `${Math.max(0, budgetProgressPercent ?? 0)}%` as any,
                  backgroundColor: budgetProgress && budgetProgress >= 1 ? colors.coral : colors.mint,
                },
              ]}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  heroWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  heroTopRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuPlaceholder: {
    width: 32,
  },
  heroMainRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  emojiGlowWrap: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emojiGlow: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  groupEmojiHero: {
    fontSize: 52,
  },
  heroTextBlock: {
    flex: 1,
  },
  groupNameHero: {
    fontSize: 24,
    fontFamily: 'Syne_700Bold',
    marginBottom: 6,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontFamily: 'DMSans_600SemiBold',
  },
  tripMetaWrap: {
    marginBottom: 8,
    gap: 4,
  },
  tripMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tripMetaTextHero: {
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
  },
  membersHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  membersHeroText: {
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
  },
  statsRowContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: 8,
  },
  statCellBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'DMSans_500Medium',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 13,
    fontFamily: 'Syne_700Bold',
  },
  budgetWrap: {
    width: '100%',
    marginBottom: 4,
  },
  budgetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 8,
  },
  budgetLabel: {
    fontSize: 11,
    fontFamily: 'DMSans_500Medium',
  },
  budgetValue: {
    fontSize: 11,
    fontFamily: 'DMSans_600SemiBold',
  },
  budgetTrack: {
    height: 9,
    borderRadius: 12,
    overflow: 'hidden',
  },
  budgetFill: {
    height: '100%',
    borderRadius: 12,
  },
});
