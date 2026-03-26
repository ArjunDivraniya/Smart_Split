import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, setAuthToken, setRefreshToken, clearAuthToken, getRefreshToken } from '../services/api';
import { STORAGE_KEYS } from '../constants/categories';

// User Interface
export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  phone?: string;
  createdAt?: string;
}

// Auth Context Interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  googleLogin: (email: string, name: string, googleId: string, profileImage?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if user is already logged in
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);

      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      const refreshToken = await getRefreshToken();

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log('✅ User authenticated from storage');
        return;
      }

      // If access token is missing/expired but refresh token + user exist,
      // refresh session silently and keep user logged in.
      if (!token && refreshToken && userData) {
        try {
          const refreshResponse = await apiService.auth.refresh(refreshToken);
          const newToken = refreshResponse?.data?.token;
          const rotatedRefreshToken = refreshResponse?.data?.refreshToken;

          if (newToken) {
            await setAuthToken(newToken);
            if (rotatedRefreshToken) {
              await setRefreshToken(rotatedRefreshToken);
            }

            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            console.log('✅ Session restored using refresh token');
            return;
          }
        } catch (refreshError) {
          console.error('Refresh during startup failed:', refreshError);
          await clearAuthToken();
          await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.auth.login({ email, password });
      const { token, refreshToken, user: userData } = response.data;
      
      // Store token and user data
      await setAuthToken(token);
      if (refreshToken) {
        await setRefreshToken(refreshToken);
      }
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      
      setUser(userData);
      console.log('✅ Login successful');
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  // Register new user
  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await apiService.auth.register({ name, email, password });
      console.log('✅ Registration successful');
      
      // Auto-login after registration
      await login(email, password);
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  // Google OAuth Login
  const googleLogin = async (
    email: string,
    name: string,
    googleId: string,
    profileImage?: string
  ) => {
    try {
      const response = await apiService.auth.googleLogin({
        email,
        name,
        googleId,
        profileImage,
      });
      
      const { token, refreshToken, user: userData } = response.data;
      
      // Store token and user data
      await setAuthToken(token);
      if (refreshToken) {
        await setRefreshToken(refreshToken);
      }
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      
      setUser(userData);
      console.log('✅ Google login successful');
    } catch (error: any) {
      console.error('Google login error:', error);
      throw new Error(error.response?.data?.message || 'Google login failed');
    }
  };

  // Logout
  const logout = async () => {
    try {
      // Call backend logout endpoint
      await apiService.auth.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local storage and state
      await clearAuthToken();
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      setUser(null);
      console.log('✅ Logout successful');
    }
  };

  // Update user in local state and storage
  const updateUser = async (userData: Partial<User>) => {
    try {
      const updatedUser = { ...user, ...userData } as User;
      setUser(updatedUser);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      console.log('✅ User updated');
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Refresh user data from backend
  const refreshUser = async () => {
    try {
      const response = await apiService.user.getProfile();
      const userData = response?.data?.data || response?.data?.user || response?.data;
      
      setUser(userData);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      console.log('✅ User data refreshed');
    } catch (error) {
      console.error('Error refreshing user:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    googleLogin,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use Auth Context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
