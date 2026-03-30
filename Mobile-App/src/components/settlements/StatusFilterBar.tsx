import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SettlementStatus } from '@/src/types/settlement.types';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

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

interface PillConfig {
  label: string;
  value: FilterValue;
  color: string;
  bg: string;
  count: number;
  showAlertDot?: boolean;
}

export function StatusFilterBar({ activeFilter, onFilterChange, counts }: StatusFilterBarProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  const pills: PillConfig[] = [
    { 
      label: 'All', 
      value: 'all', 
      color: colors.violet, 
      bg: `${colors.violet}15`, 
      count: counts.all 
    },
    { 
      label: 'Pending', 
      value: 'pending', 
      color: colors.violet, 
      bg: `${colors.violet}15`, 
      count: counts.pending 
    },
    {
      label: 'Overdue',
      value: 'overdue',
      color: colors.coral,
      bg: `${colors.coral}15`,
      count: counts.overdue,
      showAlertDot: counts.overdue > 0,
    },
    { 
      label: 'Partial', 
      value: 'partial', 
      color: colors.amber, 
      bg: `${colors.amber}15`, 
      count: counts.partial 
    },
    { 
      label: 'Done', 
      value: 'completed', 
      color: colors.mint, 
      bg: `${colors.mint}15`, 
      count: counts.done 
    },
  ];

  return (
    <View style={styles.container}>
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
                {
                  backgroundColor: isActive ? pill.bg : colors.elevated,
                  borderColor: isActive ? `${pill.color}40` : `${colors.violet}15`,
                }
              ]}
              onPress={() => onFilterChange(pill.value)}
              activeOpacity={0.8}
            >
              <View style={styles.pillInner}>
                {pill.showAlertDot ? <View style={[styles.alertDot, { backgroundColor: colors.coral }]} /> : null}
                <Text style={[styles.pillText, { color: isActive ? pill.color : colors.icon }]}>
                  {pill.label}
                </Text>
                <View style={[styles.countBadge, { backgroundColor: isActive ? `${pill.color}20` : `${colors.icon}15` }]}>
                  <Text style={[styles.countText, { color: isActive ? pill.color : colors.tabIconDefault }]}>
                    {pill.count}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default StatusFilterBar;

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  contentContainer: {
    gap: 8,
    paddingHorizontal: 4,
  },
  pill: {
    height: 38,
    borderRadius: 999,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderWidth: 1,
    minWidth: 80,
  },
  pillInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  alertDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pillText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 10,
    fontFamily: 'Syne_700Bold',
  },
});
