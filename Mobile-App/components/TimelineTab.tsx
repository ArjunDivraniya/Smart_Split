import React, { useState, useEffect } from 'react';
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
import { apiService } from '@/src/services/api';
import { ExpenseItem } from '@/components/ExpenseItem';

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
  const [timelineData, setTimelineData] = useState<TimelineDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTimeline();
  }, [groupId]);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const response = await apiService.groups.getTimeline(groupId);
      const timeline = response.data?.timeline || [];
      setTimelineData(timeline);
      
      // Auto-expand the most recent day
      if (timeline.length > 0) {
        setExpandedDays(new Set([timeline[0].date]));
      }
    } catch (error) {
      console.error('Error fetching timeline:', error);
      Alert.alert('Error', 'Failed to load timeline');
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
        style={styles.dayHeader}
        onPress={() => toggleDay(day.date)}
        activeOpacity={0.7}
      >
        <View style={styles.dayHeaderLeft}>
          <View style={styles.dayDot} />
          <View style={styles.dayHeaderText}>
            <Text style={styles.dayName}>{dayName}</Text>
            <Text style={styles.dateStr}>{dateStr}</Text>
          </View>
        </View>

        <View style={styles.dayHeaderRight}>
          <View style={styles.dayStats}>
            <Text style={styles.expenseCount}>{day.expenses.length} expense{day.expenses.length > 1 ? 's' : ''}</Text>
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
            {item.expenses.map((expense) => (
              <ExpenseItem
                key={expense._id}
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
      <Text style={styles.emptyTitle}>No timeline yet</Text>
      <Text style={styles.emptySubtitle}>
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
      <View style={styles.summaryCard}>
        <View style={styles.summaryColumn}>
          <Text style={styles.summaryValue}>{activeDays}</Text>
          <Text style={styles.summaryLabel}>Days</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryColumn}>
          <Text style={styles.summaryValue}>{totalExpenses}</Text>
          <Text style={styles.summaryLabel}>Expenses</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryColumn}>
          <Text style={styles.summaryValue}>₹{totalAmount.toFixed(0)}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
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
    <View style={styles.container}>
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
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
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
    color: '#6366f1',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
  },
  dayContainer: {
    marginBottom: 8,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
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
    backgroundColor: '#6366f1',
    marginRight: 12,
  },
  dayHeaderText: {
    flex: 1,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  dateStr: {
    fontSize: 13,
    color: '#64748b',
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
    color: '#6366f1',
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
    color: '#1e293b',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
});
