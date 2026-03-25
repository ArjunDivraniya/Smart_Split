/**
 * Quick Start Example - SmartSplit App
 * Copy this code structure to create your screens
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { isValidEmail } from '../utils/helpers';
import { apiService } from '../services/api';

/**
 * Example 1: Login Screen using AuthContext
 */
export function LoginScreenExample() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    try {
      await login(email, password);
      // User will be automatically navigated after login
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back!</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/**
 * Example 2: Trips List Screen using API Service
 */
export function TripsListExample() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const response = await apiService.trips.getAll();
      setTrips(response.data.trips || []);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Trips</Text>
      <ScrollView>
        {trips.map((trip: any) => (
          <View key={trip._id} style={styles.card}>
            <Text style={styles.cardTitle}>{trip.name}</Text>
            <Text style={styles.cardText}>{trip.destination}</Text>
            <Text style={styles.cardText}>
              Status: {trip.status}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

/**
 * Example 3: Create Expense Screen
 */
export function CreateExpenseExample({ tripId }: { tripId: string }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleCreateExpense = async () => {
    if (!description || !amount) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      await apiService.expenses.create({
        tripId,
        description,
        amount: parseFloat(amount),
        currency: 'USD',
        category,
        paidBy: user!.id,
        date: new Date().toISOString(),
        splitMethod: 'equally',
        splits: [], // Add members splits here
      });

      Alert.alert('Success', 'Expense created successfully');
      // Navigate back or reset form
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add Expense</Text>

      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />

      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCreateExpense}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating...' : 'Create Expense'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/**
 * Example Styles using Theme System
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.base,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FONTS.xxl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.md,
    fontSize: FONTS.md,
    backgroundColor: COLORS.white,
  },
  button: {
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
    ...SHADOWS.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONTS.md,
    fontWeight: FONTS.weight.semibold,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.base,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  cardTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  cardText: {
    fontSize: FONTS.base,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});

/**
 * Example: Using Custom Hooks
 */
import { useApi } from '../hooks/useApi';

export function TripsListWithHook() {
  const { data, loading, error, execute } = useApi(apiService.trips.getAll);

  useEffect(() => {
    execute();
  }, []);

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <View>
      {data?.trips?.map((trip: any) => (
        <Text key={trip._id}>{trip.name}</Text>
      ))}
    </View>
  );
}

/**
 * Export all examples
 */
export default {
  LoginScreenExample,
  TripsListExample,
  CreateExpenseExample,
  TripsListWithHook,
};
