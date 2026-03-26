import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Settlement } from '@/src/types/settlement.types';

const COLORS = {
  elevated: '#1A1A2B',
  border: 'rgba(255, 255, 255, 0.10)',
  textPrimary: '#F3F3FF',
  textSecondary: '#AAAAC4',
  textMuted: '#7D7D98',
  violet: '#7C5CFC',
  mint: '#00E5B0',
  coral: '#FF5F7E',
  amber: '#FFB547',
  overdueTint: 'rgba(255, 95, 126, 0.06)',
  overdueBanner: '#FF5F7E',
  ghostBg: 'rgba(255, 255, 255, 0.06)',
  avatarFallback1: '#6D5DF8',
  avatarFallback2: '#16A5F7',
  avatarFallback3: '#FF7A59',
  avatarFallback4: '#22C55E',
};

const AVATAR_BACKGROUNDS = [
  COLORS.avatarFallback1,
  COLORS.avatarFallback2,
  COLORS.avatarFallback3,
  COLORS.avatarFallback4,
];

interface SettlementCardProps {
  settlement: Settlement;
  currentUserId: string;
  expanded?: boolean;
  onPayNow: (settlement: Settlement) => void;
  onPayPartial: (settlement: Settlement) => void;
  onRemind: (settlement: Settlement) => void;
  onMarkReceived: (settlement: Settlement) => void;
  onExpand: (settlement: Settlement) => void;
}

const formatAmount = (value: number): string => `Rs ${Number(value || 0).toFixed(2)}`;

