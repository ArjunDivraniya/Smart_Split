import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import SettlementCard from '@/src/components/settlements/SettlementCard';
import { EmptyState } from '@/components/EmptyState';
import { Settlement, SettlementStatus } from '@/src/types/settlement.types';

type FilterValue = SettlementStatus | 'all';

interface CombinedViewProps {
  settlements: Settlement[];
  currentUserId: string;
  activeFilter?: FilterValue;
  refreshing?: boolean;
  onRefresh?: () => void;
  onPayNow: (settlement: Settlement) => void;
  onPayPartial: (settlement: Settlement) => void;
  onShare: (settlement: Settlement) => void;
  onRemind: (settlement: Settlement) => void;
  onMarkReceived: (settlement: Settlement) => void;
}

const STATUS_PRIORITY: Record<SettlementStatus, number> = {
  overdue: 0,
  partial: 1,
  pending: 2,
  completed: 3,
};

const sameDay = (a: Date, b: Date): boolean => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const startOfDay = (date: Date): Date => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

const getDateLabel = (createdAt: string): string => {
  const createdDate = new Date(createdAt);
  if (Number.isNaN(createdDate.getTime())) {
    return 'Unknown Date';
  }

  const today = startOfDay(new Date());
  const thatDay = startOfDay(createdDate);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (sameDay(thatDay, today)) {
    return 'Today';
  }

  if (sameDay(thatDay, yesterday)) {
    return 'Yesterday';
  }

  const diffDays = Math.floor((today.getTime() - thatDay.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    return 'This Week';
  }

  return createdDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getDayKey = (createdAt: string): string => {
  const value = new Date(createdAt);
  if (Number.isNaN(value.getTime())) {
    return 'invalid-date';
  }

  return `${value.getFullYear()}-${value.getMonth()}-${value.getDate()}`;
};

const getEmptyStateContent = (activeFilter: FilterValue) => {
  if (activeFilter === 'overdue') {
    return {
      emoji: '✅',
      title: 'No overdue settlements',
      subtitle: 'You are fully on track. Keep it that way.',
    };
  }

  if (activeFilter === 'partial') {
    return {
      emoji: '💸',
      title: 'No partial payments found',
      subtitle: 'Partial payment entries will appear here.',
    };
  }

  if (activeFilter === 'all') {
    return {
      emoji: '🎉',
      title: 'All settled up!',
      subtitle: 'No open settlements to act on right now.',
    };
  }

  return {
    emoji: '📭',
    title: 'No settlements found',
    subtitle: 'Try changing filters to see more results.',
  };
};

export function CombinedView({
  settlements,
  currentUserId,
  activeFilter = 'all',
  refreshing = false,
  onRefresh,
  onPayNow,
  onPayPartial,
  onShare,
  onRemind,
  onMarkReceived,
}: CombinedViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sortedSettlements = useMemo(() => {
    const copied = [...settlements];

    copied.sort((a, b) => {
      const priorityDiff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      if (a.status === 'overdue' && b.status === 'overdue') {
        return (b.daysPending || 0) - (a.daysPending || 0);
      }

      if (a.status === 'pending' && b.status === 'pending') {
        return (b.amount || 0) - (a.amount || 0);
      }

      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return bTime - aTime;
    });

    return copied;
  }, [settlements]);

  const emptyContent = getEmptyStateContent(activeFilter);

  return (
    <FlatList
      data={sortedSettlements}
      keyExtractor={(item) => item.id}
      contentContainerStyle={sortedSettlements.length === 0 ? styles.emptyContainer : styles.listContainer}
      renderItem={({ item, index }) => {
        const previous = index > 0 ? sortedSettlements[index - 1] : null;
        const currentLabel = getDateLabel(item.createdAt);
        const currentDayKey = getDayKey(item.createdAt);
        const previousDayKey = previous ? getDayKey(previous.createdAt) : null;
        const showHeader = index === 0 || currentDayKey !== previousDayKey;

        return (
          <View style={styles.itemWrap}>
            {showHeader ? (
              <View style={styles.dateHeader}>
                <Text style={styles.dateHeaderText}>{currentLabel}</Text>
              </View>
            ) : null}

            <SettlementCard
              settlement={item}
              currentUserId={currentUserId}
              expanded={expandedId === item.id}
              onPayNow={onPayNow}
              onPayPartial={onPayPartial}
              onShare={onShare}
              onRemind={onRemind}
              onMarkReceived={onMarkReceived}
              onExpand={() => setExpandedId(expandedId === item.id ? null : item.id)}
            />
          </View>
        );
      }}
      ListEmptyComponent={
        <EmptyState
          emoji={emptyContent.emoji}
          title={emptyContent.title}
          subtitle={emptyContent.subtitle}
        />
      }
      refreshing={refreshing}
      onRefresh={onRefresh}
      showsVerticalScrollIndicator={false}
    />
  );
}

export default CombinedView;

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 18,
    gap: 12,
  },
  itemWrap: {
    marginBottom: 12,
  },
  dateHeader: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  dateHeaderText: {
    color: '#9A9AB6',
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  emptyState: {
    alignItems: 'center',
    maxWidth: 340,
  },
  emptyEmoji: {
    fontSize: 50,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#F3F3FF',
    fontSize: 20,
    lineHeight: 26,
    textAlign: 'center',
    fontFamily: 'Syne_700Bold',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: '#AAAAC4',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: 'DMSans_500Medium',
  },
});
