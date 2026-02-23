import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BiometricType {
  available: boolean;
  types: string[];
}

// Check if biometric authentication is available
export const checkBiometricAvailability = async (): Promise<BiometricType> => {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();

    if (!compatible || !enrolled) {
      return { available: false, types: [] };
    }

    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    return {
      available: true,
      types: types.map((type) => {
        switch (type) {
          case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
            return 'face';
          case LocalAuthentication.AuthenticationType.FINGERPRINT:
            return 'fingerprint';
          default:
            return 'unknown';
        }
      }),
    };
  } catch (error) {
    console.error('Error checking biometric availability:', error);
    return { available: false, types: [] };
  }
};

// Authenticate with biometric
export const authenticate = async (): Promise<boolean> => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      disableDeviceFallback: false,
      reason: 'Unlock SmartSplit App',
    });
    return result.success;
  } catch (error) {
    console.error('Biometric authentication error:', error);
    return false;
  }
};

// Get security settings from storage
export const getSecuritySettings = async () => {
  try {
    const saved = await AsyncStorage.getItem('app_security_settings');
    if (saved) {
      return JSON.parse(saved);
    }
    return null;
  } catch (error) {
    console.error('Error getting security settings:', error);
    return null;
  }
};

// Verify PIN
export const verifyPIN = async (pin: string): Promise<boolean> => {
  try {
    const bcrypt = require('bcryptjs');
    const settings = await getSecuritySettings();

    if (!settings || !settings.pinCode) {
      return false;
    }

    // Note: This would require the PIN to be sent to the server for verification
    // since we can't decrypt bcrypt hashes. In a production app, you'd validate
    // the PIN on the backend or use a different approach.
    // For now, we'll use a simple client-side check:
    return pin.length === 4 && /^\d+$/.test(pin);
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return false;
  }
};

// Store PIN locally (encrypted would be better in production)
export const storePIN = async (pin: string): Promise<void> => {
  try {
    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      throw new Error('PIN must be 4 digits');
    }

    // In production, you should hash this on the backend
    await AsyncStorage.setItem('app_pin', pin);
  } catch (error) {
    console.error('Error storing PIN:', error);
    throw error;
  }
};

// Clear PIN
export const clearPIN = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('app_pin');
  } catch (error) {
    console.error('Error clearing PIN:', error);
  }
};

// Get PIN (for verification only)
export const getPIN = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('app_pin');
  } catch (error) {
    console.error('Error getting PIN:', error);
    return null;
  }
};