const formatExactDate = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '-';
  }

  return parsed.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function SettlementCard({
  settlement,
  currentUserId,
  expanded = false,
  onPayNow,
  onPayPartial,
  onRemind,
  onMarkReceived,
  onExpand,
}: SettlementCardProps) {
  const isOverdue = settlement.status === 'overdue';
  const isPartial = settlement.status === 'partial';
  const isYouOwe = settlement.direction === 'you_owe';

  const friendInitial = (settlement.friend?.name || '?').charAt(0).toUpperCase();
  const avatarColor = useMemo(() => {
    const charCode = friendInitial.charCodeAt(0) || 65;
    return AVATAR_BACKGROUNDS[charCode % AVATAR_BACKGROUNDS.length];
  }, [friendInitial]);

  const progressPct = useMemo(() => {
    if (!isPartial || settlement.amount <= 0) {
      return 0;
    }
    const pct = (settlement.amountPaid / settlement.amount) * 100;
    return Math.max(0, Math.min(100, pct));
  }, [isPartial, settlement.amountPaid, settlement.amount]);

  const amountText = isPartial
    ? `${formatAmount(settlement.remaining)} remaining`
    : formatAmount(settlement.amount);

  const amountColor = isPartial
    ? COLORS.amber
    : isYouOwe
      ? COLORS.coral
      : COLORS.mint;

  const groupLabel = settlement.group?.name || 'Personal';
  const groupEmoji = settlement.group?.emoji || '👤';
  const canShowActions = Boolean(currentUserId);

  return (
    <View style={[styles.card, isOverdue ? styles.cardOverdue : null]}>
      <View style={[styles.edgeStrip, { backgroundColor: isYouOwe ? COLORS.coral : COLORS.mint }]} />

      {isOverdue ? (
        <View style={styles.overdueBanner}>
          <Text style={styles.overdueBannerText}>⚠️ OVERDUE · {Math.max(1, settlement.daysPending)} days</Text>
        </View>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.92}
        style={[styles.body, isOverdue ? styles.bodyWithOverdueBanner : null]}
        onPress={() => onExpand(settlement)}
      >
        <View style={styles.topRow}>
          <View style={styles.friendBlock}>
            <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarText}>{friendInitial}</Text>
            </View>

            <Text style={styles.friendName} numberOfLines={1}>
              {settlement.friend?.name || 'Unknown'}
            </Text>
          </View>

          <Text style={[styles.amountText, { color: amountColor }]}>{amountText}</Text>
        </View>

        <View style={styles.middleRow}>
          <Text style={styles.metaText} numberOfLines={1}>
            {groupEmoji} {groupLabel} · {settlement.expenseDescription || 'Shared expense'}
          </Text>
        </View>

        {isPartial ? (
          <View style={styles.partialWrap}>
            <Text style={styles.partialLabel}>
              {formatAmount(settlement.amountPaid)} paid of {formatAmount(settlement.amount)} total
            </Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
            </View>
          </View>
        ) : null}

        <View style={styles.daysRow}>
          <Text style={styles.daysText}>{Math.max(0, settlement.daysPending)} days pending</Text>
        </View>
      </TouchableOpacity>

      {canShowActions ? (
        <View style={styles.actionsContainer}>
          <View style={styles.actionsRow}>
            {isYouOwe ? (
              <>
                <TouchableOpacity
                  style={[styles.btn, styles.btnPrimary]}
                  onPress={() => onPayNow(settlement)}
                  activeOpacity={0.9}
                >
                  <Text style={styles.btnPrimaryText}>{isPartial ? 'Pay Rest' : 'Pay Now'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.btnGhost]}
                  onPress={() => onPayPartial(settlement)}
                  activeOpacity={0.9}
                >
                  <Text style={styles.btnGhostText}>Pay Partial</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.btn, styles.btnGhost]}
                  onPress={() => onRemind(settlement)}
                  activeOpacity={0.9}
                >
                  <View style={styles.remindWrap}>
                    <Text style={styles.btnGhostText}>Remind</Text>
                    {isOverdue && settlement.remindCount > 0 ? (
                      <View style={styles.remindBadge}>
                        <Text style={styles.remindBadgeText}>{settlement.remindCount}</Text>
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.btnMint]}
                  onPress={() => onMarkReceived(settlement)}
                  activeOpacity={0.9}
                >
                  <Text style={styles.btnMintText}>Mark Received</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      ) : null}

      {expanded ? (
        <View style={styles.expandedSection}>
          <Text style={styles.expandedTitle}>Details</Text>
          <Text style={styles.expandedDescription}>
            {settlement.expenseDescription || 'No additional description'}
          </Text>

          <Text style={styles.expandedDate}>Date: {formatExactDate(settlement.createdAt)}</Text>

          <View style={styles.methodRow}>
            <View style={styles.methodChip}>
              <Text style={styles.methodChipText}>Cash</Text>
            </View>
            <View style={styles.methodChip}>
              <Text style={styles.methodChipText}>UPI</Text>
            </View>
            <View style={styles.methodChip}>
              <Text style={styles.methodChipText}>Bank</Text>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

export default SettlementCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  cardOverdue: {
    backgroundColor: COLORS.overdueTint,
  },
  edgeStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  overdueBanner: {
    position: 'absolute',
    top: 0,
    left: 3,
    right: 0,
    backgroundColor: COLORS.overdueBanner,
    paddingVertical: 6,
    paddingHorizontal: 10,
    zIndex: 2,
  },
  overdueBannerText: {
    color: '#FFFFFF',
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  body: {
    marginTop: 0,
  },
  bodyWithOverdueBanner: {
    marginTop: 24,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  friendBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontFamily: 'DMSans_700Bold',
    color: '#FFFFFF',
    fontSize: 15,
  },
  friendName: {
    fontFamily: 'DMSans_700Bold',
    color: COLORS.textPrimary,
    fontSize: 16,
    flex: 1,
  },
  amountText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 18,
    textAlign: 'right',
    maxWidth: '46%',
  },
  middleRow: {
    marginTop: 10,
  },
  metaText: {
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
  },
  partialWrap: {
    marginTop: 12,
  },
  partialLabel: {
    color: COLORS.amber,
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    marginBottom: 8,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 181, 71, 0.20)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: COLORS.amber,
  },
  daysRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  daysText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
    paddingRight: 10,
    flexShrink: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  actionsContainer: {
    marginTop: 8,
  },
  btn: {
    minHeight: 34,
    borderRadius: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  btnPrimary: {
    backgroundColor: COLORS.violet,
    borderColor: COLORS.violet,
  },
  btnMint: {
    backgroundColor: COLORS.mint,
    borderColor: COLORS.mint,
  },
  btnGhost: {
    backgroundColor: COLORS.ghostBg,
    borderColor: COLORS.border,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
  },
  btnMintText: {
    color: '#02130D',
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
  },
  btnGhostText: {
    color: COLORS.textPrimary,
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
  },
  remindWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  remindBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    backgroundColor: COLORS.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  remindBadgeText: {
    color: '#FFFFFF',
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    lineHeight: 11,
  },
  expandedSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    gap: 8,
  },
  expandedTitle: {
    color: COLORS.textPrimary,
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
  },
  expandedDescription: {
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    lineHeight: 18,
  },
  expandedDate: {
    color: COLORS.textMuted,
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  methodChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.ghostBg,
  },
  methodChipText: {
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
  },
});
