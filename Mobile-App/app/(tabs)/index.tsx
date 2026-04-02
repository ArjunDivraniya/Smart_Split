import React, { useState, useEffect, useRef } from 'react';
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

import SettlementWidget from '@/src/components/dashboard/SettlementWidget';
import NudgeBanner from '@/src/components/dashboard/NudgeBanner';
import ActivityFeed, { type FeedItem, type FeedType } from '@/src/components/dashboard/ActivityFeed';
import { apiService } from '@/src/services/api';
import { getCategoryBreakdown, getInsights } from '@/src/services/analytics.service';
import { getFriendBalances } from '@/src/services/friends.service';
import { getSummary as getPersonalSummary } from '@/src/services/personal.service';
import { STORAGE_KEYS } from '@/src/constants/categories';
import { useNotifications } from '@/src/hooks/useNotifications';
import { Colors } from '@/constants/theme';
import { BalanceCardSkeleton } from '@/components/SkeletonLoader';
import { ErrorState } from '@/components/ErrorState';
import { hapticImpactLight } from '@/src/utils/haptics';

const theme = Colors.dark;
const COLORS = {
  surface: theme.surface,
  elevated: theme.elevated,
  violet: theme.violet,
  violetLight: '#9B7FFF',
  mint: theme.mint,
  coral: theme.coral,
  amber: theme.amber,
  textPrimary: theme.text,
  textSecondary: theme.icon,
  textMuted: theme.tabIconDefault,
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
}

function DashboardScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [financialData, setFinancialData] = useState<FinancialSummary>({
    totalOwe: 0,
    totalGet: 0,
    monthlySpend: 0,
  });
  const [balanceCardsLoading, setBalanceCardsLoading] = useState(true);
  const skeletonOpacity = useRef(new Animated.Value(0.45)).current;
  const { unreadCount } = useNotifications();
  const [recentActivity, setRecentActivity] = useState<FeedItem[]>([]);
  const [greeting, setGreeting] = useState('Good morning');
  const [unsettledBalances, setUnsettledBalances] = useState(0);
  const [budgetUsagePercent, setBudgetUsagePercent] = useState(0);
  const [topCategory, setTopCategory] = useState({ name: 'Food', amount: 0, emoji: '🍔' });
  const [topCategoriesPreview, setTopCategoriesPreview] = useState<Array<{ category: string; total: number; emoji: string }>>([]);
  const [dashboardError, setDashboardError] = useState(false);

  useEffect(() => {
    loadUserData();
    setGreeting(getGreeting());
    fetchDashboardData();

    Animated.loop(
      Animated.sequence([
        Animated.timing(skeletonOpacity, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(skeletonOpacity, {
          toValue: 0.45,
          duration: 650,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const fetchBalanceCardsData = async (): Promise<boolean> => {
    setBalanceCardsLoading(true);

    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const [friendsResponse, summaryResponse] = await Promise.all([
        getFriendBalances(),
        getPersonalSummary(month, year),
      ]);

      const balances = Array.isArray(friendsResponse) ? friendsResponse : [];

      const totals = balances.reduce(
        (acc, item: any) => {
          const rawBalance = Number(item?.netAmount ?? item?.netBalance ?? 0);
          if (rawBalance < 0) {
            acc.totalOwe += Math.abs(rawBalance);
          } else if (rawBalance > 0) {
            acc.totalGet += rawBalance;
          }
          return acc;
        },
        { totalOwe: 0, totalGet: 0 }
      );

      const monthlySpend = Number(summaryResponse?.data?.total || 0);

      setFinancialData({
        totalOwe: Number(totals.totalOwe || 0),
        totalGet: Number(totals.totalGet || 0),
        monthlySpend: Number(monthlySpend || 0),
      });
      return true;
    } catch (error) {
      console.log('Could not fetch balance cards data:', error);
      setFinancialData({ totalOwe: 0, totalGet: 0, monthlySpend: 0 });
      return false;
    } finally {
      setBalanceCardsLoading(false);
    }
  };

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
      setDashboardError(false);
      let successCount = 0;
      const balanceCardsLoaded = await fetchBalanceCardsData();
      if (balanceCardsLoaded) {
        successCount += 1;
      }

      // 1. Fetch user profile
      try {
        const userResponse = await apiService.user.getMe();
        const userData = userResponse.data?.data || userResponse.data;
        if (userData) {
          setUser(userData);
          await AsyncStorage.setItem(
            STORAGE_KEYS.USER_DATA,
            JSON.stringify(userData)
          );
          successCount += 1;
        }
      } catch (error) {
        console.log('Could not fetch user profile:', error);
      }

      // 2. Fetch dashboard summary (financial data + smart alerts)
      try {
        const summaryResponse = await apiService.analytics.getDashboardSummary();
        if (summaryResponse.data?.success && summaryResponse.data?.data) {
          const { financial } = summaryResponse.data.data;
          
          if (financial) {
            const savingsGoal = financial.savingsGoal || 5000;
            const usage = Math.min(100, Math.round(((financial.monthlySpend || 0) / Math.max(1, savingsGoal)) * 100));
            setBudgetUsagePercent(usage);
            successCount += 1;
          }
        }
      } catch (error) {
        console.log('Could not fetch dashboard summary:', error);
        setBudgetUsagePercent(0);
      }

      // 3. Fetch recent activity
      try {
        const activityResponse = await apiService.analytics.getRecentActivity();
        if (activityResponse.data?.success) {
          const normalized = (activityResponse.data.data || []).map((item: any, index: number) => {
            let type: FeedType = 'group-expense';
            if (item.type === 'personal') type = 'personal-expense';
            if (item.type === 'settlement') type = 'settlement';

            return {
              id: item.id || `activity-${index}`,
              title: item.title || 'Activity',
              subtitle: item.description || 'No description',
              amount: Number(item.amount || 0),
              type,
              date: item.date,
            } as FeedItem;
          });

          setRecentActivity(normalized);
          successCount += 1;
        }
      } catch (error) {
        console.log('Could not fetch recent activity:', error);
        setRecentActivity([
          {
            id: '1',
            title: 'Welcome to SmartSplit!',
            subtitle: 'Start by creating a trip or adding an expense',
            amount: 0,
            type: 'personal-expense',
          },
        ]);
      }

        // 3b. Fetch user settlements
        try {
          const settlementsResponse = await apiService.settlements.getUserSettlements();
          const settlements = settlementsResponse.data?.data || [];
          if (Array.isArray(settlements)) {
            const unsettled = settlements.filter((s: any) => ['pending', 'overdue', 'partial'].includes(String(s?.status || '').toLowerCase())).length;
            setUnsettledBalances(unsettled || (settlements.length > 0 ? settlements.length : 2));
            successCount += 1;
          }
        } catch (error) {
          console.log('Could not fetch settlements for balance count:', error);
          setUnsettledBalances(2);
        }

      // 4. Fetch dashboard insights (top category)
      try {
        const now = new Date();
        const [insights, categoryBreakdown] = await Promise.all([
          getInsights(),
          getCategoryBreakdown(now.getMonth() + 1, now.getFullYear()),
        ]);

        const sortedCategories = [...(categoryBreakdown.categories || [])]
          .sort((a, b) => b.total - a.total)
          .slice(0, 2)
          .map((item) => ({
            category: item.category,
            total: item.total,
            emoji: item.emoji || '📦',
          }));

        setTopCategoriesPreview(sortedCategories);

        if (sortedCategories[0]) {
          setTopCategory({
            name: sortedCategories[0].category,
            amount: sortedCategories[0].total,
            emoji: sortedCategories[0].emoji,
          });
        } else {
          setTopCategory({
            name: insights.topCategory || 'Food',
            amount: insights.thisMonthTotal || 0,
            emoji: '📊',
          });
        }
        successCount += 1;
      } catch (error) {
        console.log('Could not fetch insights:', error);
        // Fallback insight
        setTopCategory({ name: 'Food', amount: 0, emoji: '🍔' });
        setTopCategoriesPreview([]);
      }

      if (successCount === 0) {
        setDashboardError(true);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardError(true);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    void hapticImpactLight();
    await fetchDashboardData();
    setRefreshing(false);
  };

  if (dashboardError && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.violet} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.errorWrap}
        >
          <ErrorState onRetry={onRefresh} />
        </ScrollView>
      </SafeAreaView>
    );
  }

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
                onPress={() => router.push('/notifications' as any)}
                activeOpacity={0.7}
              >
                <Ionicons name="notifications" size={18} color={COLORS.textPrimary} />
                {unreadCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {unreadCount > 9 ? '9+' : unreadCount}
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
            {/* You Owe */}
            <TouchableOpacity
              style={[styles.summaryCard, styles.cardOwe]}
              onPress={() => router.push('/(tabs)/friends')}
              activeOpacity={0.8}
            >
              <Text style={styles.cardLabel}>YOU OWE</Text>
              {balanceCardsLoading ? (
                <BalanceCardSkeleton height={32} borderRadius={6} />
              ) : (
                <Text style={[styles.cardAmount, { color: COLORS.coral }]}>₹{financialData.totalOwe.toLocaleString('en-IN')}</Text>
              )}
            </TouchableOpacity>

            {/* You Get */}
            <TouchableOpacity
              style={[styles.summaryCard, styles.cardGet]}
              onPress={() => router.push('/(tabs)/friends')}
              activeOpacity={0.8}
            >
              <Text style={styles.cardLabel}>YOU GET</Text>
              {balanceCardsLoading ? (
                <BalanceCardSkeleton height={32} borderRadius={6} />
              ) : (
                <Text style={[styles.cardAmount, { color: COLORS.mint }]}>₹{financialData.totalGet.toLocaleString('en-IN')}</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.monthlySpendRow}>
            {balanceCardsLoading ? (
              <BalanceCardSkeleton width="80%" height={16} borderRadius={6} />
            ) : (
              <Text style={styles.monthlySpendText}>Monthly Spend: ₹{financialData.monthlySpend.toLocaleString('en-IN')}</Text>
            )}
          </View>
        </View>

        <View style={styles.settlementWidgetWrap}>
          <SettlementWidget />
        </View>

        <View style={styles.nudgeWrap}>
          <NudgeBanner />
        </View>

        <View style={styles.activityFeedWrap}>
          <ActivityFeed
            items={recentActivity}
            onItemPress={(item) => {
              if (item.type === 'settlement') {
                router.push('/settlements' as any);
                return;
              }
              if (item.type === 'personal-expense') {
                router.push('/(tabs)/analytics');
                return;
              }
              router.push('/(tabs)/groups');
            }}
          />
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

        <TouchableOpacity
          style={styles.analyticsPreviewCard}
          onPress={() => router.push('/(tabs)/analytics')}
          activeOpacity={0.85}
        >
          <View style={styles.analyticsPreviewTopRow}>
            <Text style={styles.analyticsPreviewTitle}>This month:</Text>
            <Text style={styles.analyticsPreviewLink}>Full Analytics →</Text>
          </View>

          <Text style={styles.analyticsPreviewText}>
            {topCategoriesPreview.length
              ? topCategoriesPreview
                  .map(
                    (item) => `${item.emoji} ${item.category} ₹${Math.round(item.total).toLocaleString('en-IN')}`
                  )
                  .join(' · ')
              : 'No category data yet'}
          </Text>
        </TouchableOpacity>

        {/* Bottom Spacing for Tab Bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity
        style={styles.personalTrackFab}
        onPress={() => router.push('/personal')}
        activeOpacity={0.9}
      >
        <Ionicons name="receipt-outline" size={18} color="#FFFFFF" />
        <Text style={styles.personalTrackFabText}>Track Personal</Text>
      </TouchableOpacity>
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
  errorWrap: {
    flexGrow: 1,
  },
  personalTrackFab: {
    position: 'absolute',
    right: 16,
    bottom: Platform.OS === 'ios' ? 106 : 88,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.violet,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 8,
  },
  personalTrackFabText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
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
  nudgeWrap: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  activityFeedWrap: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 18,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  summaryCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 102,
  },
  cardOwe: {
    backgroundColor: 'rgba(255,95,126,0.12)',
    borderColor: 'rgba(255, 95, 126, 0.2)',
  },
  cardGet: {
    backgroundColor: 'rgba(0,229,176,0.12)',
    borderColor: 'rgba(0, 229, 176, 0.2)',
  },
  cardLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontFamily: 'DMSans_600SemiBold',
    marginBottom: 10,
  },
  cardAmount: {
    fontSize: 22,
    fontFamily: 'Syne_700Bold',
  },
  amountSkeleton: {
    width: '74%',
    height: 27,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  monthlySpendRow: {
    marginTop: 2,
    minHeight: 22,
    justifyContent: 'center',
  },
  monthlySpendText: {
    color: '#9B7FFF',
    fontSize: 14,
    fontFamily: 'DMSans_700Bold',
  },
  monthlySkeleton: {
    width: '58%',
    height: 18,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.16)',
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
  analyticsPreviewCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    backgroundColor: COLORS.elevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  analyticsPreviewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  analyticsPreviewTitle: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontFamily: 'DMSans_600SemiBold',
  },
  analyticsPreviewLink: {
    color: COLORS.violetLight,
    fontSize: 12,
    fontFamily: 'DMSans_600SemiBold',
  },
  analyticsPreviewText: {
    marginTop: 8,
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
    lineHeight: 18,
  },
});

export default DashboardScreen;

