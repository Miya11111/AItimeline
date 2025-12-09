/**
 * Hook for accessing theme-aware colors
 * Returns colors object where each color automatically uses light/dark based on current theme
 */

import { useMemo } from 'react';
import { colors as colorDefinitions } from '@/constants/color';
import { useColorScheme } from './use-color-scheme';

type ColorKey = keyof typeof colorDefinitions;
type ThemeAwareColors = {
  [K in ColorKey]: string;
};

/**
 * Hook to get theme-aware colors
 * Each color automatically returns the correct value based on current theme
 *
 * @returns Colors object where each property returns the theme-appropriate color
 *
 * @example
 * const colors = useColors();
 * <View style={{ backgroundColor: colors.primary }} />
 * // Automatically uses colors.primary.light in light mode
 * // and colors.primary.dark in dark mode
 */
export function useColors(): ThemeAwareColors {
  const colorScheme = useColorScheme() ?? 'light';

  return useMemo(() => {
    const themeColors = {} as ThemeAwareColors;

    for (const key in colorDefinitions) {
      const colorKey = key as ColorKey;
      themeColors[colorKey] = colorDefinitions[colorKey][colorScheme];
    }

    return themeColors;
  }, [colorScheme]);
}
