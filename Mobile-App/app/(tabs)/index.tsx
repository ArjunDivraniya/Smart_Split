import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { BalanceSummaryCard } from '@/src/components/BalanceSummaryCard';
import { ActivityItem, ActivityItemData } from '@/src/components/ActivityItem';
import SettlementWidget from '@/src/components/dashboard/SettlementWidget';
import { apiService } from '@/src/services/api';
import { STORAGE_KEYS } from '@/src/constants/categories';

const COLORS = {
  void: '#080810',
  surface: '#0F0F1A',
  elevated: '#1A1A2B',
  violet: '#7C5CFC',
  violetLight: '#9B7FFF',
  violetDim: 'rgba(124, 92, 252, 0.15)',
  mint: '#00E5B0',
  coral: '#FF5F7E',
  coralDim: 'rgba(255, 95, 126, 0.12)',
  amber: '#FFB547',
  textPrimary: '#F0F0FF',
  textSecondary: '#8888AA',
  textMuted: '#55556A',
  border: 'rgba(255, 255, 255, 0.06)',
};

interface UserData {
  name: string;
  email: string;
  id: string;
}

interface FinancialSummary {
  totalOwe: number;
  totalGet: number;
  monthlySpend: number;
  savingsGoal: number;
  savingsProgress: number;
}

interface SmartAlert {
  type: 'warning' | 'success' | 'info';
  icon: string;
  message: string;
  borderColor: string;
}

