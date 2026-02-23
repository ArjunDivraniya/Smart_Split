import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, setAuthToken } from '@/src/services/api';
import { STORAGE_KEYS } from '@/src/constants/categories';
import type { TokenResponse } from 'expo-auth-session';

// Initialize WebBrowser for authentication
WebBrowser.maybeCompleteAuthSession();

// Google OAuth Configuration
// Replace these with your actual Google OAuth credentials
const GOOGLE_CLIENT_ID_ANDROID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || '';
const GOOGLE_CLIENT_ID_IOS = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || '';
const GOOGLE_CLIENT_ID_WEB = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || '';

export interface GoogleAuthResult {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  error?: string;
}

/**
 * Hook for Google Sign-In
 * Returns [request, response, promptAsync] from expo-auth-session
 */
export const useGoogleAuth = () => {
  const redirectUri = makeRedirectUri({
    scheme: 'smartsplit',
    path: 'redirect',
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_CLIENT_ID_ANDROID,
    iosClientId: GOOGLE_CLIENT_ID_IOS,
    webClientId: GOOGLE_CLIENT_ID_WEB,
    redirectUri,
  });

  return { request, response, promptAsync };
};

/**
 * Process Google authentication response and login to backend
 */
export const handleGoogleSignIn = async (
  response: any
): Promise<GoogleAuthResult> => {
  try {
    if (response?.type !== 'success') {
      return {
        success: false,
        error: 'Google sign-in was cancelled or failed',
      };
    }

    const { authentication } = response;
    if (!authentication?.accessToken) {
      return {
        success: false,
        error: 'Failed to get access token from Google',
      };
    }

    // Fetch user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
      headers: { Authorization: `Bearer ${authentication.accessToken}` },
    });

    if (!userInfoResponse.ok) {
      return {
        success: false,
        error: 'Failed to fetch user info from Google',
      };
    }

    const userInfo = await userInfoResponse.json();

    // Login to backend with Google credentials
    const backendResponse = await apiService.auth.googleLogin({
      email: userInfo.email,
      name: userInfo.name || userInfo.email.split('@')[0],
      googleId: userInfo.id,
      profileImage: userInfo.picture || '',
    });

    const token = backendResponse.data?.token;
    const user = backendResponse.data?.user;

    if (!token) {
      return {
        success: false,
        error: 'Failed to get authentication token from server',
      };
    }

    // Store token and user data
    await setAuthToken(token);
    if (user) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    }

    return {
      success: true,
      token,
      user,
    };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    const message = error?.response?.data?.message || error?.message || 'Google sign-in failed';
    return {
      success: false,
      error: message,
    };
  }
};
