/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,

    // Brand Colors
    void: '#080810',
    surface: '#0F0F1A',
    card: '#14141F',
    elevated: '#1A1A2B',
    violet: '#7C5CFC',
    mint: '#00E5B0',
    coral: '#FF5F7E',
    amber: '#FFB547',
    sky: '#38BDF8',
  },
  dark: {
    text: '#F0F0FF',
    background: '#080810',
    tint: tintColorDark,
    icon: '#8888AA',
    tabIconDefault: '#55556A',
    tabIconSelected: '#7C5CFC',

    // Brand Colors
    void: '#080810',
    surface: '#0F0F1A',
    card: '#14141F',
    elevated: '#1A1A2B',
    violet: '#7C5CFC',
    mint: '#00E5B0',
    coral: '#FF5F7E',
    amber: '#FFB547',
    sky: '#38BDF8',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
