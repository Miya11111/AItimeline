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
    tint: colors.primary.light,
    icon: colors.gray.light,
    tabIconDefault: colors.gray.light,
    tabIconSelected: colors.primary.light,
  },
  dark: {
    text: colors.black.dark,
    background: colors.white.dark,
    tint: colors.primary.dark,
    icon: colors.gray.dark,
    tabIconDefault: colors.gray.dark,
    tabIconSelected: colors.primary.dark,
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
