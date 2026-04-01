import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { apiService } from '@/src/services/api';
import { ExpenseItem } from '@/components/ExpenseItem';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const toSafeKey = (value: unknown, fallback: string): string => {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === 'object') {
    const objectValue = value as Record<string, any>;
    const nestedId = objectValue._id || objectValue.id || objectValue.$oid;
    return nestedId ? String(nestedId).trim() : fallback;
  }

  const normalized = String(value).trim();
  return normalized || fallback;
};

interface TimelineTabProps {
  groupId: string;
  currentUserId: string;
}

interface TimelineDay {
  date: string;
  expenses: any[];
  totalAmount: number;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({
  groupId,
  currentUserId,
}) => {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors.dark; // Force dark theme for consistency
  const [timelineData, setTimelineData] = useState<TimelineDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (groupId) {
      setLoading(true);
      fetchTimeline();
    }
  }, [groupId]);

  useFocusEffect(
    useCallback(() => {
      if (groupId) {
        fetchTimeline();
      }
    }, [groupId])
  );

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const response = await apiService.groups.getTimeline(groupId);
      const payload = response?.data?.data || response?.data || {};
      
      // Get expenses array - could be in different formats
      const expensesData = payload?.expenses || payload?.data || [];
      const expensesArray = Array.isArray(expensesData) ? expensesData : [];
      
      // Group expenses by date
      const groupedByDate: Record<string, any[]> = {};
      
      expensesArray.forEach((expense: any) => {
        const expenseDate = new Date(expense.date || expense.createdAt);
        const dateKey = expenseDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        if (!groupedByDate[dateKey]) {
          groupedByDate[dateKey] = [];
        }
        groupedByDate[dateKey].push(expense);
      });
      
      // Convert to timeline array sorted by date descending
      const timeline = Object.entries(groupedByDate)
        .map(([date, expenses]) => ({
          date,
          expenses: expenses || [],
          totalAmount: (expenses || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setTimelineData(timeline);
      
      // Auto-expand the most recent day
      if (timeline.length > 0) {
        setExpandedDays(new Set([timeline[0].date]));
      }
    } catch (error) {
      console.error('Error fetching timeline:', error);
      Alert.alert('Error', 'Failed to load timeline');
      setTimelineData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTimeline();
  };

  const toggleDay = (date: string) => {
    setExpandedDays((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  const renderDayHeader = (day: TimelineDay) => {
    const isExpanded = expandedDays.has(day.date);
    const date = new Date(day.date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <TouchableOpacity
        style={[styles.dayHeader, { backgroundColor: colors.card, borderColor: colors.elevated }]}
        onPress={() => toggleDay(day.date)}
        activeOpacity={0.7}
      >
        <View style={styles.dayHeaderLeft}>
          <View style={styles.dayDot} />
          <View style={styles.dayHeaderText}>
            <Text style={[styles.dayName, { color: colors.text }]}>{dayName}</Text>
            <Text style={[styles.dateStr, { color: colors.icon }]}>{dateStr}</Text>
          </View>
        </View>

        <View style={styles.dayHeaderRight}>
          <View style={styles.dayStats}>
            <Text style={[styles.expenseCount, { color: colors.icon }]}>{day.expenses.length} expense{day.expenses.length > 1 ? 's' : ''}</Text>
            <Text style={styles.dayTotal}>₹{day.totalAmount.toFixed(2)}</Text>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#6366f1"
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderDay = ({ item }: { item: TimelineDay }) => {
    const isExpanded = expandedDays.has(item.date);

    return (
      <View style={styles.dayContainer}>
        {renderDayHeader(item)}
        
        {isExpanded && (
          <View style={styles.expensesContainer}>
            {item.expenses.map((expense, index) => (
              <ExpenseItem
                key={toSafeKey(expense._id, `${item.date}-expense-${index}`)}
                expense={expense}
                currentUserId={currentUserId}
                onPress={() => {
                  // TODO: Navigate to expense detail
                }}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No timeline yet</Text>
      <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
        Expenses will appear here organized by date
      </Text>
    </View>
  );

  const renderSummaryCard = () => {
    const totalExpenses = timelineData.reduce(
      (sum, day) => sum + day.expenses.length,
      0
    );
    const totalAmount = timelineData.reduce(
      (sum, day) => sum + day.totalAmount,
      0
    );
    const activeDays = timelineData.length;

    return (
      <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.elevated }]}>
        <View style={styles.summaryColumn}>
          <Text style={styles.summaryValue}>{activeDays}</Text>
          <Text style={[styles.summaryLabel, { color: colors.icon }]}>Days</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.elevated }]} />
        <View style={styles.summaryColumn}>
          <Text style={styles.summaryValue}>{totalExpenses}</Text>
          <Text style={[styles.summaryLabel, { color: colors.icon }]}>Expenses</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.elevated }]} />
        <View style={styles.summaryColumn}>
          <Text style={styles.summaryValue}>₹{totalAmount.toFixed(0)}</Text>
          <Text style={[styles.summaryLabel, { color: colors.icon }]}>Total</Text>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={timelineData}
        keyExtractor={(item) => item.date}
        renderItem={renderDay}
        ListHeaderComponent={timelineData.length > 0 ? renderSummaryCard() : null}
        ListEmptyComponent={renderEmptyState()}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={timelineData.length === 0 && styles.emptyList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    flexDirection: 'row',
    borderWidth: 1,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryColumn: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.dark.violet,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.dark.icon,
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.dark.elevated,
  },
  dayContainer: {
    marginBottom: 8,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dayDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.dark.violet,
    marginRight: 12,
  },
  dayHeaderText: {
    flex: 1,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  dateStr: {
    fontSize: 13,
    color: Colors.dark.icon,
    marginTop: 2,
  },
  dayHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayStats: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  expenseCount: {
    fontSize: 12,
    color: '#64748b',
  },
  dayTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.violet,
    marginTop: 2,
  },
  expensesContainer: {
    marginTop: 8,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.dark.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.dark.icon,
    marginTop: 8,
    textAlign: 'center',
  },
});
