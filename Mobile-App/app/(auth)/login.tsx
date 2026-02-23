import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { STORAGE_KEYS } from '@/src/constants/categories';
import { apiService, setAuthToken } from '@/src/services/api';
import { useGoogleAuth, handleGoogleSignIn } from '@/src/utils/googleAuth';

const COLORS = {
  void: '#080810',
  surface: '#0F0F1A',
  elevated: '#1A1A2B',
  violet: '#7C5CFC',
  violetDeep: '#B06EFF',
  violetDim: 'rgba(124, 92, 252, 0.2)',
  textPrimary: '#F0F0FF',
  textSecondary: '#8888AA',
  textMuted: '#55556A',
  border: 'rgba(255, 255, 255, 0.06)',
};

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Google Auth
  const { request, response, promptAsync } = useGoogleAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  // Handle Google Sign-In response
  useEffect(() => {
    if (response) {
      handleGoogleAuthResponse();
    }
  }, [response]);

  const handleGoogleAuthResponse = async () => {
    if (!response) return;

    setGoogleLoading(true);
    setError('');

    const result = await handleGoogleSignIn(response);

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      setError(result.error || 'Google sign-in failed');
    }

    setGoogleLoading(false);
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      setError('Enter email and password to continue.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const response = await apiService.auth.login({ email: email.trim(), password });
      const token = response.data?.token;
      const user = response.data?.user;

      if (!token) {
        throw new Error('Missing token in response.');
      }

      await setAuthToken(token);
      if (user) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      }

      router.replace('/(tabs)');
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Login failed.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await promptAsync();
    } catch (err: any) {
      setError('Failed to initiate Google sign-in');
      setGoogleLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.card}>
        <Text style={styles.emoji}>👋</Text>
        <Text style={styles.hello}>Welcome back</Text>
        <Text style={styles.sub}>Sign in to your account</Text>

        <View style={styles.inputWrap}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputWrap}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignIn}
          activeOpacity={0.9}
          disabled={loading}
        >
          <LinearGradient colors={[COLORS.violet, COLORS.violetDeep]} style={styles.buttonFill}>
            {loading ? (
              <ActivityIndicator color={COLORS.textPrimary} />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={[styles.googleButton, (googleLoading || !request) && styles.buttonDisabled]}
          onPress={handleGoogleSignIn}
          activeOpacity={0.9}
          disabled={googleLoading || !request}
        >
          {googleLoading ? (
            <ActivityIndicator color={COLORS.textPrimary} />
          ) : (
            <>
              <Ionicons name="logo-google" size={20} color={COLORS.textPrimary} />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.helper}>Forgot password?</Text>

        <View style={styles.signupRow}>
          <Text style={styles.helper}>No account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.signupLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.void,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  hello: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'Syne_800ExtraBold',
    color: COLORS.textPrimary,
  },
  sub: {
    marginTop: 4,
    marginBottom: 18,
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textSecondary,
  },
  inputWrap: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: 'DMSans_600SemiBold',
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: COLORS.elevated,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontFamily: 'DMSans_400Regular',
  },
  button: {
    marginTop: 8,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.violet,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    overflow: 'hidden',
  },
  buttonFill: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: 'DMSans_400Regular',
  },
  googleButton: {
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.textPrimary,
  },
  helper: {
    marginTop: 12,
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: 'DMSans_400Regular',
    textAlign: 'center',
  },
  signupRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupLink: {
    fontSize: 11,
    color: COLORS.violet,
    fontWeight: '700',
    fontFamily: 'DMSans_600SemiBold',
  },
  errorText: {
    fontSize: 11,
    color: '#FF5F7E',
    marginBottom: 10,
    fontFamily: 'DMSans_400Regular',
  },
});