export default function DashboardScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [financialData, setFinancialData] = useState<FinancialSummary>({
    totalOwe: 0,
    totalGet: 0,
    monthlySpend: 0,
    savingsGoal: 5000,
    savingsProgress: 0,
  });
  const [notificationCount, setNotificationCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<ActivityItemData[]>([]);
  const [greeting, setGreeting] = useState('Good morning');
  const [smartAlert, setSmartAlert] = useState<SmartAlert | null>(null);
  const [topCategory, setTopCategory] = useState({ name: 'Food', amount: 0, emoji: '🍔' });

  useEffect(() => {
    loadUserData();
    setGreeting(getGreeting());
    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning 🌅';
    if (hour < 18) return 'Good afternoon ☀️';
    return 'Good evening 🌙';
  };

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch user profile
      try {
        const userResponse = await apiService.user.getMe();
        if (userResponse.data) {
          setUser(userResponse.data);
          await AsyncStorage.setItem(
            STORAGE_KEYS.USER_DATA,
            JSON.stringify(userResponse.data)
          );
        }
      } catch (error) {
        console.log('Could not fetch user profile:', error);
      }

      // 2. Fetch dashboard summary (financial data + smart alerts)
      try {
        const summaryResponse = await apiService.analytics.getDashboardSummary();
        if (summaryResponse.data?.success) {
          const { financial, smartAlert: alert } = summaryResponse.data.data;
          
          // Update financial data
          setFinancialData(prev => ({
            ...prev,
            totalOwe: financial.totalOwe || 0,
            totalGet: financial.totalGet || 0,
            monthlySpend: financial.monthlySpend || 0,
          }));

          // Update smart alert
          if (alert) {
            setSmartAlert(alert);
          }
        }
      } catch (error) {
        console.log('Could not fetch dashboard summary:', error);
        // Fallback smart alert
        setSmartAlert({
          type: 'info',
          icon: '🎯',
          message: 'Create your first trip to start tracking expenses!',
          borderColor: COLORS.violet,
        });
      }

      // 3. Fetch notifications
      try {
        const notifResponse = await apiService.notifications.getAll();
        const unreadCount = notifResponse.data?.filter((n: any) => !n.read).length || 0;
        setNotificationCount(unreadCount);
      } catch (error) {
        console.log('Could not fetch notifications:', error);
        setNotificationCount(0);
      }

      // 4. Fetch recent activity
      try {
        const activityResponse = await apiService.analytics.getRecentActivity();
        if (activityResponse.data?.success) {
          setRecentActivity(activityResponse.data.data || []);
        }
      } catch (error) {
        console.log('Could not fetch recent activity:', error);
        // Fallback activity
        setRecentActivity([
          {
            id: '1',
            name: 'Welcome to SmartSplit!',
            description: 'Start by creating a trip or adding an expense',
            amount: 0,
            type: 'personal',
            avatarLabel: '👋',
            avatarColor: 'rgba(124, 92, 252, 0.2)',
          },
        ]);
      }

        // 4b. Fetch user settlements
        try {
          const settlementsResponse = await apiService.settlements.getUserSettlements();
          const settlements = settlementsResponse.data?.data || [];
          if (Array.isArray(settlements) && settlements.length > 0) {
            // Convert settlements to activity format
            const settlementActivities = settlements.slice(0, 3).map((settlement: any, index: number) => ({
              id: `settlement-${index}`,
              name: `${settlement.fromUserName} → ${settlement.toUserName}`,
              description: `Settlement of ₹${settlement.amount.toFixed(2)}`,
              amount: settlement.amount,
              type: 'settlement',
              date: settlement.createdAt,
              avatarLabel: '💰',
              avatarColor: 'rgba(34, 197, 94, 0.2)',
            }));
          
            // Merge with recent activity
            setRecentActivity(prev => [...settlementActivities, ...prev].slice(0, 10));
          }
        } catch (error) {
          console.log('Could not fetch settlements:', error);
        }

      // 5. Fetch dashboard insights (top category)
      try {
        const insightsResponse = await apiService.analytics.getDashboardInsights();
        if (insightsResponse.data?.success) {
          const insight = insightsResponse.data.data;
          setTopCategory({
            name: insight.name || 'Food',
            amount: insight.amount || 0,
            emoji: insight.emoji || '🍔',
          });
        }
      } catch (error) {
        console.log('Could not fetch insights:', error);
        // Fallback insight
        setTopCategory({ name: 'Food', amount: 0, emoji: '🍔' });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.violet} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* 1️⃣ HEADER SECTION */}
        <LinearGradient
          colors={['rgba(124, 92, 252, 0.1)', 'transparent']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.userName}>Hello, {user?.name || 'User'} 👋</Text>
              <Text style={styles.subtitle}>Let's track your money smartly</Text>
            </View>
            
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.bellButton}
                onPress={() => router.push('/(tabs)/analytics')}
                activeOpacity={0.7}
              >
                <Ionicons name="notifications" size={18} color={COLORS.textPrimary} />
                {notificationCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.profileAvatar}
                onPress={() => router.push('/profile')}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[COLORS.violet, '#B06EFF']}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* 2️⃣ FINANCIAL SUMMARY SECTION - 4 Cards */}
        <View style={styles.financialSection}>
          <View style={styles.cardRow}>
            {/* Total You Owe */}
            <TouchableOpacity
              style={[styles.summaryCard, styles.cardOwe]}
              onPress={() => router.push('/(tabs)/friends')}
              activeOpacity={0.8}
            >
              <Text style={styles.cardIcon}>💸</Text>
              <Text style={styles.cardLabel}>Total You Owe</Text>
              <Text style={[styles.cardAmount, { color: COLORS.coral }]}>
                ₹{financialData.totalOwe.toLocaleString('en-IN')}
              </Text>
              <Text style={styles.cardChange}>Tap to settle</Text>
            </TouchableOpacity>

            {/* Total You Get */}
            <TouchableOpacity
              style={[styles.summaryCard, styles.cardGet]}
              onPress={() => router.push('/(tabs)/friends')}
              activeOpacity={0.8}
            >
              <Text style={styles.cardIcon}>💰</Text>
              <Text style={styles.cardLabel}>Total You Get</Text>
              <Text style={[styles.cardAmount, { color: COLORS.mint }]}>
                ₹{financialData.totalGet.toLocaleString('en-IN')}
              </Text>
              <Text style={styles.cardChange}>From friends</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardRow}>
            {/* Monthly Spend */}
            <TouchableOpacity
              style={[styles.summaryCard, styles.cardSpend]}
              onPress={() => router.push('/(tabs)/analytics')}
              activeOpacity={0.8}
            >
              <Text style={styles.cardIcon}>📊</Text>
              <Text style={styles.cardLabel}>Monthly Spend</Text>
              <Text style={[styles.cardAmount, { color: COLORS.amber }]}>
                ₹{financialData.monthlySpend.toLocaleString('en-IN')}
              </Text>
              <Text style={styles.cardChange}>This month</Text>
            </TouchableOpacity>

            {/* Savings Goal */}
            <TouchableOpacity
              style={[styles.summaryCard, styles.cardSavings]}
              onPress={() => router.push('/(tabs)/analytics')}
              activeOpacity={0.8}
            >
              <Text style={styles.cardIcon}>🎯</Text>
              <Text style={styles.cardLabel}>Savings Goal</Text>
              <Text style={[styles.cardAmount, { color: COLORS.violetLight }]}>
                ₹{financialData.savingsProgress.toLocaleString('en-IN')}
              </Text>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${(financialData.savingsProgress / financialData.savingsGoal) * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.cardChange}>
                {Math.round((financialData.savingsProgress / financialData.savingsGoal) * 100)}% of ₹
                {financialData.savingsGoal.toLocaleString('en-IN')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settlementWidgetWrap}>
          <SettlementWidget />
        </View>

        {/* 3️⃣ SMART ALERT BANNER */}
        {smartAlert && (
          <View style={[styles.alertBanner, { borderLeftColor: smartAlert.borderColor }]}>
            <Text style={styles.alertIcon}>{smartAlert.icon}</Text>
            <Text style={styles.alertMessage}>{smartAlert.message}</Text>
          </View>
        )}

        {/* 4️⃣ RECENT ACTIVITY FEED */}
        <View style={styles.activitySection}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>Recent Activity</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAllLink}>See all →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activityList}>
            {recentActivity.map((item) => (
              <ActivityItem
                key={item.id}
                item={item}
                onPress={() => {
                  // Navigate to detail screen
                }}
              />
            ))}
          </View>

          {recentActivity.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>📭</Text>
              <Text style={styles.emptyStateText}>No recent activity</Text>
              <Text style={styles.emptyStateSubtext}>
                Add an expense to get started
              </Text>
            </View>
          )}
        </View>

        {/* 5️⃣ MINI INSIGHT CARD */}
        {topCategory.amount > 0 && (
          <View style={styles.insightCard}>
            <Text style={styles.insightIcon}>{topCategory.emoji}</Text>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Top Spending Category</Text>
              <Text style={styles.insightText}>
                {topCategory.name} is your highest expense this month
              </Text>
              <Text style={styles.insightAmount}>
                ₹{topCategory.amount.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        )}

        {/* Bottom Spacing for Tab Bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scrollView: {
    flex: 1,
  },
  
  // 1️⃣ HEADER SECTION
  headerGradient: {
    paddingTop: 12,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: 'DMSans_400Regular',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'Syne_800ExtraBold',
    color: COLORS.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_400Regular',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  bellButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.elevated,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    backgroundColor: COLORS.coral,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    overflow: 'hidden',
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Syne_800ExtraBold',
    color: COLORS.textPrimary,
  },

  // 2️⃣ FINANCIAL SUMMARY SECTION
  financialSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  settlementWidgetWrap: {
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 140,
  },
  cardOwe: {
    backgroundColor: 'rgba(255, 95, 126, 0.08)',
    borderColor: 'rgba(255, 95, 126, 0.2)',
  },
  cardGet: {
    backgroundColor: 'rgba(0, 229, 176, 0.08)',
    borderColor: 'rgba(0, 229, 176, 0.2)',
  },
  cardSpend: {
    backgroundColor: 'rgba(255, 181, 71, 0.08)',
    borderColor: 'rgba(255, 181, 71, 0.2)',
  },
  cardSavings: {
    backgroundColor: 'rgba(124, 92, 252, 0.08)',
    borderColor: 'rgba(124, 92, 252, 0.2)',
  },
  cardIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontFamily: 'DMSans_600SemiBold',
    marginBottom: 6,
  },
  cardAmount: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'Syne_800ExtraBold',
    marginBottom: 8,
  },
  cardChange: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontFamily: 'DMSans_400Regular',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(124, 92, 252, 0.2)',
    borderRadius: 2,
    marginVertical: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.violet,
    borderRadius: 2,
  },

  // 3️⃣ SMART ALERT BANNER
  alertBanner: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 14,
    backgroundColor: COLORS.elevated,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  alertIcon: {
    fontSize: 20,
  },
  alertMessage: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textPrimary,
    fontFamily: 'DMSans_500Medium',
    lineHeight: 18,
  },

  // 4️⃣ ACTIVITY SECTION
  activitySection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
  },
  seeAllLink: {
    fontSize: 11,
    color: COLORS.violetLight,
    fontFamily: 'DMSans_600SemiBold',
  },
  activityList: {
    // Activity items are added here
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: 'DMSans_400Regular',
  },

  // 5️⃣ MINI INSIGHT CARD
  insightCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: COLORS.elevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  insightIcon: {
    fontSize: 32,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontFamily: 'DMSans_600SemiBold',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_400Regular',
    marginBottom: 6,
  },
  insightAmount: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Syne_800ExtraBold',
    color: COLORS.violetLight,
  },
});

