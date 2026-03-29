import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  RefreshControl,
  Animated,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import useProfile from '@/src/hooks/useProfile';
import { useTheme } from '@/src/hooks/useTheme';
import { getMonthlyData } from '@/src/services/analytics.service';
import { apiService } from '@/src/services/api';
import { STORAGE_KEYS } from '@/src/constants/categories';
import { StatsRowSkeletonLoader } from '@/components/SkeletonLoader';

const COLORS = {
  void: '#080810',
  surface: '#0F0F1A',
  card: '#14141F',
  elevated: '#1A1A2B',
  violet: '#7C5CFC',
  violetLight: '#9B7FFF',
  violetDim: 'rgba(124, 92, 252, 0.06)',
  mint: '#00E5B0',
  coral: '#FF5F7E',
  amber: '#FFB547',
  sky: '#38BDF8',
  textPrimary: '#F0F0FF',
  textSecondary: '#A0A0BF',
  textMuted: '#80809E',
  border: 'rgba(255, 255, 255, 0.08)',
};

interface SpendingComparison {
  thisMonth: number;
  lastMonth: number;
  isReduced: boolean;
  percentChange: number;
}

export default function ProfileMainScreen() {
  const router = useRouter();
  const { profile, loading, refetch } = useProfile();
  const { theme, toggleTheme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [spendingComparison, setSpendingComparison] = useState<SpendingComparison>({
    thisMonth: 0,
    lastMonth: 0,
    isReduced: true,
    percentChange: 0,
  });

  useEffect(() => {
    if (profile) {
      loadSpendingComparison();
    }
  }, [profile]);

  const loadSpendingComparison = async () => {
    try {
      const monthlyData = await getMonthlyData();
      const months = monthlyData.data || [];

      if (months.length >= 2) {
        const currentMonth = months[0];
        const previousMonth = months[1];
        const thisMonthValue = currentMonth?.total || 0;
        const lastMonthValue = previousMonth?.total || 0;

        const isReduced = thisMonthValue <= lastMonthValue;
        const diff = lastMonthValue - thisMonthValue;
        const percentChange =
          lastMonthValue > 0 ? Math.round((Math.abs(diff) / lastMonthValue) * 100) : 0;

        setSpendingComparison({
          thisMonth: thisMonthValue,
          lastMonth: lastMonthValue,
          isReduced,
          percentChange,
        });
      }
    } catch (error) {
      console.log('Error loading spending comparison:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    await loadSpendingComparison();
    setRefreshing(false);
  };

  const handleEditProfile = () => {
    router.push('/profile/edit' as any);
  };

  const handleToggleTheme = async () => {
    await toggleTheme();
    // Optionally call backend to save preference
    try {
      await apiService.profile.updatePreferences({
        theme: theme === 'dark' ? 'light' : 'dark',
      });
    } catch (error) {
      console.log('Error saving theme preference:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
              await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
              router.replace('/(auth)/login' as any);
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      id: 'edit-profile',
      title: 'Edit Profile',
      icon: 'person',
      onPress: handleEditProfile,
    },
    {
      id: 'budget',
      title: 'Budget Settings',
      icon: 'trending-up',
      onPress: () => router.push('/budget' as any),
    },
    {
      id: 'history',
      title: 'Payment History',
      icon: 'history',
      onPress: () => router.push('/profile/payment' as any),
    },
    {
      id: 'preferences',
      title: 'Preferences',
      icon: 'tune',
      onPress: () => router.push('/profile/theme' as any),
    },
    {
      id: 'export',
      title: 'Export My Data',
      icon: 'cloud-download',
      onPress: () => router.push('/profile/export' as any),
    },
    {
      id: 'security',
      title: 'App Lock',
      icon: 'lock',
      onPress: () => router.push('/profile/security-lock' as any),
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loaderWrap}>
          <Text style={styles.loaderText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.violet}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Avatar & User Info Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {profile?.user.avatar ? (
              <Image source={{ uri: profile.user.avatar }} style={styles.avatar} />
            ) : (
              <LinearGradient
                colors={[COLORS.violet, '#B06EFF']}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarText}>
                  {profile?.user.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </LinearGradient>
            )}
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={handleEditProfile}
              activeOpacity={0.7}
            >
              <MaterialIcons name="edit" size={16} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{profile?.user.name || 'User'}</Text>
          <Text style={styles.userEmail}>{profile?.user.email || ''}</Text>

          <View style={styles.userDetails}>
            {profile?.user.upiId && (
              <Text style={styles.detailText}>
                {profile.user.upiId} · {profile?.user.phone || '📱'}
              </Text>
            )}
            {profile?.stats.memberSince && (
              <Text style={styles.detailText}>{profile.stats.memberSince}</Text>
            )}
          </View>
        </View>

        {/* Stats Row with Animation */}
        <View style={styles.statsRowContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile?.stats.totalGroups || 0}</Text>
            <Text style={styles.statLabel}>Groups</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile?.stats.totalPersonalExpenses || 0}</Text>
            <Text style={styles.statLabel}>Expenses</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              ₹{(profile?.stats.totalSpent || 0) >= 1000 
                ? ((profile?.stats.totalSpent || 0) / 1000).toFixed(0) + 'k'
                : profile?.stats.totalSpent || 0}
            </Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
        </View>

        {/* Spending Comparison */}
        <View style={styles.spendingSection}>
          <Text style={styles.spendingTitle}>
            This month: ₹{spendingComparison.thisMonth.toLocaleString()}
          </Text>

          {/* Progress bar */}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(100, (spendingComparison.thisMonth / Math.max(spendingComparison.lastMonth, 1)) * 100)}%`,
                  backgroundColor: spendingComparison.isReduced ? COLORS.mint : COLORS.coral,
                },
              ]}
            />
          </View>

          <Text style={styles.spendingCompare}>
            vs ₹{spendingComparison.lastMonth.toLocaleString()} last month{' '}
            <Text
              style={[
                styles.percentChange,
                { color: spendingComparison.isReduced ? COLORS.mint : COLORS.coral },
              ]}
            >
              ({spendingComparison.isReduced ? '↓' : '↑'}{' '}
              {spendingComparison.percentChange}%)
            </Text>
          </Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <MaterialIcons name={item.icon as any} size={20} color={COLORS.violet} />
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}

          {/* Dark Mode Toggle */}
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <MaterialIcons name="dark-mode" size={20} color={COLORS.violet} />
              <Text style={styles.menuItemText}>Dark Mode</Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={handleToggleTheme}
              trackColor={{ false: COLORS.textMuted, true: COLORS.violet }}
              thumbColor={COLORS.textPrimary}
            />
          </View>

          {/* Logout */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <MaterialIcons name="logout" size={20} color={COLORS.coral} />
              <Text style={[styles.menuItemText, { color: COLORS.coral }]}>Logout</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.void,
  },
  scrollView: {
    flex: 1,
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontFamily: 'Syne_700Bold',
    fontWeight: '700',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.violet,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  avatarText: {
    fontSize: 32,
    fontFamily: 'Syne_700Bold',
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.violet,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.void,
  },
  userName: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontFamily: 'Syne_700Bold',
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
    marginBottom: 8,
  },
  userDetails: {
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
  },
  statsRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontFamily: 'Syne_700Bold',
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
  },
  spendingSection: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  spendingTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
    fontWeight: '600',
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: COLORS.elevated,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  spendingCompare: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
  },
  percentChange: {
    fontFamily: 'DMSans_600SemiBold',
    fontWeight: '600',
  },
  menuSection: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuItemText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
  },
  bottomPadding: {
    height: 24,
  },
});
