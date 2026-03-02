import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '@/src/services/api';

interface SummaryTabProps {
  groupId: string;
  currentUserId: string;
}

interface Summary {
  totalExpenses: number;
  totalAmount: number;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    count: number;
    percentage: number;
  }>;
  memberContributions: Array<{
    userId: string;
    userName: string;
    totalPaid: number;
    percentage: number;
  }>;
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#f59e0b',
  Transport: '#3b82f6',
  Accommodation: '#8b5cf6',
  Entertainment: '#ec4899',
  Shopping: '#10b981',
  Other: '#6366f1',
};

const { width } = Dimensions.get('window');
const chartWidth = width - 64;

export const SummaryTab: React.FC<SummaryTabProps> = ({
  groupId,
  currentUserId,
}) => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, [groupId]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await apiService.groups.getSummary(groupId);
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
      Alert.alert('Error', 'Failed to load summary');
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryChart = () => {
    if (!summary || summary.categoryBreakdown.length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Ionicons name="pie-chart-outline" size={48} color="#cbd5e1" />
          <Text style={styles.emptyChartText}>No category data</Text>
        </View>
      );
    }

    // Calculate total for percentage
    const total = summary.categoryBreakdown.reduce((sum, cat) => sum + cat.amount, 0);

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Category Breakdown</Text>
        
        {/* Simple bar chart */}
        <View style={styles.barsContainer}>
          {summary.categoryBreakdown.map((category) => {
            const percentage = (category.amount / total) * 100;
            const barWidth = (percentage / 100) * chartWidth;
            const color = CATEGORY_COLORS[category.category] || CATEGORY_COLORS.Other;

            return (
              <View key={category.category} style={styles.barRow}>
                <View style={styles.barLabelContainer}>
                  <View style={[styles.categoryDot, { backgroundColor: color }]} />
                  <Text style={styles.barLabel}>{category.category}</Text>
                </View>
                
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        width: barWidth,
                        backgroundColor: color,
                      },
                    ]}
                  >
                    <Text style={styles.barText}>₹{category.amount.toFixed(0)}</Text>
                  </View>
                </View>

                <Text style={styles.barPercentage}>{percentage.toFixed(1)}%</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderMemberContributions = () => {
    if (!summary || summary.memberContributions.length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Ionicons name="people-outline" size={48} color="#cbd5e1" />
          <Text style={styles.emptyChartText}>No member data</Text>
        </View>
      );
    }

    const maxAmount = Math.max(
      ...summary.memberContributions.map((m) => m.totalPaid)
    );

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Member Contributions</Text>
        
        <View style={styles.barsContainer}>
          {summary.memberContributions.map((member) => {
            const percentage = (member.totalPaid / maxAmount) * 100;
            const barWidth = (percentage / 100) * chartWidth;
            const isCurrentUser = member.userId === currentUserId;

            return (
              <View key={member.userId} style={styles.barRow}>
                <View style={styles.barLabelContainer}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>
                      {member.userName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.barLabel, isCurrentUser && styles.currentUserLabel]}>
                    {isCurrentUser ? 'You' : member.userName}
                  </Text>
                </View>
                
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        width: Math.max(barWidth, 40),
                        backgroundColor: isCurrentUser ? '#22c55e' : '#6366f1',
                      },
                    ]}
                  >
                    <Text style={styles.barText}>₹{member.totalPaid.toFixed(0)}</Text>
                  </View>
                </View>

                <Text style={styles.barPercentage}>{member.percentage.toFixed(1)}%</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderStatsCard = () => {
    if (!summary) return null;

    const avgExpense =
      summary.totalExpenses > 0
        ? summary.totalAmount / summary.totalExpenses
        : 0;

    return (
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Ionicons name="wallet" size={32} color="#6366f1" />
          <Text style={styles.statValue}>₹{summary.totalAmount.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Ionicons name="receipt" size={32} color="#f59e0b" />
          <Text style={styles.statValue}>{summary.totalExpenses}</Text>
          <Text style={styles.statLabel}>Total Expenses</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Ionicons name="trending-up" size={32} color="#22c55e" />
          <Text style={styles.statValue}>₹{avgExpense.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Avg. Expense</Text>
        </View>
      </View>
    );
  };

  const renderCategoryList = () => {
    if (!summary || summary.categoryBreakdown.length === 0) {
      return null;
    }

    return (
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Top Categories</Text>
        {summary.categoryBreakdown.slice(0, 5).map((category, index) => {
          const color = CATEGORY_COLORS[category.category] || CATEGORY_COLORS.Other;
          return (
            <View key={category.category} style={styles.listItem}>
              <View style={styles.listItemLeft}>
                <Text style={styles.listItemRank}>#{index + 1}</Text>
                <View style={[styles.categoryDot, { backgroundColor: color }]} />
                <Text style={styles.listItemLabel}>{category.category}</Text>
              </View>
              <View style={styles.listItemRight}>
                <Text style={styles.listItemValue}>₹{category.amount.toFixed(2)}</Text>
                <Text style={styles.listItemCount}>{category.count} expense{category.count > 1 ? 's' : ''}</Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="bar-chart-outline" size={64} color="#cbd5e1" />
        <Text style={styles.emptyTitle}>No summary available</Text>
        <Text style={styles.emptySubtitle}>
          Add some expenses to see analytics
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {renderStatsCard()}
      {renderCategoryChart()}
      {renderMemberContributions()}
      {renderCategoryList()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
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
  statsCard: {
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
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 20,
  },
  emptyChart: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyChartText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 12,
  },
  barsContainer: {
    gap: 16,
  },
  barRow: {
    gap: 8,
  },
  barLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  memberAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  memberAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  barLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  currentUserLabel: {
    color: '#22c55e',
  },
  barContainer: {
    height: 32,
  },
  bar: {
    height: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 8,
    minWidth: 40,
  },
  barText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  barPercentage: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  listContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listItemRank: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94a3b8',
    width: 32,
  },
  listItemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  listItemRight: {
    alignItems: 'flex-end',
  },
  listItemValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6366f1',
  },
  listItemCount: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
});
