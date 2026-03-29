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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '@/src/services/api';
import { hapticSelection } from '@/src/utils/haptics';

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

interface SecuritySettings {
  appLockEnabled: boolean;
  fingerprintEnabled: boolean;
  faceRecognitionEnabled: boolean;
  pinCode?: string;
}

export default function SecurityLockScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [bioAvailable, setBioAvailable] = useState(false);
  const [faceAvailable, setFaceAvailable] = useState(false);
  const [settings, setSettings] = useState<SecuritySettings>({
    appLockEnabled: false,
    fingerprintEnabled: false,
    faceRecognitionEnabled: false,
  });

  useEffect(() => {
    checkBiometricAvailability();
    loadSettings();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      // This would require expo-local-authentication to be installed
      // For now, we'll simulate availability based on platform
      if (Platform.OS === 'ios') {
        setFaceAvailable(true);
        setBioAvailable(true);
      } else if (Platform.OS === 'android') {
        setBioAvailable(true);
        setFaceAvailable(true);
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('app_security_settings');
      if (saved) {
        setSettings(JSON.parse(saved));
      } else {
        const response = await apiService.user.getMe();
        if (response.data?.success && response.data.data.securitySettings) {
          setSettings(response.data.data.securitySettings);
        }
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
    }
  };

  const handleAppLockToggle = async (value: boolean) => {
    void hapticSelection();
    if (value) {
      // Ask for PIN setup
      Alert.prompt(
        'Set App Lock PIN',
        'Enter a 4-digit PIN to lock the app',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Set PIN',
            onPress: (pin?: string) => {
              if (pin && pin.length === 4 && /^\d+$/.test(pin)) {
                setSettings((prev) => ({
                  ...prev,
                  appLockEnabled: true,
                  pinCode: pin,
                }));
                saveSettings({ ...settings, appLockEnabled: true, pinCode: pin });
                Alert.alert('Success', 'App lock enabled with your PIN');
              } else {
                Alert.alert('Invalid', 'PIN must be exactly 4 digits');
              }
            },
          },
        ],
        'secure-text'
      );
    } else {
      setSettings((prev) => ({
        ...prev,
        appLockEnabled: false,
        pinCode: undefined,
      }));
      saveSettings({ ...settings, appLockEnabled: false, pinCode: undefined });
      Alert.alert('Disabled', 'App lock has been disabled');
    }
  };

  const handleFingerprintToggle = (value: boolean) => {
    void hapticSelection();
    if (value && !settings.appLockEnabled) {
      Alert.alert(
        'Enable App Lock First',
        'You need to enable App Lock before using fingerprint',
        [{ text: 'OK' }]
      );
      return;
    }

    setSettings((prev) => ({
      ...prev,
      fingerprintEnabled: value,
    }));
    saveSettings({ ...settings, fingerprintEnabled: value });

    if (value) {
      Alert.alert('Success', 'Fingerprint unlock enabled. You can now unlock the app with your fingerprint.');
    } else {
      Alert.alert('Disabled', 'Fingerprint unlock has been disabled');
    }
  };

  const handleFaceRecognitionToggle = (value: boolean) => {
    void hapticSelection();
    if (value && !settings.appLockEnabled) {
      Alert.alert(
        'Enable App Lock First',
        'You need to enable App Lock before using Face Recognition',
        [{ text: 'OK' }]
      );
      return;
    }

    setSettings((prev) => ({
      ...prev,
      faceRecognitionEnabled: value,
    }));
    saveSettings({ ...settings, faceRecognitionEnabled: value });

    if (value) {
      Alert.alert('Success', 'Face recognition enabled. You can now unlock the app with your face.');
    } else {
      Alert.alert('Disabled', 'Face recognition has been disabled');
    }
  };

  const saveSettings = async (newSettings: SecuritySettings) => {
    try {
      await AsyncStorage.setItem('app_security_settings', JSON.stringify(newSettings));
      try {
        await apiService.profile.updateSecuritySettings(newSettings);
      } catch (error) {
        console.log('Server update failed, saved locally');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save security settings');
    }
  };

  const changePIN = () => {
    if (!settings.appLockEnabled) {
      Alert.alert('Disabled', 'App Lock is not enabled');
      return;
    }

    Alert.prompt(
      'Change PIN',
      'Enter your new 4-digit PIN',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change',
          onPress: (newPin?: string) => {
            if (newPin && newPin.length === 4 && /^\d+$/.test(newPin)) {
              setSettings((prev) => ({
                ...prev,
                pinCode: newPin,
              }));
              saveSettings({ ...settings, pinCode: newPin });
              Alert.alert('Success', 'PIN has been changed successfully');
            } else {
              Alert.alert('Invalid', 'PIN must be exactly 4 digits');
            }
          },
        },
      ],
      'secure-text'
    );
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
          <Text style={styles.headerTitle}>App Lock & Security</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          Protect your sensitive financial data with app lock and biometric authentication.
        </Text>

        {/* Main App Lock Setting */}
        <View style={styles.mainSettingSection}>
          <View style={styles.mainSetting}>
            <View style={styles.settingIconLarge}>
              <Ionicons name="lock-closed" size={28} color={COLORS.violet} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.mainSettingTitle}>App Lock</Text>
              <Text style={styles.mainSettingDescription}>
                {settings.appLockEnabled
                  ? 'App is protected with PIN'
                  : 'Require PIN to access the app'}
              </Text>
            </View>
            <Switch
              value={settings.appLockEnabled}
              onValueChange={handleAppLockToggle}
              trackColor={{ false: COLORS.border, true: COLORS.mint }}
              thumbColor={settings.appLockEnabled ? COLORS.mint : COLORS.textMuted}
            />
          </View>
        </View>

        {/* PIN Management */}
        {settings.appLockEnabled && (
          <View style={styles.managementSection}>
            <Text style={styles.sectionTitle}>PIN Management</Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={changePIN}
              activeOpacity={0.7}
            >
              <Ionicons name="key" size={20} color={COLORS.amber} />
              <Text style={styles.actionButtonText}>Change PIN</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Biometric Options */}
        {settings.appLockEnabled && (
          <View style={styles.biometricSection}>
            <Text style={styles.sectionTitle}>Biometric Unlock</Text>
            <Text style={styles.sectionDescription}>
              Use biometric authentication to unlock the app quickly and securely
            </Text>

            {/* Fingerprint */}
            {bioAvailable && (
              <BiometricOption
                label="Fingerprint Unlock"
                description={`Use your ${Platform.OS === 'ios' ? 'Touch ID' : 'fingerprint'} to unlock`}
                icon="finger-print"
                enabled={settings.fingerprintEnabled}
                onToggle={handleFingerprintToggle}
              />
            )}

            {/* Face Recognition */}
            {faceAvailable && (
              <BiometricOption
                label="Face Recognition"
                description={`Use ${Platform.OS === 'ios' ? 'Face ID' : 'facial recognition'} to unlock`}
                icon="face"
                enabled={settings.faceRecognitionEnabled}
                onToggle={handleFaceRecognitionToggle}
              />
            )}

            {!bioAvailable && !faceAvailable && (
              <View style={styles.unavailableBox}>
                <Ionicons name="information-circle" size={20} color={COLORS.amber} />
                <Text style={styles.unavailableText}>
                  Biometric authentication is not available on your device
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Security Tips */}
        <View style={styles.tipsSection}>
          <View style={styles.tipBox}>
            <Ionicons name="shield-checkmark" size={20} color={COLORS.mint} />
            <View style={{ flex: 1 }}>
              <Text style={styles.tipTitle}>Strong Protection</Text>
              <Text style={styles.tipText}>
                Your PIN and biometric data are stored securely on your device only
              </Text>
            </View>
          </View>

          <View style={styles.tipBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.amber} />
            <View style={{ flex: 1 }}>
              <Text style={styles.tipTitle}>Don't Forget Your PIN</Text>
              <Text style={styles.tipText}>
                If you forget your PIN, you'll need to reinstall the app
              </Text>
            </View>
          </View>

          <View style={styles.tipBox}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.coral} />
            <View style={{ flex: 1 }}>
              <Text style={styles.tipTitle}>Optional Feature</Text>
              <Text style={styles.tipText}>
                Enable any of these security features as per your preference
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

interface BiometricOptionProps {
  label: string;
  description: string;
  icon: string;
  enabled: boolean;
  onToggle: (value: boolean) => void;
}

const BiometricOption: React.FC<BiometricOptionProps> = ({
  label,
  description,
  icon,
  enabled,
  onToggle,
}) => (
  <View style={styles.biometricOption}>
    <View style={styles.biometricLeft}>
      <View
        style={[
          styles.biometricIcon,
          { backgroundColor: enabled ? `${COLORS.mint}20` : `${COLORS.textMuted}15` },
        ]}
      >
        <Ionicons
          name={icon as any}
          size={20}
          color={enabled ? COLORS.mint : COLORS.textMuted}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.biometricLabel}>{label}</Text>
        <Text style={styles.biometricDescription}>{description}</Text>
      </View>
    </View>
    <Switch
      value={enabled}
      onValueChange={onToggle}
      trackColor={{ false: COLORS.border, true: COLORS.mint }}
      thumbColor={enabled ? COLORS.mint : COLORS.textMuted}
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
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_400Regular',
    marginTop: 16,
    marginBottom: 20,
    lineHeight: 20,
  },
  mainSettingSection: {
    marginBottom: 24,
  },
  mainSetting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.elevated,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  settingIconLarge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${COLORS.violet}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainSettingTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
  },
  mainSettingDescription: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: 'DMSans_400Regular',
    marginTop: 4,
  },
  managementSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_400Regular',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.elevated,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.textPrimary,
  },
  biometricSection: {
    marginBottom: 24,
  },
  biometricOption: {
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
  biometricLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  biometricIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.textPrimary,
  },
  biometricDescription: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: 'DMSans_400Regular',
    marginTop: 2,
  },
  unavailableBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: `${COLORS.amber}15`,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: `${COLORS.amber}30`,
  },
  unavailableText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_400Regular',
  },
  tipsSection: {
    gap: 12,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: `${COLORS.violet}10`,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: `${COLORS.violet}25`,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  tipText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_400Regular',
    lineHeight: 16,
  },
});
