import React, { useState } from 'react';
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
  textPrimary: '#F0F0FF',
  textSecondary: '#8888AA',
  textMuted: '#55556A',
  border: 'rgba(255, 255, 255, 0.06)',
};

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await apiService.profile.changePassword({
        currentPassword,
        newPassword,
      });

      Alert.alert('Success', 'Password changed successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to change password'
      );
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.headerTitle}>Change Password</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Security Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[COLORS.violet, COLORS.violetLight]}
              style={styles.iconGradient}
            >
              <Ionicons name="key" size={40} color={COLORS.textPrimary} />
            </LinearGradient>
          </View>

          <Text style={styles.description}>
            Choose a strong password to keep your account secure
          </Text>

          {/* Current Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Current Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color={COLORS.textMuted} />
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showCurrent}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowCurrent(!showCurrent)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showCurrent ? 'eye-off' : 'eye'}
                  size={20}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>New Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color={COLORS.textMuted} />
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showNew}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowNew(!showNew)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showNew ? 'eye-off' : 'eye'}
                  size={20}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>
            {newPassword.length > 0 && newPassword.length < 6 && (
              <Text style={styles.errorText}>
                Password must be at least 6 characters
              </Text>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color={COLORS.textMuted} />
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter new password"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowConfirm(!showConfirm)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showConfirm ? 'eye-off' : 'eye'}
                  size={20}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>
            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <Text style={styles.errorText}>Passwords do not match</Text>
            )}
          </View>

          {/* Password Tips */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>Password Tips:</Text>
            <View style={styles.tipRow}>
              <Ionicons
                name={newPassword.length >= 6 ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={newPassword.length >= 6 ? COLORS.mint : COLORS.textMuted}
              />
              <Text style={styles.tipText}>At least 6 characters</Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons
                name={/[A-Z]/.test(newPassword) ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={/[A-Z]/.test(newPassword) ? COLORS.mint : COLORS.textMuted}
              />
              <Text style={styles.tipText}>Include uppercase letter</Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons
                name={/[0-9]/.test(newPassword) ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={/[0-9]/.test(newPassword) ? COLORS.mint : COLORS.textMuted}
              />
              <Text style={styles.tipText}>Include number</Text>
            </View>
          </View>

          {/* Change Password Button */}
          <TouchableOpacity
            style={[styles.changeButton, loading && styles.changeButtonDisabled]}
            onPress={handleChangePassword}
            disabled={loading}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[COLORS.violet, COLORS.violetLight]}
              style={styles.changeButtonGradient}
            >
              <Ionicons name="shield-checkmark" size={20} color={COLORS.textPrimary} />
              <Text style={styles.changeButtonText}>
                {loading ? 'Changing...' : 'Change Password'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_400Regular',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.elevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    height: 52,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textPrimary,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.coral,
    fontFamily: 'DMSans_400Regular',
    marginTop: 4,
  },
  tipsCard: {
    backgroundColor: COLORS.elevated,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_400Regular',
  },
  changeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  changeButtonDisabled: {
    opacity: 0.5,
  },
  changeButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  changeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
  },
});
