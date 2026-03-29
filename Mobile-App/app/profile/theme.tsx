import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  useColorScheme,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  lightBg: '#F5F5F5',
  lightSurface: '#FFFFFF',
  lightText: '#1A1A1A',
};

export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeOption {
  id: ThemeMode;
  label: string;
  description: string;
  icon: string;
  colors: { bg: string; text: string; accent: string };
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'dark',
    label: 'Dark Mode',
    description: 'Easy on the eyes, perfect for night',
    icon: 'moon',
    colors: { bg: COLORS.surface, text: COLORS.textPrimary, accent: COLORS.violet },
  },
  {
    id: 'light',
    label: 'Light Mode',
    description: 'Bright and clean appearance',
    icon: 'sunny',
    colors: { bg: COLORS.lightBg, text: COLORS.lightText, accent: COLORS.violet },
  },
  {
    id: 'system',
    label: 'System Default',
    description: 'Follow device settings',
    icon: 'phone-portrait',
    colors: { bg: COLORS.elevated, text: COLORS.textPrimary, accent: COLORS.mint },
  },
];

export default function ThemeScreen() {
  const router = useRouter();
  const systemTheme = useColorScheme();
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>('dark');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem('app_theme');
      if (saved) {
        setSelectedTheme(saved as ThemeMode);
      } else {
        const response = await apiService.user.getMe();
        if (response.data?.success) {
          const prefs = response.data.data.preferences;
          setSelectedTheme(prefs?.theme || 'dark');
        }
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const handleSelectTheme = async (theme: ThemeMode) => {
    setLoading(true);
    try {
      setSelectedTheme(theme);
      await AsyncStorage.setItem('app_theme', theme);

      // Update on server with preferences object
      try {
        await apiService.profile.updatePreferences({ theme });
      } catch (error) {
        console.log('Server update failed, saved locally');
      }

      const themeName = THEME_OPTIONS.find((t) => t.id === theme)?.label || theme;
      Alert.alert('Success', `Theme changed to ${themeName}`);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update theme');
      setSelectedTheme('dark');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentTheme = () => {
    if (selectedTheme === 'system') {
      return systemTheme === 'dark' ? 'dark' : 'light';
    }
    return selectedTheme;
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
          <Text style={styles.headerTitle}>Theme</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          Choose how you'd like the app to look. Select from dark, light, or follow your system settings.
        </Text>

        <View style={styles.themeList}>
          {THEME_OPTIONS.map((option) => {
            const isSelected = selectedTheme === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.themeCard,
                  isSelected && styles.themeCardSelected,
                ]}
                onPress={() => handleSelectTheme(option.id)}
                activeOpacity={0.7}
                disabled={loading}
              >
                <View style={styles.themeContent}>
                  <View
                    style={[
                      styles.themePreview,
                      { backgroundColor: option.colors.bg },
                    ]}
                  >
                    <View style={styles.previewContent}>
                      <View
                        style={{
                          width: '80%',
                          height: 8,
                          backgroundColor: option.colors.text,
                          borderRadius: 2,
                          marginBottom: 6,
                          opacity: 0.3,
                        }}
                      />
                      <View
                        style={{
                          width: '60%',
                          height: 6,
                          backgroundColor: option.colors.text,
                          borderRadius: 2,
                          opacity: 0.2,
                        }}
                      />
                    </View>
                  </View>

                  <View style={styles.themeInfo}>
                    <View style={styles.themeHeader}>
                      <Ionicons
                        name={option.icon as any}
                        size={20}
                        color={option.colors.accent}
                      />
                      <Text style={styles.themeLabel}>{option.label}</Text>
                    </View>
                    <Text style={styles.themeDescription}>{option.description}</Text>
                  </View>
                </View>

                {isSelected && (
                  <View style={styles.selectionBadge}>
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.mint} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Current Theme Preview */}
        <View style={styles.previewSection}>
          <Text style={styles.previewTitle}>Preview</Text>
          <View
            style={[
              styles.previewBox,
              {
                backgroundColor:
                  getCurrentTheme() === 'dark'
                    ? COLORS.elevated
                    : COLORS.lightSurface,
                borderColor:
                  getCurrentTheme() === 'dark'
                    ? COLORS.border
                    : `${COLORS.lightText}15`,
              },
            ]}
          >
            <Text
              style={{
                color: getCurrentTheme() === 'dark'
                  ? COLORS.textPrimary
                  : COLORS.lightText,
                fontSize: 16,
                fontFamily: 'DMSans_600SemiBold',
              }}
            >
              This is how text looks in {selectedTheme} mode
            </Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={COLORS.violet} />
          <Text style={styles.infoText}>
            When set to System, the app will follow your device's theme preferences and automatically switch between dark and light modes.
          </Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
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
  themeList: {
    gap: 12,
  },
  themeCard: {
    backgroundColor: COLORS.elevated,
    borderRadius: 16,
    padding: 0,
    borderWidth: 2,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  themeCardSelected: {
    borderColor: COLORS.mint,
    backgroundColor: `${COLORS.mint}10`,
  },
  themeContent: {
    flexDirection: 'row',
    gap: 12,
  },
  themePreview: {
    width: '30%',
    minHeight: 120,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContent: {
    width: '100%',
    alignItems: 'center',
  },
  themeInfo: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    justifyContent: 'space-between',
  },
  themeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
  },
  themeDescription: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: 'DMSans_400Regular',
    lineHeight: 16,
  },
  selectionBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  previewSection: {
    marginTop: 24,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  previewBox: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
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
});
