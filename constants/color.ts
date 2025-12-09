/**
 * Color Tokens System
 * Centralized color definitions for the design system.
 */

/**
 * Colors with light/dark theme support
 * @example
 * import { colors } from '@/constants/color';
 * const primaryLight = colors.primary.light;
 * const primaryDark = colors.primary.dark;
 */
export const colors = {
  // Brand Colors
  primary: {
    light: '#48b3ffff',
    dark: '#3893faff',
  },
  caution: {
    light: '#f3e460ff',
    dark: '#ffd54f',
  },
  warning: {
    light: '#e63232ff',
    dark: '#e57373',
  },

  // Grays
  gray: {
    light: '#b4b4b4ff',
    dark: '#9BA1A6',
  },

  // Whites & Blacks
  white: {
    light: '#fff',
    dark: '#151718',
  },
  black: {
    light: '#000',
    dark: '#fff',
  },
} as const;

/**
 * Type exports for TypeScript
 */
export type ColorScheme = 'light' | 'dark';
