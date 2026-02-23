import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  amber: '#FFB547',
  textPrimary: '#F0F0FF',
  textSecondary: '#8888AA',
  textMuted: '#55556A',
  border: 'rgba(255, 255, 255, 0.06)',
};

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  upiId?: string;
  verified?: boolean;
}

interface ProfileStats {
  totalGroups: number;
  totalExpenses: number;
  totalSettlements: number;
  activeFriends: number;
  financialHealthScore?: number;
}

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  route?: string;
  iconColor: string;
  onPress?: () => void;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats>({
    totalGroups: 0,
    totalExpenses: 0,
    totalSettlements: 0,
    activeFriends: 0,
    financialHealthScore: 0,
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      // Load user profile
      const userResponse = await apiService.user.getMe();
      if (userResponse.data?.success) {
        setProfile(userResponse.data.data);
      }

      // Load profile stats
      try {
        const statsResponse = await apiService.profile.getStats();
        if (statsResponse.data?.success) {
          setStats(statsResponse.data.data);
        }
      } catch (error) {
        console.log('Could not load stats:', error);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
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
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Account & Financial Settings',
      items: [
        {
          id: 'budget',
          title: 'Budget & Goals',
          icon: 'wallet',
          iconColor: COLORS.mint,
          route: '/profile/budget',
        },
        {
          id: 'payment',
          title: 'Payment Preferences',
          icon: 'card',
          iconColor: COLORS.violet,
          route: '/profile/payment',
        },
        {
          id: 'currency',
          title: 'Currency',
          icon: 'cash',
          iconColor: COLORS.amber,
          route: '/profile/currency',
        },
      ],
    },
    {
      title: 'App Preferences',
      items: [
        {
          id: 'theme',
          title: 'Theme',
          icon: 'moon',
          iconColor: COLORS.violetLight,
          route: '/profile/theme',
        },
        {
          id: 'notifications',
          title: 'Notifications',
          icon: 'notifications',
          iconColor: COLORS.coral,
          route: '/profile/notifications',
        },
        {
          id: 'categories',
          title: 'Expense Categories',
          icon: 'grid',
          iconColor: COLORS.mint,
          route: '/profile/categories',
        },
      ],
    },
    {
      title: 'Security & Data',
      items: [
        {
          id: 'applock',
          title: 'App Lock & Fingerprint',
          icon: 'lock-closed',
          iconColor: COLORS.coral,
          route: '/profile/security-lock',
        },
        {
          id: 'password',
          title: 'Change Password',
          icon: 'key',
          iconColor: COLORS.amber,
          route: '/profile/change-password',
        },
        {
          id: 'privacy',
          title: 'Privacy Mode',
          icon: 'shield-checkmark',
          iconColor: COLORS.violet,
          route: '/profile/privacy',
        },
        {
          id: 'export',
          title: 'Export Data',
          icon: 'cloud-download',
          iconColor: COLORS.mint,
          route: '/profile/export',
        },
      ],
    },
    {
      title: 'Data Management',
      items: [
        {
          id: 'reset',
          title: 'Reset Savings Goal',
          icon: 'refresh',
          iconColor: COLORS.violetLight,
          onPress: () => {
            Alert.alert(
              'Reset Savings Goal',
              'Are you sure you want to reset your savings goal?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Reset',
                  style: 'destructive',
                  onPress: () => {
                    // Handle reset
                  },
                },
              ]
            );
          },
        },
        {
          id: 'clear',
          title: 'Clear All Notifications',
          icon: 'trash',
          iconColor: COLORS.textMuted,
          onPress: () => {
            Alert.alert('Clear Notifications', 'All notifications will be cleared.');
          },
        },
        {
          id: 'delete',
          title: 'Delete Account',
          icon: 'warning',
          iconColor: COLORS.coral,
          onPress: () => {
            Alert.alert(
              'Delete Account',
              'This action cannot be undone. All your data will be permanently deleted.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    // Handle account deletion
                  },
                },
              ]
            );
          },
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.violet} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={['rgba(124, 92, 252, 0.15)', 'transparent']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push('/profile/budget')}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={20} color={COLORS.violetLight} />
            </TouchableOpacity>
          </View>

          {/* Profile Header Section */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {profile?.profileImage ? (
                <Image source={{ uri: profile.profileImage }} style={styles.avatar} />
              ) : (
                <LinearGradient
                  colors={[COLORS.violet, '#B06EFF']}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>
                    {profile?.name?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </LinearGradient>
              )}
              <TouchableOpacity style={styles.editIconButton} activeOpacity={0.7}>
                <LinearGradient
                  colors={[COLORS.violet, COLORS.violetLight]}
                  style={styles.editIconGradient}
                >
                  <Ionicons name="camera" size={14} color={COLORS.textPrimary} />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <Text style={styles.userName}>{profile?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{profile?.email || ''}</Text>

            {profile?.phone && (
              <View style={styles.infoRow}>
                <Ionicons name="call" size={14} color={COLORS.textMuted} />
                <Text style={styles.infoText}>{profile.phone}</Text>
              </View>
            )}

            {profile?.upiId && (
              <View style={styles.infoRow}>
                <Ionicons name="wallet" size={14} color={COLORS.textMuted} />
                <Text style={styles.infoText}>{profile.upiId}</Text>
              </View>
            )}

            {profile?.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.mint} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>

          {/* Stats Row */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.totalGroups}</Text>
              <Text style={styles.statLabel}>Groups</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.totalExpenses}</Text>
              <Text style={styles.statLabel}>Expenses</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.totalSettlements}</Text>
              <Text style={styles.statLabel}>Settlements</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.activeFriends}</Text>
              <Text style={styles.statLabel}>Friends</Text>
            </View>
          </View>

          {/* Financial Health Score */}
          {stats.financialHealthScore !== undefined && (
            <View style={styles.healthScoreCard}>
              <View style={styles.healthScoreHeader}>
                <Ionicons name="pulse" size={24} color={COLORS.mint} />
                <Text style={styles.healthScoreTitle}>Financial Health Score</Text>
              </View>
              <Text style={styles.healthScoreValue}>
                {stats.financialHealthScore}/100
              </Text>
              <View style={styles.healthScoreBar}>
                <View
                  style={[
                    styles.healthScoreFill,
                    { width: `${stats.financialHealthScore}%` },
                  ]}
                />
              </View>
              <Text style={styles.healthScoreDesc}>
                {stats.financialHealthScore >= 75
                  ? 'Excellent! Keep up the good work 🎉'
                  : stats.financialHealthScore >= 50
                  ? 'Good progress! Keep tracking 📈'
                  : 'Need improvement. Review your expenses 📊'}
              </Text>
            </View>
          )}
        </LinearGradient>

        {/* Menu Sections */}
        {menuSections.map((section, index) => (
          <View key={index} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuList}>
              {section.items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={() => {
                    if (item.onPress) {
                      item.onPress();
                    } else if (item.route) {
                      router.push(item.route as any);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <View
                      style={[
                        styles.menuIconBg,
                        { backgroundColor: `${item.iconColor}20` },
                      ]}
                    >
                      <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
                    </View>
                    <Text style={styles.menuItemText}>{item.title}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.coral} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
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
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Syne_800ExtraBold',
    color: COLORS.textPrimary,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.violet,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.violet,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '800',
    fontFamily: 'Syne_800ExtraBold',
    color: COLORS.textPrimary,
  },
  editIconButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  editIconGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'Syne_800ExtraBold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_400Regular',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_400Regular',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: `${COLORS.mint}20`,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 12,
    color: COLORS.mint,
    fontFamily: 'DMSans_600SemiBold',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.elevated,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Syne_800ExtraBold',
    color: COLORS.violetLight,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: 'DMSans_400Regular',
  },
  healthScoreCard: {
    backgroundColor: COLORS.elevated,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  healthScoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  healthScoreTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.textPrimary,
  },
  healthScoreValue: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'Syne_800ExtraBold',
    color: COLORS.mint,
    marginBottom: 12,
  },
  healthScoreBar: {
    height: 8,
    backgroundColor: `${COLORS.mint}20`,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  healthScoreFill: {
    height: '100%',
    backgroundColor: COLORS.mint,
    borderRadius: 4,
  },
  healthScoreDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_400Regular',
  },
  menuSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: 'DMSans_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  menuList: {
    backgroundColor: COLORS.elevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.textPrimary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    backgroundColor: COLORS.elevated,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.coral,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.coral,
  },
});
