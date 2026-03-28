import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@app_theme';

export type ThemeType = 'dark' | 'light';

export const useTheme = () => {
  const [theme, setThemeState] = useState<ThemeType>('dark');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize theme on first load
  const initTheme = useCallback(async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
        setThemeState(savedTheme as ThemeType);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Toggle theme
  const toggleTheme = useCallback(async () => {
    try {
      const newTheme: ThemeType = theme === 'dark' ? 'light' : 'dark';
      setThemeState(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      return newTheme;
    } catch (error) {
      console.error('Error saving theme:', error);
      return theme;
    }
  }, [theme]);

  // Set theme
  const setTheme = useCallback(
    async (newTheme: ThemeType) => {
      try {
        setThemeState(newTheme);
        await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    },
    []
  );

  return {
    theme,
    isLoading,
    initTheme,
    toggleTheme,
    setTheme,
  };
};
