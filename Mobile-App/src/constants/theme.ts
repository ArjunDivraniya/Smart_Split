import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Color Palette
export const COLORS = {
  // Primary Colors
  primary: '#6366F1',        // Indigo - Main brand color
  primaryLight: '#818CF8',   // Light indigo
  primaryDark: '#4F46E5',    // Dark indigo
  primaryAlpha: 'rgba(99, 102, 241, 0.1)',
  
  // Secondary Colors
  secondary: '#10B981',      // Green - Success/Positive
  secondaryLight: '#34D399',
  secondaryDark: '#059669',
  secondaryAlpha: 'rgba(16, 185, 129, 0.1)',
  
  // Accent Colors
  accent: '#F59E0B',         // Amber - Highlights
  accentLight: '#FBBF24',
  accentDark: '#D97706',
  accentAlpha: 'rgba(245, 158, 11, 0.1)',
  
  // Semantic Colors
  success: '#10B981',        // Green
  warning: '#F59E0B',        // Amber
  error: '#EF4444',          // Red
  info: '#3B82F6',           // Blue
  
  // Neutral Colors (Light Mode)
  background: '#FFFFFF',
  surface: '#F9FAFB',        // Light gray
  surfaceLight: '#F3F4F6',
  card: '#FFFFFF',
  
  // Text Colors
  text: '#111827',           // Almost black
  textSecondary: '#6B7280',  // Gray
  textTertiary: '#9CA3AF',   // Light gray
  textDisabled: '#D1D5DB',
  
  // Border Colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderDark: '#D1D5DB',
  
  // Dark Mode Colors
  dark: {
    background: '#111827',
    surface: '#1F2937',
    surfaceLight: '#374151',
    card: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textTertiary: '#9CA3AF',
    border: '#374151',
  },
  
  // Overlay & Shadows
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
  
  // Status Colors
  online: '#10B981',
  offline: '#9CA3AF',
  away: '#F59E0B',
  
  // Transparent
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
};

// Typography
export const FONTS = {
  // Font Families
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
  
  // Font Sizes
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  display: 32,
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Font Weights
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

// Spacing Scale (based on 4px grid)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
  massive: 64,
};

// Border Radius
export const RADIUS = {
  xs: 4,
  sm: 6,
  md: 8,
  base: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 999,
  circle: '50%' as const,
};

// Dimensions
export const SIZES = {
  // Screen dimensions
  width,
  height,
  
  // Common sizes
  icon: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
    xxl: 48,
  },
  
  button: {
    height: {
      sm: 36,
      md: 44,
      lg: 52,
    },
    minWidth: 100,
  },
  
  input: {
    height: 48,
    minHeight: 48,
  },
  
  avatar: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 72,
    xxl: 96,
  },
  
  header: {
    height: 56,
  },
  
  tabBar: {
    height: 60,
  },
  
  card: {
    minHeight: 100,
  },
};

// Shadows (iOS & Android compatible)
export const SHADOWS = {
  none: {
    shadowColor: COLORS.transparent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  xs: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  sm: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  
  md: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  
  lg: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  
  xl: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
};

// Animation Durations
export const ANIMATION = {
  fast: 150,
  normal: 250,
  slow: 350,
  verySlow: 500,
};

// Z-Index Layers
export const Z_INDEX = {
  base: 1,
  elevated: 10,
  dropdown: 100,
  overlay: 500,
  modal: 1000,
  popover: 1500,
  tooltip: 2000,
  notification: 3000,
};

// Opacity Values
export const OPACITY = {
  disabled: 0.4,
  pressed: 0.7,
  overlay: 0.5,
  subtle: 0.6,
};

// Common Styles
export const COMMON_STYLES = {
  // Flexbox
  flex1: { flex: 1 },
  flexRow: { flexDirection: 'row' as const },
  flexColumn: { flexDirection: 'column' as const },
  center: { justifyContent: 'center' as const, alignItems: 'center' as const },
  centerHorizontal: { alignItems: 'center' as const },
  centerVertical: { justifyContent: 'center' as const },
  spaceBetween: { justifyContent: 'space-between' as const },
  
  // Container
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  containerPadding: {
    paddingHorizontal: SPACING.base,
  },
  
  // Card
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.base,
    padding: SPACING.base,
    ...SHADOWS.sm,
  },
  
  // Input
  input: {
    height: SIZES.input.height,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.base,
    fontSize: FONTS.md,
    color: COLORS.text,
  },
  
  // Button
  button: {
    height: SIZES.button.height.md,
    borderRadius: RADIUS.md,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: SPACING.xl,
  },
  
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  
  buttonText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.white,
  },
};

// Export all as theme object
export const theme = {
  colors: COLORS,
  fonts: FONTS,
  spacing: SPACING,
  radius: RADIUS,
  sizes: SIZES,
  shadows: SHADOWS,
  animation: ANIMATION,
  zIndex: Z_INDEX,
  opacity: OPACITY,
  commonStyles: COMMON_STYLES,
};

export default theme;
