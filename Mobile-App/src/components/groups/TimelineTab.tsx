// Mobile-App/src/components/groups/TimelineTab.tsx

import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Group, TripDay } from '@/src/types/group.types';
import { generateTripDays, getTripBudgetStatus } from '@/src/utils/tripDayCalculator';

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

interface TimelineTabProps {
  group: Group;
  expenses: any[];
  onExpenseTap?: (expenseId: string) => void;
}

export function TimelineTab({
  group,
  expenses,
  onExpenseTap,
}: TimelineTabProps) {
  const tripDays = useMemo(() => {
    return generateTripDays(group, expenses);
  }, [group, expenses]);

  const budgetStatus = useMemo(() => {
    if (!group.trackBudget || !group.tripBudget) return null;
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    return getTripBudgetStatus(group.tripBudget, totalExpenses);
  }, [group, expenses]);

  if (tripDays.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={48} color={COLORS.textMuted} />
        <Text style={styles.emptyText}>No expenses added yet</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Budget Status */}
      {budgetStatus && (
        <View style={styles.budgetSection}>
          <View style={styles.budgetHeader}>
            <Text style={styles.budgetTitle}>Trip Budget</Text>
            <Text style={styles.budgetAmount}>₹{group.tripBudget?.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${budgetStatus.percentage}%`,
                  backgroundColor:
                    budgetStatus.status === 'safe'
                      ? COLORS.mint
                      : budgetStatus.status === 'warning'
                      ? COLORS.amber
                      : COLORS.coral,
                },
              ]}
            />
          </View>

          <View style={styles.budgetStats}>
            <View>
              <Text style={styles.statLabel}>Spent</Text>
              <Text style={styles.statValue}>
                ₹{budgetStatus.spent.toLocaleString('en-IN')}
              </Text>
            </View>
            <View>
              <Text style={styles.statLabel}>Remaining</Text>
              <Text
                style={[
                  styles.statValue,
                  {
                    color:
                      budgetStatus.remaining >= 0 ? COLORS.mint : COLORS.coral,
                  },
                ]}
              >
                ₹{Math.abs(budgetStatus.remaining).toLocaleString('en-IN')}
              </Text>
            </View>
            <View>
              <Text style={styles.statLabel}>Usage</Text>
              <Text style={styles.statValue}>
                {Math.round(budgetStatus.percentage)}%
              </Text>
            </View>
          </View>

          {budgetStatus.status === 'warning' && (
            <View style={styles.warningBox}>
              <Ionicons name="alert-circle" size={14} color={COLORS.amber} />
              <Text style={styles.warningText}>
                You've spent over 80% of your budget!
              </Text>
            </View>
          )}
          {budgetStatus.status === 'exceeded' && (
            <View style={[styles.warningBox, { borderColor: `${COLORS.coral}30` }]}>
              <Ionicons name="alert-circle" size={14} color={COLORS.coral} />
              <Text style={[styles.warningText, { color: COLORS.coral }]}>
                Budget exceeded! You've spent more than planned.
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Timeline */}
      <View style={styles.timelineContainer}>
        {tripDays.map((day, index) => (
          <View key={day.dayNumber} style={styles.daySection}>
            {/* Day Header */}
            <View style={styles.dayHeader}>
              <View style={styles.dayInfo}>
                <Text style={styles.dayNumber}>Day {day.dayNumber}</Text>
                <Text style={styles.dayDate}>{day.dayName}</Text>
              </View>
              {day.totalSpent > 0 && (
                <Text style={styles.dayTotal}>
                  ₹{day.totalSpent.toLocaleString('en-IN')}
                </Text>
              )}
            </View>

            {/* Expenses for this day */}
            {day.expenses.length > 0 ? (
              <View style={styles.expensesList}>
                {day.expenses.map((expense) => (
                  <TouchableOpacity
                    key={expense.id}
                    style={styles.expenseItem}
                    onPress={() => onExpenseTap?.(expense.id)}
                    activeOpacity={0.6}
                  >
                    <View style={styles.expenseIcon}>
                      <Text style={styles.categoryEmoji}>🟣</Text>
                    </View>

                    <View style={styles.expenseInfo}>
                      <Text style={styles.expenseName}>
                        {expense.description}
                      </Text>
                      <Text style={styles.expenseCategory}>
                        {expense.category} • {expense.paidByName}
                      </Text>
                    </View>

                    <View style={styles.expenseAmount}>
                      <Text style={styles.amount}>
                        ₹{expense.amount.toLocaleString('en-IN')}
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={COLORS.textMuted}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.noExpenses}>
                <Text style={styles.noExpensesText}>No expenses on this day</Text>
              </View>
            )}

            {/* Divider */}
            {index < tripDays.length - 1 && <View style={styles.dayDivider} />}
          </View>
        ))}
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontFamily: 'DMSans_400Regular',
    marginTop: 12,
  },
  budgetSection: {
    backgroundColor: COLORS.elevated,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetTitle: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textSecondary,
  },
  budgetAmount: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Syne_800ExtraBold',
    color: COLORS.textPrimary,
  },
  progressBar: {
    height: 6,
    backgroundColor: `${COLORS.textMuted}20`,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  budgetStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: 'DMSans_400Regular',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: `${COLORS.amber}12`,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: `${COLORS.amber}30`,
  },
  warningText: {
    fontSize: 11,
    color: COLORS.amber,
    fontFamily: 'DMSans_400Regular',
    flex: 1,
  },
  timelineContainer: {
    marginBottom: 16,
  },
  daySection: {
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dayInfo: {
    flex: 1,
  },
  dayNumber: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.violet,
  },
  dayDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_400Regular',
    marginTop: 2,
  },
  dayTotal: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'Syne_800ExtraBold',
    color: COLORS.coral,
  },
  expensesList: {
    gap: 8,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: `${COLORS.violet}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  categoryEmoji: {
    fontSize: 18,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseName: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
  },
  expenseCategory: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: 'DMSans_400Regular',
    marginTop: 4,
  },
  expenseAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.coral,
  },
  noExpenses: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  noExpensesText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: 'DMSans_400Regular',
  },
  dayDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: 16,
  },
});
