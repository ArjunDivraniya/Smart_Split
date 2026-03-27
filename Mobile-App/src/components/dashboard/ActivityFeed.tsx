import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type FeedType = 'group-expense' | 'personal-expense' | 'settlement';

export interface FeedItem {
  id: string;
  title: string;
  subtitle: string;
  amount?: number;
  type: FeedType;
  date?: string;
}

interface ActivityFeedProps {
  items: FeedItem[];
  onItemPress?: (item: FeedItem) => void;
}

const formatAmount = (value?: number): string => {
  if (typeof value !== 'number') {
    return '';
  }
  return `₹${Math.abs(value).toLocaleString('en-IN')}`;
};

const metaByType: Record<FeedType, { icon: string; accent: string; label: string; sign: string }> = {
  'group-expense': {
    icon: '🔴',
    accent: '#FF5F7E',
    label: 'Group expense',
    sign: '-',
  },
  settlement: {
    icon: '🟢',
    accent: '#00E5B0',
    label: 'Settlement',
    sign: '+',
  },
  'personal-expense': {
    icon: '⚪',
    accent: '#E3E4F7',
    label: 'Personal',
    sign: '-',
  },
};

export function ActivityFeed({ items, onItemPress }: ActivityFeedProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Recent Activity</Text>
        <Text style={styles.caption}>Mixed feed</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyTitle}>No recent activity</Text>
          <Text style={styles.emptySubtitle}>Group, personal and settlement events appear here</Text>
        </View>
      ) : (
        items.map((item, index) => {
          const meta = metaByType[item.type];
          const amount = formatAmount(item.amount);

          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.itemRow, index < items.length - 1 && styles.itemSeparator]}
              activeOpacity={0.8}
              onPress={() => onItemPress?.(item)}
              disabled={!onItemPress}
            >
              <Text style={styles.itemIcon}>{meta.icon}</Text>

              <View style={styles.itemTextWrap}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.itemSubtitle} numberOfLines={1}>
                  {meta.label} · {item.subtitle}
                </Text>
              </View>

              {amount ? (
                <Text style={[styles.amount, { color: meta.accent }]}>
                  {meta.sign}
                  {amount}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );
}

export default ActivityFeed;

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#171727',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    color: '#F0F0FF',
    fontSize: 16,
    fontFamily: 'Syne_700Bold',
  },
  caption: {
    color: '#8888AA',
    fontSize: 11,
    fontFamily: 'DMSans_500Medium',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 11,
  },
  itemSeparator: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  itemIcon: {
    width: 24,
    textAlign: 'center',
    fontSize: 13,
  },
  itemTextWrap: {
    flex: 1,
  },
  itemTitle: {
    color: '#F0F0FF',
    fontSize: 13,
    fontFamily: 'DMSans_600SemiBold',
    marginBottom: 2,
  },
  itemSubtitle: {
    color: '#777796',
    fontSize: 11,
    fontFamily: 'DMSans_400Regular',
  },
  amount: {
    fontSize: 13,
    fontFamily: 'Syne_700Bold',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptyEmoji: {
    fontSize: 20,
    marginBottom: 6,
  },
  emptyTitle: {
    color: '#E3E4F7',
    fontSize: 13,
    fontFamily: 'DMSans_600SemiBold',
    marginBottom: 2,
  },
  emptySubtitle: {
    color: '#6F7091',
    fontSize: 11,
    fontFamily: 'DMSans_400Regular',
  },
});