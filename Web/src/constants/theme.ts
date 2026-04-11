/**
 * SmartSplit Unified Theme
 * Used across Web and Mobile Apps for consistent styling
 * 
 * Dark Mode Primary (Mobile & Web)
 * Light Mode Secondary (Web)
 */

// ============================================
// COLOR PALETTE - MATCHES MOBILE APP WITH EXTENDED VARIATIONS
// ============================================

export const COLORS = {
  // Light Mode (Web - secondary)
  light: {
    text: '#11181C',
    background: '#fff',
    tint: '#0a7ea4',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#0a7ea4',
  },

  // Dark Mode (Mobile & Web Primary) - MATCHES MOBILE
  dark: {
    text: '#F0F0FF',
    background: '#080810',
    tint: '#fff',
    icon: '#8888AA',
    tabIconDefault: '#55556A',
    tabIconSelected: '#7C5CFC',

    // Base Brand Colors (EXACT MATCH WITH MOBILE)
    void: '#080810',
    surface: '#0F0F1A',
    card: '#14141F',
    elevated: '#1A1A2B',
    
    // Primary Colors with Extensions
    violet: '#7C5CFC',
    violetLight: '#9B7FFF',
    violetDark: '#6B4CE5',
    
    // Extended Color Palette
    mint: '#00E5B0',
    mintLight: '#26F0C4',
    mintDark: '#00B895',
    
    coral: '#FF5F7E',
    coralLight: '#FF8A9E',
    coralDark: '#E84A67',
    
    amber: '#FFB547',
    amberLight: '#FFC86E',
    amberDark: '#E59F29',
    
    sky: '#38BDF8',
    skyLight: '#5ACBFF',
    skyDark: '#0EA5E9',
    
    // Neutral Colors
    textPrimary: '#F0F0FF',
    textSecondary: '#8888AA',
    textTertiary: '#55556A',
    border: 'rgba(255, 255, 255, 0.06)',
    borderLight: 'rgba(255, 255, 255, 0.14)',
  },
};

// ============================================
// TAILWIND COLOR MAP
// Maps Tailwind utility classes to theme colors
// ============================================

export const TAILWIND_COLORS = {
  // Backgrounds (Match Mobile)
  'bg-void': '#080810',              // Main background
  'bg-surface': '#0F0F1A',           // Card backgrounds
  'bg-elevated': '#1A1A2B',          // Elevated surfaces
  'bg-card': '#14141F',              // Card default

  // Brand Accents
  'bg-violet': '#7C5CFC',            // Primary action
  'bg-mint': '#00E5B0',              // Success/Positive
  'bg-coral': '#FF5F7E',             // Alert/Danger
  'bg-amber': '#FFB547',             // Warning
  'bg-sky': '#38BDF8',               // Info

  // Text Colors
  'text-primary': '#F0F0FF',         // Main text
  'text-secondary': '#8888AA',       // Secondary text
  'text-tertiary': '#55556A',        // Tertiary text
};

// ============================================
// COMPONENT STYLE PRESETS
// Use these across both web and mobile
// ============================================

export const COMPONENT_STYLES = {
  // Card Styles - SAME ACROSS WEB & MOBILE
  card: {
    container: 'bg-card border border-elevated rounded-lg p-4',
    hover: 'hover:bg-elevated transition-colors',
    elevated: 'bg-elevated border-0 rounded-lg p-4',
  },

  // Button Styles
  button: {
    primary: 'bg-violet hover:bg-violet/90 text-white rounded-lg font-semibold',
    secondary: 'bg-surface hover:bg-elevated text-primary rounded-lg font-semibold',
    success: 'bg-mint hover:bg-mint/90 text-black rounded-lg font-semibold',
    danger: 'bg-coral hover:bg-coral/90 text-white rounded-lg font-semibold',
    warning: 'bg-amber hover:bg-amber/90 text-white rounded-lg font-semibold',
  },

  // Input Styles
  input: {
    default: 'bg-surface border border-elevated text-primary placeholder:text-tertiary rounded-lg px-3 py-2',
    focused: 'focus:border-violet focus:outline-none',
  },

  // Badge Styles
  badge: {
    default: 'bg-elevated rounded-full px-3 py-1 text-sm font-medium',
    success: 'bg-mint/20 text-mint',
    danger: 'bg-coral/20 text-coral',
    warning: 'bg-amber/20 text-amber',
  },

  // Text Styles
  text: {
    primary: 'text-primary',
    secondary: 'text-secondary',
    tertiary: 'text-tertiary',
    success: 'text-mint',
    danger: 'text-coral',
    warning: 'text-amber',
    info: 'text-sky',
  },
};

// ============================================
// BREAKPOINTS - SAME FOR WEB & MOBILE
// ============================================

export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// ============================================
// SPACING - CONSISTENT ACROSS APPS
// ============================================

export const SPACING = {
  xs: 4,      // 4px
  sm: 8,      // 8px
  md: 12,     // 12px
  lg: 16,     // 16px
  xl: 24,     // 24px
  '2xl': 32,  // 32px
  '3xl': 48,  // 48px
};

// ============================================
// EXPORT FOR USE
// ============================================

export const Theme = {
  colors: COLORS,
  tailwind: TAILWIND_COLORS,
  components: COMPONENT_STYLES,
  breakpoints: BREAKPOINTS,
  spacing: SPACING,
};

export default Theme;
