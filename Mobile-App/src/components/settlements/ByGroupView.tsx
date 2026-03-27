import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SettlementCard from '@/src/components/settlements/SettlementCard';
import { Settlement } from '@/src/types/settlement.types';

interface ByGroupViewProps {
  groupedSettlements: Record<string, Settlement[]>;
  currentUserId: string;
  onPayNow: (settlement: Settlement) => void;
  onPayPartial: (settlement: Settlement) => void;
  onRemind: (settlement: Settlement) => void;
  onMarkReceived: (settlement: Settlement) => void;
}

interface GroupInfo {
  key: string;
  title: string;
  emoji: string;
  items: Settlement[];
}

const formatAmount = (value: number): string => `Rs ${Math.abs(value).toFixed(2)}`;

export function ByGroupView({
  groupedSettlements,
  currentUserId,
  onPayNow,
  onPayPartial,
  onRemind,
  onMarkReceived,
}: ByGroupViewProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const groups = useMemo(() => {
    const entries = Object.entries(groupedSettlements || {});

    const mapped: GroupInfo[] = entries.map(([key, items]) => {
      if (key === 'direct') {
        return {
          key,
          title: '💰 Direct Settlements',
          emoji: '',
          items,
        };
      }

      const first = items[0];
      return {
        key,
        title: first?.group?.name || 'Group',
        emoji: first?.group?.emoji || '👥',
        items,
      };
    });

    mapped.sort((a, b) => {
      if (a.key === 'direct') return 1;
      if (b.key === 'direct') return -1;
      return a.title.localeCompare(b.title);
    });

    return mapped;
  }, [groupedSettlements]);

  useEffect(() => {
    const next = new Set<string>();

    groups.forEach((group) => {
      const hasOverdue = group.items.some((item) => item.status === 'overdue');
      const allCompleted = group.items.length > 0 && group.items.every((item) => item.status === 'completed');

      if (allCompleted && !hasOverdue) {
        next.add(group.key);
      }
    });

    setCollapsedGroups(next);
  }, [groups]);

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {groups.map((group) => {
        const isCollapsed = collapsedGroups.has(group.key);

        const netBalance = group.items.reduce((sum, item) => {
          const value = item.status === 'completed' ? 0 : Number(item.remaining || item.amount || 0);
          return sum + (item.direction === 'they_owe' ? value : -value);
        }, 0);

        const netColor = netBalance >= 0 ? '#00E5B0' : '#FF5F7E';

        const hasPending = group.items.some((item) => item.status !== 'completed');

        return (
          <View key={group.key} style={styles.groupWrap}>
            <TouchableOpacity
              style={styles.groupHeader}
              activeOpacity={0.9}
              onPress={() => toggleGroup(group.key)}
            >
              <View style={styles.groupLeft}>
                {group.key !== 'direct' ? <Text style={styles.groupEmoji}>{group.emoji}</Text> : null}
                <Text style={styles.groupTitle}>{group.title}</Text>
              </View>

              <View style={styles.groupRight}>
                <Text style={[styles.netText, { color: netColor }]}>
                  {netBalance >= 0 ? '+' : '-'}{formatAmount(netBalance)}
                </Text>
                <Text style={styles.chevron}>{isCollapsed ? '▸' : '▾'}</Text>
              </View>
            </TouchableOpacity>

            {!isCollapsed ? (
              <View style={styles.cardsWrap}>
                {group.items.map((settlement) => (
                  <View key={settlement.id} style={styles.cardItem}>
                    <SettlementCard
                      settlement={settlement}
                      currentUserId={currentUserId}
                      expanded={expandedId === settlement.id}
                      onPayNow={onPayNow}
                      onPayPartial={onPayPartial}
                      onRemind={onRemind}
                      onMarkReceived={onMarkReceived}
                      onExpand={() => setExpandedId(expandedId === settlement.id ? null : settlement.id)}
                    />
                  </View>
                ))}

                {hasPending ? (
                  <TouchableOpacity style={styles.footerGhostBtn} activeOpacity={0.9}>
                    <Text style={styles.footerGhostText}>Settle all in this group →</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}
          </View>
        );
      })}
    </ScrollView>
  );
}

export default ByGroupView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    gap: 12,
    paddingBottom: 20,
  },
  groupWrap: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    backgroundColor: '#121222',
    overflow: 'hidden',
  },
  groupHeader: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  groupLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  groupEmoji: {
    fontSize: 24,
    lineHeight: 26,
  },
  groupTitle: {
    color: '#F3F3FF',
    fontSize: 15,
    fontFamily: 'DMSans_700Bold',
    flexShrink: 1,
  },
  groupRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  netText: {
    fontSize: 13,
    fontFamily: 'Syne_700Bold',
  },
  chevron: {
    color: '#9A9AB6',
    fontSize: 14,
    fontFamily: 'DMSans_700Bold',
  },
  cardsWrap: {
    padding: 10,
    gap: 10,
  },
  cardItem: {
    marginBottom: 2,
  },
  footerGhostBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  footerGhostText: {
    color: '#C7C7DF',
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
  },
});
