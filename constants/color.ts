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
  blue: {
    light: '#51b4fcff',
    dark: '#3893faff',
  },
  yellow: {
    light: '#f3e460ff',
    dark: '#ffd54f',
  },
  red: {
    light: '#fa3c75ff',
    dark: '#e7316eff',
  },
  green: {
    light: '#26e083ff',
    dark: '#38ad65ff',
  },

  // Grays
  lightGray: {
    light: '#dfdfdfff',
    dark: '#9BA1A6',
  },
  darkGray: {
    light: '#b4b4b4ff',
    dark: '#57595aff',
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

  // UI Colors
  background: {
    light: '#fff',
    dark: '#000',
  },
  surface: {
    light: '#f5f5f5',
    dark: '#1a1a1a',
  },
  border: {
    light: '#e0e0e0',
    dark: '#333',
  },
  text: {
    light: '#000',
    dark: '#fff',
  },
  error: {
    light: '#d32f2f',
    dark: '#f44336',
  },
} as const;

/**
 * Type exports for TypeScript
 */
export type ColorScheme = 'light' | 'dark';
