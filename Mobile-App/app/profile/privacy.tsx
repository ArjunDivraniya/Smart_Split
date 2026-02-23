import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { apiService } from '@/src/services/api';

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

interface PrivacySettings {
  privacyMode: boolean;
  hideBalances: boolean;
  hideExpenses: boolean;
  hideTransactions: boolean;
  dataCollection: boolean;
  analytics: boolean;
  marketingEmails: boolean;
}

export default function PrivacyModeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<PrivacySettings>({
    privacyMode: false,
    hideBalances: false,
    hideExpenses: false,
    hideTransactions: false,
    dataCollection: true,
    analytics: true,
    marketingEmails: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await apiService.user.getMe();
      if (response.data?.success) {
        const prefs = response.data.data.privacySettings;
        if (prefs) {
          setSettings(prefs);
        }
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    }
  };

  const handleToggle = (key: keyof PrivacySettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await apiService.profile.updatePrivacySettings(settings);
      Alert.alert('Success', 'Privacy settings updated successfully');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

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
          <Text style={styles.headerTitle}>Privacy Mode</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Main Privacy Mode */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark" size={24} color={COLORS.violet} />
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Privacy Mode</Text>
              <Text style={styles.sectionDescription}>
                Hide all financial information from prying eyes
              </Text>
            </View>
            <Switch
              value={settings.privacyMode}
              onValueChange={() => handleToggle('privacyMode')}
              trackColor={{ false: COLORS.border, true: COLORS.mint }}
              thumbColor={settings.privacyMode ? COLORS.mint : COLORS.textMuted}
            />
          </View>
        </View>

        {/* Data Visibility Settings */}
        {settings.privacyMode && (
          <View style={styles.settingsGroup}>
            <Text style={styles.groupTitle}>Visibility Settings</Text>

            <SettingItem
              label="Hide Balances"
              description="Hide balance amounts in summaries"
              value={settings.hideBalances}
              onToggle={() => handleToggle('hideBalances')}
              icon="eye-off"
            />

            <SettingItem
              label="Hide Expenses"
              description="Hide individual expense amounts"
              value={settings.hideExpenses}
              onToggle={() => handleToggle('hideExpenses')}
              icon="document-text-outline"
            />

            <SettingItem
              label="Hide Transactions"
              description="Hide transaction history"
              value={settings.hideTransactions}
              onToggle={() => handleToggle('hideTransactions')}
              icon="swap-horizontal"
            />
          </View>
        )}

        {/* Data Collection */}
        <View style={styles.settingsGroup}>
          <Text style={styles.groupTitle}>Data & Tracking</Text>

          <SettingItem
            label="Collect Usage Data"
            description="Help us improve the app (recommended)"
            value={settings.dataCollection}
            onToggle={() => handleToggle('dataCollection')}
            icon="analytics"
          />

          <SettingItem
            label="Send Analytics"
            description="Share app performance data securely"
            value={settings.analytics}
            onToggle={() => handleToggle('analytics')}
            icon="bar-chart"
          />

          <SettingItem
            label="Marketing Emails"
            description="Receive updates about new features"
            value={settings.marketingEmails}
            onToggle={() => handleToggle('marketingEmails')}
            icon="mail"
          />
        </View>

        {/* Privacy Notice */}
        <View style={styles.privacyNotice}>
          <Ionicons name="information-circle" size={20} color={COLORS.mint} />
          <View style={{ flex: 1 }}>
            <Text style={styles.noticeTitle}>Your Privacy Matters</Text>
            <Text style={styles.noticeText}>
              We never sell your data. All encryption is done locally on your device. Review our{' '}
              <Text style={styles.link}>Privacy Policy</Text> for more details.
            </Text>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[COLORS.violet, COLORS.violetLight]}
            style={styles.saveButtonGradient}
          >
            <Ionicons name="checkmark" size={20} color={COLORS.textPrimary} />
            <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface SettingItemProps {
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  icon: string;
}

const SettingItem: React.FC<SettingItemProps> = ({
  label,
  description,
  value,
  onToggle,
  icon,
}) => (
  <View style={styles.settingItem}>
    <View style={styles.settingLeft}>
      <View
        style={[
          styles.settingIcon,
          { backgroundColor: value ? `${COLORS.mint}20` : `${COLORS.textMuted}10` },
        ]}
      >
        <Ionicons
          name={icon as any}
          size={18}
          color={value ? COLORS.mint : COLORS.textMuted}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: COLORS.border, true: COLORS.mint }}
      thumbColor={value ? COLORS.mint : COLORS.textMuted}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.elevated,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
  },
  sectionDescription: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: 'DMSans_400Regular',
    marginTop: 4,
  },
  settingsGroup: {
    marginTop: 24,
  },
  groupTitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: 'DMSans_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.elevated,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.textPrimary,
  },
  settingDescription: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: 'DMSans_400Regular',
    marginTop: 2,
  },
  privacyNotice: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: `${COLORS.mint}15`,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: `${COLORS.mint}30`,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.mint,
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_400Regular',
    lineHeight: 18,
  },
  link: {
    color: COLORS.violet,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
  },
});
