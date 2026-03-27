import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SettlementStatus } from '@/src/types/settlement.types';

type FilterValue = SettlementStatus | 'all';

interface StatusCounts {
  all: number;
  pending: number;
  overdue: number;
  partial: number;
  done: number;
}

interface StatusFilterBarProps {
  activeFilter: FilterValue;
  onFilterChange: (filter: FilterValue) => void;
  counts: StatusCounts;
}

const COLORS = {
  elevated: '#1A1A2B',
  borderMuted: 'rgba(255, 255, 255, 0.10)',
  textMuted: '#9A9AB6',
  violet: '#7C5CFC',
  violetBg: 'rgba(124, 92, 252, 0.14)',
  coral: '#FF5F7E',
  coralBg: 'rgba(255, 95, 126, 0.14)',
  amber: '#FFB547',
  amberBg: 'rgba(255, 181, 71, 0.16)',
  done: '#8B8BA9',
  doneBg: 'rgba(139, 139, 169, 0.14)',
  dangerDot: '#FF4D6D',
};

interface PillConfig {
  label: string;
  value: FilterValue;
  color: string;
  bg: string;
  count: number;
  showAlertDot?: boolean;
}

export function StatusFilterBar({ activeFilter, onFilterChange, counts }: StatusFilterBarProps) {
  const pills: PillConfig[] = [
    { label: 'All', value: 'all', color: COLORS.violet, bg: COLORS.violetBg, count: counts.all },
    { label: 'Pending', value: 'pending', color: COLORS.violet, bg: COLORS.violetBg, count: counts.pending },
    {
      label: 'Overdue',
      value: 'overdue',
      color: COLORS.coral,
      bg: COLORS.coralBg,
      count: counts.overdue,
      showAlertDot: counts.overdue > 0,
    },
    { label: 'Partial', value: 'partial', color: COLORS.amber, bg: COLORS.amberBg, count: counts.partial },
    { label: 'Done', value: 'completed', color: COLORS.done, bg: COLORS.doneBg, count: counts.done },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {pills.map((pill) => {
        const isActive = activeFilter === pill.value;

        return (
          <TouchableOpacity
            key={pill.value}
            style={[
              styles.pill,
              isActive
                ? {
                    backgroundColor: pill.bg,
                    borderColor: `${pill.color}4D`,
                  }
                : styles.pillInactive,
            ]}
            onPress={() => onFilterChange(pill.value)}
            activeOpacity={0.9}
          >
            <View style={styles.pillInner}>
              {pill.showAlertDot ? <View style={styles.alertDot} /> : null}
              <Text style={[styles.pillText, isActive ? { color: pill.color } : styles.pillTextInactive]}>
                {pill.label} ({pill.count})
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export default StatusFilterBar;

const styles = StyleSheet.create({
  contentContainer: {
    gap: 10,
    paddingVertical: 2,
    paddingHorizontal: 1,
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
  },
  pillInactive: {
    backgroundColor: COLORS.elevated,
    borderColor: COLORS.borderMuted,
  },
  pillInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.dangerDot,
  },
  pillText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
  },
  pillTextInactive: {
    color: COLORS.textMuted,
  },
});
