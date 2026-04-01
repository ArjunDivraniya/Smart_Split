import React, { useState, useEffect, useCallback } from 'react';
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
import { useFocusEffect } from 'expo-router';
import { apiService } from '@/src/services/api';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

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

interface SettlementHistory {
  id: string;
  fromUserName: string;
  toUserName: string;
  amount: number;
  note?: string;
  createdAt?: string;
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
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors.dark; // Force dark theme for consistency
  const [summary, setSummary] = useState<Summary | null>(null);
  const [settlementHistory, setSettlementHistory] = useState<SettlementHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (groupId) {
      setLoading(true);
      Promise.all([fetchSummary(), fetchSettlementHistory()]);
    }
  }, [groupId]);

  useFocusEffect(
    useCallback(() => {
      if (groupId) {
        Promise.all([fetchSummary(), fetchSettlementHistory()]);
      }
    }, [groupId])
  );

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await apiService.groups.getSummary(groupId);
      const summaryData = response?.data?.data || response?.data || null;
      
      if (!summaryData) {
        setSummary(null);
        return;
      }
      
      // Transform backend response to frontend format
      const categoryBreakdownObj = summaryData.categoryBreakdown || {};
      const memberContributionsArray = summaryData.perMemberContribution || summaryData.memberContributions || [];
      
      // Convert category breakdown object to array
      const total = Object.values(categoryBreakdownObj).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
      
      const categoryBreakdown = Object.entries(categoryBreakdownObj).map(([category, amount]: [string, any]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        amount: Number(amount) || 0,
        count: 1, // Count not provided in backend, set to 1
        percentage: total > 0 ? (Number(amount) / total) * 100 : 0,
      }));
      
      // Transform member contributions
      const memberContributions = memberContributionsArray.map((member: any) => ({
        userId: member.userId || '',
        userName: member.userName || 'Unknown',
        totalPaid: Number(member.amount || member.totalPaid || 0),
        percentage: total > 0 ? (Number(member.amount || member.totalPaid || 0) / total) * 100 : 0,
      }));
      
      const transformedSummary: Summary = {
        totalExpenses: summaryData.expenseCount || 0,
        totalAmount: summaryData.totalGroupSpend || total,
        categoryBreakdown,
        memberContributions,
      };
      
      setSummary(transformedSummary);
    } catch (error) {
      console.error('Error fetching summary:', error);
      Alert.alert('Error', 'Failed to load summary');
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettlementHistory = async () => {
    try {
      const response = await apiService.settlements.getGroupHistory(groupId);
      const data = response?.data?.data || response?.data || [];
      
      const settlements: SettlementHistory[] = (Array.isArray(data) ? data : []).map((item: any, index: number) => ({
        id: item.id || item._id || `settlement-${index}`,
        fromUserName: item.fromUserName || item.fromUser?.name || 'Unknown',
        toUserName: item.toUserName || item.toUser?.name || 'Unknown',
        amount: Number(item.amount || 0),
        note: item.note || '',
        createdAt: item.createdAt,
      }));
      
      setSettlementHistory(settlements);
    } catch (error) {
      console.error('Error fetching settlement history:', error);
      setSettlementHistory([]);
    }
  };

  const renderCategoryChart = () => {
    if (!summary || summary.categoryBreakdown.length === 0) {
      return (
        <View style={[styles.emptyChart, { backgroundColor: colors.card, borderColor: colors.elevated }]}>
          <Ionicons name="pie-chart-outline" size={48} color="#cbd5e1" />
          <Text style={[styles.emptyChartText, { color: colors.icon }]}>No category data</Text>
        </View>
      );
    }

    // Calculate total for percentage
    const total = summary.categoryBreakdown.reduce((sum, cat) => sum + cat.amount, 0);

    return (
      <View style={[styles.chartContainer, { backgroundColor: colors.card, borderColor: colors.elevated }]}> 
        <Text style={[styles.chartTitle, { color: colors.text }]}>Category Breakdown</Text>
        
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
                  <Text style={[styles.barLabel, { color: colors.text }]}>{category.category}</Text>
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

                <Text style={[styles.barPercentage, { color: colors.icon }]}>{percentage.toFixed(1)}%</Text>
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
        <View style={[styles.emptyChart, { backgroundColor: colors.card, borderColor: colors.elevated }]}>
          <Ionicons name="people-outline" size={48} color="#cbd5e1" />
          <Text style={[styles.emptyChartText, { color: colors.icon }]}>No member data</Text>
        </View>
      );
    }

    const maxAmount = Math.max(
      ...summary.memberContributions.map((m) => m.totalPaid)
    );

    return (
      <View style={[styles.chartContainer, { backgroundColor: colors.card, borderColor: colors.elevated }]}> 
        <Text style={[styles.chartTitle, { color: colors.text }]}>Member Contributions</Text>
        
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

                <Text style={[styles.barPercentage, { color: colors.icon }]}>{member.percentage.toFixed(1)}%</Text>
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
      <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.elevated }]}> 
        <View style={styles.statItem}>
          <Ionicons name="wallet" size={32} color="#6366f1" />
          <Text style={[styles.statValue, { color: colors.text }]}>₹{summary.totalAmount.toFixed(2)}</Text>
          <Text style={[styles.statLabel, { color: colors.icon }]}>Total Spent</Text>
        </View>

        <View style={[styles.statDivider, { backgroundColor: colors.elevated }]} />

        <View style={styles.statItem}>
          <Ionicons name="receipt" size={32} color="#f59e0b" />
          <Text style={[styles.statValue, { color: colors.text }]}>{summary.totalExpenses}</Text>
          <Text style={[styles.statLabel, { color: colors.icon }]}>Total Expenses</Text>
        </View>

        <View style={[styles.statDivider, { backgroundColor: colors.elevated }]} />

        <View style={styles.statItem}>
          <Ionicons name="trending-up" size={32} color="#22c55e" />
          <Text style={[styles.statValue, { color: colors.text }]}>₹{avgExpense.toFixed(2)}</Text>
          <Text style={[styles.statLabel, { color: colors.icon }]}>Avg. Expense</Text>
        </View>
      </View>
    );
  };

  const renderCategoryList = () => {
    if (!summary || summary.categoryBreakdown.length === 0) {
      return null;
    }

    return (
      <View style={[styles.listContainer, { backgroundColor: colors.card, borderColor: colors.elevated }]}> 
        <Text style={[styles.listTitle, { color: colors.text }]}>Top Categories</Text>
        {summary.categoryBreakdown.slice(0, 5).map((category, index) => {
          const color = CATEGORY_COLORS[category.category] || CATEGORY_COLORS.Other;
          return (
            <View key={category.category} style={[styles.listItem, { borderBottomColor: colors.elevated }]}>
              <View style={styles.listItemLeft}>
                <Text style={[styles.listItemRank, { color: colors.icon }]}>#{index + 1}</Text>
                <View style={[styles.categoryDot, { backgroundColor: color }]} />
                <Text style={[styles.listItemLabel, { color: colors.text }]}>{category.category}</Text>
              </View>
              <View style={styles.listItemRight}>
                <Text style={[styles.listItemValue, { color: colors.text }]}>₹{category.amount.toFixed(2)}</Text>
                <Text style={[styles.listItemCount, { color: colors.icon }]}>{category.count} expense{category.count > 1 ? 's' : ''}</Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderSettlementHistory = () => {
    if (settlementHistory.length === 0) {
      return (
        <View style={[styles.emptyHistory, { backgroundColor: colors.card, borderColor: colors.elevated }]}>
          <Ionicons name="swap-horizontal-outline" size={48} color="#cbd5e1" />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No settlements yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.icon }]}>Settlements will appear here</Text>
        </View>
      );
    }

    return (
      <View style={[styles.listContainer, { backgroundColor: colors.card, borderColor: colors.elevated }]}>
        <Text style={[styles.listTitle, { color: colors.text }]}>Settlement History</Text>
        {settlementHistory.slice(0, 10).map((settlement, index) => (
          <View key={settlement.id} style={[styles.listItem, { borderBottomColor: colors.elevated }]}>
            <View style={styles.listItemLeft}>
              <View style={styles.settlementAvatars}>
                <View style={[styles.avatar, { backgroundColor: '#6366f1' }]}>
                  <Text style={styles.avatarText}>{settlement.fromUserName.charAt(0).toUpperCase()}</Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color={colors.icon} style={styles.arrow} />
                <View style={[styles.avatar, { backgroundColor: '#22c55e' }]}>
                  <Text style={styles.avatarText}>{settlement.toUserName.charAt(0).toUpperCase()}</Text>
                </View>
              </View>
              <View style={styles.settlementInfo}>
                <Text style={[styles.settlementFromTo, { color: colors.text }]}>
                  {settlement.fromUserName} → {settlement.toUserName}
                </Text>
                {settlement.note && (
                  <Text style={[styles.settlementNote, { color: colors.icon }]} numberOfLines={1}>
                    {settlement.note}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.listItemRight}>
              <Text style={[styles.settleAmount, { color: colors.text }]}>
                ₹{settlement.amount.toFixed(2)}
              </Text>
              {settlement.createdAt && (
                <Text style={[styles.settlementDate, { color: colors.icon }]}>
                  {new Date(settlement.createdAt).toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="bar-chart-outline" size={64} color="#cbd5e1" />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No summary available</Text>
        <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
          Add some expenses to see analytics
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {renderStatsCard()}
      {renderCategoryChart()}
      {renderMemberContributions()}
      {renderCategoryList()}
      {renderSettlementHistory()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    color: Colors.dark.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.dark.icon,
    marginTop: 8,
    textAlign: 'center',
  },
  statsCard: {
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
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.dark.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.icon,
    marginTop: 4,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
  },
  chartContainer: {
    borderWidth: 1,
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
    color: Colors.dark.text,
    marginBottom: 20,
  },
  emptyChart: {
    borderWidth: 1,
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
    color: Colors.dark.text,
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
    color: Colors.dark.icon,
    width: 32,
  },
  listItemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  listItemRight: {
    alignItems: 'flex-end',
  },
  listItemValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.violet,
  },
  listItemCount: {
    fontSize: 12,
    color: Colors.dark.icon,
    marginTop: 2,
  },
    emptyHistory: {
      marginHorizontal: 16,
      marginBottom: 16,
      padding: 40,
      borderRadius: 16,
      alignItems: 'center',
      borderWidth: 1,
    },
    settlementAvatars: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 12,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#ffffff',
    },
    arrow: {
      marginHorizontal: 8,
    },
    settlementInfo: {
      flex: 1,
    },
    settlementFromTo: {
      fontSize: 14,
      fontWeight: '600',
      color: Colors.dark.text,
    },
    settlementNote: {
      fontSize: 12,
      color: Colors.dark.icon,
      marginTop: 2,
    },
    settleAmount: {
      fontSize: 15,
      fontWeight: '700',
      color: Colors.dark.text,
    },
    settlementDate: {
      fontSize: 11,
      color: Colors.dark.icon,
      marginTop: 2,
    },
});
