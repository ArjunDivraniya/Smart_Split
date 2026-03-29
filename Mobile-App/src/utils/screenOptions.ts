import { NativeStackNavigationOptions } from '@react-navigation/native-stack';

/**
 * Custom header styling options for all screens
 * Uses app's custom fonts (DMSans, Syne) instead of system defaults
 */
export const customHeaderOptions: NativeStackNavigationOptions = {
  headerTitleStyle: {
    fontFamily: 'Syne_700Bold',
    fontSize: 20,
    fontWeight: '700',
    color: '#F0F0FF',
  },
  headerStyle: {
    backgroundColor: '#14141F',
  },
  headerTintColor: '#7C5CFC',
  headerTitleAlign: 'center',
};

/**
 * Create custom header options with custom title
 */
export const createHeaderOptions = (title: string): NativeStackNavigationOptions => ({
  ...customHeaderOptions,
  title,
  headerTitleStyle: {
    fontFamily: 'Syne_700Bold',
    fontSize: 18,
    fontWeight: '700',
    color: '#F0F0FF',
  },
});

/**
 * Subtitle text styling (for secondary titles/descriptions)
 */
export const subtitleStyle = {
  fontFamily: 'DMSans_500Medium',
  fontSize: 14,
  color: '#A0A0BF',
};

/**
 * Header back button label style
 */
export const headerBackLabelStyle = {
  fontFamily: 'DMSans_400Regular',
  fontSize: 14,
};
