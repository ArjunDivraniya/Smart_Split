import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/src/context';
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

export default function RegisterScreen() {
  const router = useRouter();
  const { register, refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      await refreshUser();
      router.replace('/(tabs)');
    } else {
      setError(result.error || 'Google sign-in failed');
    }

    setGoogleLoading(false);
  };

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Fill all fields to continue.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await register(name.trim(), email.trim(), password);
      // Wait a tiny bit to ensure context state is synced or just use router.replace
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
    } catch (err: any) {
      // AuthContext already maps the error, but we can double check here
      const message = err?.message || 'Registration failed.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignInPress = async () => {
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
        <Text style={styles.emoji}>✨</Text>
        <Text style={styles.hello}>Create account</Text>
        <Text style={styles.sub}>Start splitting in seconds</Text>

        <View style={styles.inputWrap}>
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={COLORS.textMuted}
            value={name}
            onChangeText={setName}
          />
        </View>

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

        <View style={styles.inputWrap}>
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          activeOpacity={0.9}
          disabled={loading}
        >
          <LinearGradient colors={[COLORS.violet, COLORS.violetDeep]} style={styles.buttonFill}>
            {loading ? (
              <ActivityIndicator color={COLORS.textPrimary} />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
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
          onPress={handleGoogleSignInPress}
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

        <View style={styles.loginRow}>
          <Text style={styles.helper}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.loginLink}>Sign in</Text>
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
  loginRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLink: {
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
