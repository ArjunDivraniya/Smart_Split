import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
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

interface PaymentMethod {
  id: string;
  type: 'upi' | 'bank' | 'card' | 'wallet';
  label: string;
  icon: string;
  isDefault: boolean;
}

export default function PaymentPreferencesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [autoPay, setAutoPay] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'upi', label: 'UPI', icon: 'wallet', isDefault: true },
    { id: '2', type: 'bank', label: 'Bank Transfer', icon: 'card', isDefault: false },
    { id: '3', type: 'card', label: 'Debit Card', icon: 'credit', isDefault: false },
    { id: '4', type: 'wallet', label: 'Mobile Wallet', icon: 'phone-portrait', isDefault: false },
  ]);

  useEffect(() => {
    loadPaymentSettings();
  }, []);

  const loadPaymentSettings = async () => {
    try {
      const response = await apiService.user.getMe();
      if (response.data?.success) {
        const prefs = response.data.data.paymentPreferences;
        setUpiId(prefs?.upiId || '');
        setBankAccount(prefs?.bankAccount || '');
        setAutoPay(prefs?.autoPay || false);
      }
    } catch (error) {
      console.error('Error loading payment settings:', error);
    }
  };

  const handleSave = async () => {
    if (!upiId.trim() && !bankAccount.trim()) {
      Alert.alert('Invalid', 'Please add at least one payment method');
      return;
    }
    setLoading(true);
    try {
      const data = {
        paymentPreferences: {
          upiId: upiId.trim(),
          bankAccount: bankAccount.trim(),
          autoPay,
        },
      };
      await apiService.profile.updatePaymentPreferences(data);
      Alert.alert('Success', 'Payment preferences updated successfully');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const toggleMethod = (id: string) => {
    setPaymentMethods(
      paymentMethods.map((m) => ({
        ...m,
        isDefault: m.id === id ? !m.isDefault : m.isDefault,
      }))
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
          <Text style={styles.headerTitle}>Payment Preferences</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          <View style={styles.methodsList}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={styles.methodItem}
                onPress={() => toggleMethod(method.id)}
                activeOpacity={0.7}
              >
                <View style={styles.methodLeft}>
                  <View
                    style={[
                      styles.methodIcon,
                      { backgroundColor: method.isDefault ? `${COLORS.mint}20` : `${COLORS.violet}20` },
                    ]}
                  >
                    <Ionicons
                      name={method.icon as any}
                      size={20}
                      color={method.isDefault ? COLORS.mint : COLORS.violet}
                    />
                  </View>
                  <Text style={styles.methodLabel}>{method.label}</Text>
                </View>
                {method.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.mint} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* UPI Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>UPI ID</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="wallet" size={18} color={COLORS.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="name@upi"
              placeholderTextColor={COLORS.textMuted}
              value={upiId}
              onChangeText={setUpiId}
            />
          </View>
          <Text style={styles.helperText}>e.g., yourname@paytm or yourname@googleplay</Text>
        </View>

        {/* Bank Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bank Account</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="card" size={18} color={COLORS.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Account Number"
              placeholderTextColor={COLORS.textMuted}
              value={bankAccount}
              onChangeText={setBankAccount}
            />
          </View>
        </View>

        {/* Auto-pay Settings */}
        <View style={styles.section}>
          <View style={styles.autoPayHeader}>
            <View>
              <Text style={styles.sectionTitle}>Auto Settlement</Text>
              <Text style={styles.description}>Allow automatic payments on due date</Text>
            </View>
            <Switch
              value={autoPay}
              onValueChange={setAutoPay}
              trackColor={{ false: COLORS.border, true: COLORS.mint }}
              thumbColor={autoPay ? COLORS.mint : COLORS.textMuted}
            />
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={COLORS.violet} />
          <Text style={styles.infoText}>
            These payment details will be used for settlements and refunds. Your data is encrypted and secure.
          </Text>
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
    </KeyboardAvoidingView>
  );
}

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
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  methodsList: {
    backgroundColor: COLORS.elevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodLabel: {
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.textPrimary,
  },
  defaultBadge: {
    padding: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.elevated,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    color: COLORS.textPrimary,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
  },
  helperText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: 'DMSans_400Regular',
    marginTop: 6,
  },
  autoPayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.elevated,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  description: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_400Regular',
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: `${COLORS.violet}15`,
    borderRadius: 12,
    padding: 12,
    marginTop: 24,
    borderWidth: 1,
    borderColor: `${COLORS.violet}30`,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_400Regular',
    lineHeight: 18,
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
