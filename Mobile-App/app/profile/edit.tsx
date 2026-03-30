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
  Image,
  ActivityIndicator,
  ActionSheetIOS,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import useProfile from '@/src/hooks/useProfile';
import { apiService } from '@/src/services/api';
import { showSuccessToast } from '@/src/utils/toast';
import { useBackNavigation } from '@/src/hooks/useBackNavigation';

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

export default function EditProfileScreen() {
  const router = useRouter();
  const handleBack = useBackNavigation('/profile' as any, undefined, { alwaysUseFallback: true });
  const { profile, loading: profileLoading } = useProfile();

  // Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [upiId, setUpiId] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [savingsGoal, setSavingsGoal] = useState('');
  const [avatar, setAvatar] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  // Track initial values for change detection
  const [initialValues, setInitialValues] = useState({
    fullName: '',
    phone: '',
    upiId: '',
    monthlyIncome: '',
    savingsGoal: '',
    avatar: '',
  });

  // Load profile data on mount
  useEffect(() => {
    if (profile) {
      const name = profile.user?.name || '';
      const phoneNum = profile.user?.phone || '';
      const upi = profile.user?.upiId || '';
      const income = profile.user?.monthlyIncome ? String(profile.user.monthlyIncome) : '';
      const savings = profile.user?.savingsGoal ? String(profile.user.savingsGoal) : '';
      const avatarUrl = profile.user?.avatar || '';

      setFullName(name);
      setPhone(phoneNum);
      setUpiId(upi);
      setMonthlyIncome(income);
      setSavingsGoal(savings);
      setAvatar(avatarUrl);

      setInitialValues({
        fullName: name,
        phone: phoneNum,
        upiId: upi,
        monthlyIncome: income,
        savingsGoal: savings,
        avatar: avatarUrl,
      });
    }
  }, [profile]);

  // Check for changes
  useEffect(() => {
    const changed =
      fullName !== initialValues.fullName ||
      phone !== initialValues.phone ||
      upiId !== initialValues.upiId ||
      monthlyIncome !== initialValues.monthlyIncome ||
      savingsGoal !== initialValues.savingsGoal ||
      avatar !== initialValues.avatar;
    setHasChanges(changed);
  }, [fullName, phone, upiId, monthlyIncome, savingsGoal, avatar, initialValues]);

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (phone.trim()) {
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length !== 10) {
        newErrors.phone = 'Phone must be exactly 10 digits';
      }
    }

    if (upiId.trim() && !upiId.includes('@')) {
      newErrors.upiId = 'UPI ID must contain @ symbol';
    }

    if (monthlyIncome.trim()) {
      const income = parseFloat(monthlyIncome);
      if (isNaN(income) || income < 0) {
        newErrors.monthlyIncome = 'Monthly income must be a positive number';
      }
    }

    if (savingsGoal.trim()) {
      const savings = parseFloat(savingsGoal);
      if (isNaN(savings) || savings < 0) {
        newErrors.savingsGoal = 'Savings goal must be a positive number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Image picker
  const handlePickPhoto = async (source: 'camera' | 'gallery') => {
    try {
      setShowPhotoOptions(false);

      let result;
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission Needed', 'Camera access is required to take a photo.');
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
          base64: true,
        });
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission Needed', 'Photo library access is required.');
          return;
        }

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
          base64: true,
        });
      }

      if (!result.canceled && result.assets?.[0]) {
        if (result.assets[0].base64) {
          setAvatar(`data:image/jpeg;base64,${result.assets[0].base64}`);
        } else {
          setAvatar(result.assets[0].uri);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick photo. Please try again.');
      console.error('Image picker error:', error);
    }
  };

  useEffect(() => {
    if (Platform.OS !== 'ios' || !showPhotoOptions) {
      return;
    }

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', 'Take Photo', 'Choose from Gallery'],
        cancelButtonIndex: 0,
        userInterfaceStyle: 'dark',
      },
      (index: number) => {
        if (index === 1) {
          void handlePickPhoto('camera');
        }
        if (index === 2) {
          void handlePickPhoto('gallery');
        }
        setShowPhotoOptions(false);
      }
    );
  }, [showPhotoOptions]);

  // Save changes
  const handleSave = async () => {
    if (!validate()) {
      Alert.alert('Validation Error', 'Please fix the errors in your form.');
      return;
    }

    setLoading(true);
    try {
      const updateData: any = {
        name: fullName.trim(),
      };

      if (phone.trim()) {
        updateData.phone = phone.replace(/\D/g, '');
      }

      if (upiId.trim()) {
        updateData.upiId = upiId.trim();
      }

      if (monthlyIncome.trim()) {
        updateData.monthlyIncome = parseFloat(monthlyIncome);
      }

      if (savingsGoal.trim()) {
        updateData.savingsGoal = parseFloat(savingsGoal);
      }

      // Pass the avatar (either a URL or base64) to updateProfile
      if (avatar !== initialValues.avatar && avatar) {
        updateData.avatar = avatar;
      }

      // Update profile
      await apiService.profile.updateProfile(updateData);
      showSuccessToast('✅ Profile updated');

      Alert.alert('Success', 'Profile updated successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setInitialValues({
              fullName,
              phone,
              upiId,
              monthlyIncome,
              savingsGoal,
              avatar,
            });
            setHasChanges(false);
            handleBack();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
      console.error('Save profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={COLORS.violet} />
          <Text style={styles.loaderText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} hitSlop={12}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={!hasChanges || loading}
            hitSlop={12}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.violet} />
            ) : (
              <Text
                style={[
                  styles.saveButton,
                  { color: hasChanges && !loading ? COLORS.violet : COLORS.textMuted },
                ]}
              >
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {avatar && (avatar.startsWith('http') || avatar.startsWith('file://')) ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <LinearGradient
                  colors={[COLORS.violet, '#B06EFF']}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>
                    {fullName.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </LinearGradient>
              )}
              <TouchableOpacity
                style={styles.changePhotoButton}
                onPress={() => setShowPhotoOptions(true)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="camera-alt" size={16} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => setShowPhotoOptions(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.fullName && styles.inputContainerError,
                ]}
              >
                <MaterialIcons name="person" size={20} color={COLORS.textMuted} />
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your full name"
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="words"
                />
              </View>
              {errors.fullName && (
                <Text style={styles.errorText}>{errors.fullName}</Text>
              )}
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.phone && styles.inputContainerError,
                ]}
              >
                <MaterialIcons name="phone" size={20} color={COLORS.textMuted} />
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="9171234567"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            {/* UPI ID */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>UPI ID</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.upiId && styles.inputContainerError,
                ]}
              >
                <Ionicons name="card" size={20} color={COLORS.textMuted} />
                <TextInput
                  style={styles.input}
                  value={upiId}
                  onChangeText={setUpiId}
                  placeholder="yourname@okaxis"
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              {errors.upiId && <Text style={styles.errorText}>{errors.upiId}</Text>}
            </View>

            {/* Monthly Income */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Monthly Income (optional)</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.monthlyIncome && styles.inputContainerError,
                ]}
              >
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.input}
                  value={monthlyIncome}
                  onChangeText={setMonthlyIncome}
                  placeholder="0"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="decimal-pad"
                />
              </View>
              {errors.monthlyIncome && (
                <Text style={styles.errorText}>{errors.monthlyIncome}</Text>
              )}
            </View>

            {/* Savings Goal */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Savings Goal (optional)</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.savingsGoal && styles.inputContainerError,
                ]}
              >
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.input}
                  value={savingsGoal}
                  onChangeText={setSavingsGoal}
                  placeholder="0"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="decimal-pad"
                />
              </View>
              {errors.savingsGoal && (
                <Text style={styles.errorText}>{errors.savingsGoal}</Text>
              )}
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[
                styles.saveChangesButton,
                { opacity: hasChanges && !loading ? 1 : 0.5 },
              ]}
              onPress={handleSave}
              disabled={!hasChanges || loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.textPrimary} />
              ) : (
                <Text style={styles.saveChangesButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>

            <View style={styles.bottomPadding} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Android Photo Options */}
      {Platform.OS === 'android' && showPhotoOptions && (
        <View style={styles.modalOverlay}>
          <View style={styles.photoModal}>
            <Text style={styles.photoModalTitle}>Choose Photo Source</Text>
            <TouchableOpacity
              style={styles.photoOption}
              onPress={() => {
                handlePickPhoto('camera');
                setShowPhotoOptions(false);
              }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="photo-camera" size={24} color={COLORS.violet} />
              <Text style={styles.photoOptionText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.photoOption}
              onPress={() => {
                handlePickPhoto('gallery');
                setShowPhotoOptions(false);
              }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="photo-library" size={24} color={COLORS.violet} />
              <Text style={styles.photoOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.photoOptionCancel}
              onPress={() => setShowPhotoOptions(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.photoOptionCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.void,
  },
  flex: {
    flex: 1,
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
    fontSize: 24,
    fontFamily: 'Syne_700Bold',
    fontWeight: '700',
  },
  saveButton: {
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.elevated,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.violet,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  avatarText: {
    fontSize: 40,
    fontFamily: 'Syne_700Bold',
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.violet,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.void,
    shadowColor: COLORS.violet,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  changePhotoText: {
    color: COLORS.violet,
    fontSize: 13,
    fontFamily: 'DMSans_600SemiBold',
    fontWeight: '600',
  },
  formSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontFamily: 'DMSans_600SemiBold',
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  inputContainerError: {
    borderColor: COLORS.coral,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
  },
  currencySymbol: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontFamily: 'DMSans_600SemiBold',
    fontWeight: '600',
  },
  errorText: {
    color: COLORS.coral,
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    marginTop: 6,
  },
  saveChangesButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: COLORS.violet,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: COLORS.violet,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  saveChangesButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
    fontWeight: '600',
  },
  bottomPadding: {
    height: 24,
  },
  modalOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  photoModal: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  photoModalTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontFamily: 'Syne_700Bold',
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  photoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  photoOptionText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
  },
  photoOptionCancel: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  photoOptionCancelText: {
    color: COLORS.coral,
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
    fontWeight: '600',
    textAlign: 'center',
  },
});
