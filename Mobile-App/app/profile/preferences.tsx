import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/hooks/useTheme';
import { apiService } from '@/src/services/api';

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

type ThemeMode = 'dark' | 'light' | 'system';
type SplitMethod = 'equally' | 'percentage' | 'amount' | 'shares';
type PaymentMethod = 'upi' | 'cash' | 'bank';

interface NotificationPreferences {
  groupExpenses: boolean;
  settlementUpdates: boolean;
  budgetAlerts: boolean;
  paymentReminders: boolean;
  monthlyReports: boolean;
}

export default function PreferencesScreen() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  // Theme state
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>('dark');

  // Preferences state
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('equally');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    groupExpenses: true,
    settlementUpdates: true,
    budgetAlerts: true,
    paymentReminders: true,
    monthlyReports: false,
  });
  const [appLockEnabled, setAppLockEnabled] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [savingNotification, setSavingNotification] = useState<string | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const profile = await apiService.profile.getProfile();

      if (profile.data?.success) {
        const prefs = profile.data.data?.user?.preferences || {};

        // Load theme
        const savedTheme = (await AsyncStorage.getItem('app_theme')) as ThemeMode;
        if (savedTheme) {
          setSelectedTheme(savedTheme);
        } else {
          setSelectedTheme((prefs?.theme || 'dark') as ThemeMode);
        }

        // Load default split & payment methods
        setSplitMethod((prefs?.defaultSplit || 'equally') as SplitMethod);
        setPaymentMethod((prefs?.defaultPaymentMethod || 'upi') as PaymentMethod);

        // Load notifications
        const notifications = prefs?.notifications || {};
        setNotificationPrefs({
          groupExpenses: notifications.groupExpenses !== false,
          settlementUpdates: notifications.settlementUpdates !== false,
          budgetAlerts: notifications.budgetAlerts !== false,
          paymentReminders: notifications.paymentReminders !== false,
          monthlyReports: notifications.monthlyReports === true,
        });

        // Load app lock
        const securitySettings = prefs?.appLockEnabled || false;
        setAppLockEnabled(securitySettings);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = async (newTheme: ThemeMode) => {
    try {
      setSelectedTheme(newTheme);
      await AsyncStorage.setItem('app_theme', newTheme);
      await apiService.profile.updatePreferences({ theme: newTheme });
      toggleTheme();
    } catch (error) {
      console.error('Error changing theme:', error);
      Alert.alert('Error', 'Failed to change theme');
      setSelectedTheme(selectedTheme);
    }
  };

  const handleSplitMethodChange = async (method: SplitMethod) => {
    try {
      setSplitMethod(method);
      setSavingNotification('split');
      await apiService.profile.updatePreferences({ defaultSplit: method });
      setTimeout(() => setSavingNotification(null), 1500);
    } catch (error) {
      console.error('Error updating split method:', error);
      Alert.alert('Error', 'Failed to update split method');
      setSavingNotification(null);
    }
  };

  const handlePaymentMethodChange = async (method: PaymentMethod) => {
    try {
      setPaymentMethod(method);
      setSavingNotification('payment');
      await apiService.profile.updatePreferences({
        defaultPaymentMethod: method,
      });
      setTimeout(() => setSavingNotification(null), 1500);
    } catch (error) {
      console.error('Error updating payment method:', error);
      Alert.alert('Error', 'Failed to update payment method');
      setSavingNotification(null);
    }
  };

  const handleNotificationToggle = async (key: keyof NotificationPreferences) => {
    try {
      const newPrefs = { ...notificationPrefs, [key]: !notificationPrefs[key] };
      setNotificationPrefs(newPrefs);
      setSavingNotification(key);

      await apiService.profile.updatePreferences({
        notifications: newPrefs,
      });

      setTimeout(() => setSavingNotification(null), 1500);
    } catch (error) {
      console.error('Error updating notification preference:', error);
      Alert.alert('Error', 'Failed to update notification settings');
      setNotificationPrefs({
        ...notificationPrefs,
        [key]: !notificationPrefs[key],
      });
      setSavingNotification(null);
    }
  };

  const handleAppLockToggle = async (value: boolean) => {
    if (value) {
      // Ask for PIN setup
      Alert.prompt(
        'Set App Lock PIN',
        'Enter a 4-digit PIN to lock the app',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Set PIN',
            onPress: async (pin?: string) => {
              if (!pin || pin.length !== 4 || !/^\d+$/.test(pin)) {
                Alert.alert('Invalid PIN', 'PIN must be exactly 4 digits');
                return;
              }

              try {
                setSavingNotification('appLock');
                await apiService.profile.updateSecuritySettings({
                  appLockEnabled: true,
                  pinCode: pin,
                });

                setAppLockEnabled(true);
                Alert.alert('Success', 'App lock enabled');
                setTimeout(() => setSavingNotification(null), 1500);
              } catch (error) {
                console.error('Error enabling app lock:', error);
                Alert.alert('Error', 'Failed to enable app lock');
                setSavingNotification(null);
              }
            },
          },
        ],
        'secure-text'
      );
    } else {
      // Ask for confirmation
      Alert.alert(
        'Disable App Lock',
        'Are you sure you want to disable the app lock?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              try {
                setSavingNotification('appLock');
                await apiService.profile.updateSecuritySettings({
                  appLockEnabled: false,
                });

                setAppLockEnabled(false);
                setTimeout(() => setSavingNotification(null), 1500);
              } catch (error) {
                console.error('Error disabling app lock:', error);
                Alert.alert('Error', 'Failed to disable app lock');
                setSavingNotification(null);
              }
            },
          },
        ]
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={COLORS.violet} />
          <Text style={styles.loaderText}>Loading preferences...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preferences</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* APPEARANCE Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APPEARANCE</Text>

          {/* Theme Selector */}
          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>Theme</Text>
            <View style={styles.themeButtons}>
              {(['dark', 'light', 'system'] as ThemeMode[]).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.themeButton,
                    selectedTheme === mode && styles.themeButtonActive,
                  ]}
                  onPress={() => handleThemeChange(mode)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.themeButtonEmoji}>
                    {mode === 'dark' ? '🌙' : mode === 'light' ? '☀️' : '📱'}
                  </Text>
                  <Text
                    style={[
                      styles.themeButtonText,
                      selectedTheme === mode && styles.themeButtonTextActive,
                    ]}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* CURRENCY Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CURRENCY</Text>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => router.push('/profile/currency')}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingNameBold}>₹ Indian Rupee (INR)</Text>
              <Text style={styles.settingDesc}>Tap to change currency</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* EXPENSE DEFAULTS Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EXPENSE DEFAULTS</Text>

          {/* Split Method */}
          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>Default Split Method</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                Alert.alert('Split Method', 'Choose a default split method', [
                  {
                    text: 'Equal',
                    onPress: () => handleSplitMethodChange('equally'),
                  },
                  {
                    text: 'Percentage',
                    onPress: () => handleSplitMethodChange('percentage'),
                  },
                  {
                    text: 'Amount',
                    onPress: () => handleSplitMethodChange('amount'),
                  },
                  {
                    text: 'Shares',
                    onPress: () => handleSplitMethodChange('shares'),
                  },
                  { text: 'Cancel', style: 'cancel' },
                ]);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownText}>
                {splitMethod.charAt(0).toUpperCase() +
                  splitMethod.slice(1).replace(/([A-Z])/g, ' $1')}
              </Text>
              <MaterialIcons name="expand-more" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
            {savingNotification === 'split' && (
              <Text style={styles.savingText}>✓ Saved</Text>
            )}
          </View>

          {/* Payment Method */}
          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>Default Payment Method</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                Alert.alert('Payment Method', 'Choose a default payment method', [
                  {
                    text: 'UPI',
                    onPress: () => handlePaymentMethodChange('upi'),
                  },
                  {
                    text: 'Cash',
                    onPress: () => handlePaymentMethodChange('cash'),
                  },
                  {
                    text: 'Bank Transfer',
                    onPress: () => handlePaymentMethodChange('bank'),
                  },
                  { text: 'Cancel', style: 'cancel' },
                ]);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownText}>
                {paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}
              </Text>
              <MaterialIcons name="expand-more" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
            {savingNotification === 'payment' && (
              <Text style={styles.savingText}>✓ Saved</Text>
            )}
          </View>
        </View>

        {/* NOTIFICATIONS Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>

          {/* New Group Expenses */}
          <View style={styles.notificationRow}>
            <View style={styles.notificationLeft}>
              <Text style={styles.notificationTitle}>New group expenses</Text>
            </View>
            <View style={styles.notificationRight}>
              {savingNotification === 'groupExpenses' && (
                <Text style={styles.savingIcon}>✓</Text>
              )}
              <Switch
                value={notificationPrefs.groupExpenses}
                onValueChange={() => handleNotificationToggle('groupExpenses')}
                trackColor={{ false: COLORS.textMuted, true: COLORS.violet }}
                thumbColor={COLORS.textPrimary}
              />
            </View>
          </View>

          {/* Settlement Updates */}
          <View style={styles.notificationRow}>
            <View style={styles.notificationLeft}>
              <Text style={styles.notificationTitle}>Settlement updates</Text>
            </View>
            <View style={styles.notificationRight}>
              {savingNotification === 'settlementUpdates' && (
                <Text style={styles.savingIcon}>✓</Text>
              )}
              <Switch
                value={notificationPrefs.settlementUpdates}
                onValueChange={() => handleNotificationToggle('settlementUpdates')}
                trackColor={{ false: COLORS.textMuted, true: COLORS.violet }}
                thumbColor={COLORS.textPrimary}
              />
            </View>
          </View>

          {/* Budget Alerts */}
          <View style={styles.notificationRow}>
            <View style={styles.notificationLeft}>
              <Text style={styles.notificationTitle}>Budget alerts</Text>
            </View>
            <View style={styles.notificationRight}>
              {savingNotification === 'budgetAlerts' && (
                <Text style={styles.savingIcon}>✓</Text>
              )}
              <Switch
                value={notificationPrefs.budgetAlerts}
                onValueChange={() => handleNotificationToggle('budgetAlerts')}
                trackColor={{ false: COLORS.textMuted, true: COLORS.violet }}
                thumbColor={COLORS.textPrimary}
              />
            </View>
          </View>

          {/* Payment Reminders */}
          <View style={styles.notificationRow}>
            <View style={styles.notificationLeft}>
              <Text style={styles.notificationTitle}>Payment reminders</Text>
            </View>
            <View style={styles.notificationRight}>
              {savingNotification === 'paymentReminders' && (
                <Text style={styles.savingIcon}>✓</Text>
              )}
              <Switch
                value={notificationPrefs.paymentReminders}
                onValueChange={() => handleNotificationToggle('paymentReminders')}
                trackColor={{ false: COLORS.textMuted, true: COLORS.violet }}
                thumbColor={COLORS.textPrimary}
              />
            </View>
          </View>

          {/* Monthly Reports */}
          <View style={styles.notificationRow}>
            <View style={styles.notificationLeft}>
              <Text style={styles.notificationTitle}>Monthly reports</Text>
            </View>
            <View style={styles.notificationRight}>
              {savingNotification === 'monthlyReports' && (
                <Text style={styles.savingIcon}>✓</Text>
              )}
              <Switch
                value={notificationPrefs.monthlyReports}
                onValueChange={() => handleNotificationToggle('monthlyReports')}
                trackColor={{ false: COLORS.textMuted, true: COLORS.violet }}
                thumbColor={COLORS.textPrimary}
              />
            </View>
          </View>
        </View>

        {/* SECURITY Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SECURITY</Text>

          <View style={styles.notificationRow}>
            <View style={styles.notificationLeft}>
              <Text style={styles.notificationTitle}>App Lock (PIN)</Text>
              <Text style={styles.notificationDesc}>Protect your data</Text>
            </View>
            <View style={styles.notificationRight}>
              {savingNotification === 'appLock' && (
                <Text style={styles.savingIcon}>✓</Text>
              )}
              <Switch
                value={appLockEnabled}
                onValueChange={handleAppLockToggle}
                trackColor={{ false: COLORS.textMuted, true: COLORS.violet }}
                thumbColor={COLORS.textPrimary}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.securityLink}
            onPress={() => router.push('/profile/security-lock')}
            activeOpacity={0.7}
          >
            <Text style={styles.securityLinkText}>Configure biometric lock</Text>
            <MaterialIcons name="chevron-right" size={18} color={COLORS.violet} />
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
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
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
    fontSize: 20,
    fontFamily: 'Syne_700Bold',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: 'DMSans_600SemiBold',
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  settingGroup: {
    marginBottom: 20,
  },
  settingLabel: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontFamily: 'DMSans_600SemiBold',
    fontWeight: '600',
    marginBottom: 10,
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  themeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  themeButtonActive: {
    borderColor: COLORS.violet,
    backgroundColor: 'rgba(124, 92, 252, 0.1)',
  },
  themeButtonEmoji: {
    fontSize: 20,
  },
  themeButtonText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontFamily: 'DMSans_600SemiBold',
    fontWeight: '600',
  },
  themeButtonTextActive: {
    color: COLORS.violet,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingLeft: {
    flex: 1,
  },
  settingNameBold: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDesc: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dropdownText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
  },
  savingText: {
    color: COLORS.mint,
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
    marginTop: 8,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  notificationLeft: {
    flex: 1,
  },
  notificationTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
  },
  notificationDesc: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    marginTop: 4,
  },
  notificationRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  savingIcon: {
    color: COLORS.mint,
    fontSize: 16,
    fontFamily: 'DMSans_600SemiBold',
  },
  securityLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  securityLinkText: {
    color: COLORS.violet,
    fontSize: 13,
    fontFamily: 'DMSans_600SemiBold',
    fontWeight: '600',
  },
  bottomPadding: {
    height: 24,
  },
});
