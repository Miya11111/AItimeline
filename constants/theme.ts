/**
 * Theme configuration
 * Legacy compatibility for existing code
 */

import { colors } from './color';

/**
 * Colors for light and dark themes
 */
export const Colors = {
  light: {
    text: colors.black.light,
    background: colors.white.light,
    tint: colors.blue.light,
    icon: colors.lightGray.light,
    tabIconDefault: colors.lightGray.light,
    tabIconSelected: colors.blue.light,
  },
  dark: {
    text: colors.black.dark,
    background: colors.white.dark,
    tint: colors.blue.dark,
    icon: colors.lightGray.dark,
    tabIconDefault: colors.lightGray.dark,
    tabIconSelected: colors.blue.dark,
  },
};

/**
 * Font families
 */
export const Fonts = {
  sans: 'system-ui',
  serif: 'ui-serif',
  rounded: 'ui-rounded',
  mono: 'ui-monospace',
};
