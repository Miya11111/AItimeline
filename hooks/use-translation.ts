/**
 * Hook for accessing translations
 * Provides type-safe translation function with auto-completion
 */

import { useMemo, useCallback } from 'react';
import i18n, { type TranslationKey } from '@/i18n';
import { useColorScheme } from './use-color-scheme';

/**
 * Hook to get translation function
 * @returns Translation function with type safety
 *
 * @example
 * const t = useTranslation();
 * const text = t('test.test'); // Auto-completion available
 * const withVariable = t('common.loading'); // "読み込み中..."
 */
export function useTranslation() {
  // Re-render when locale changes (using colorScheme as a proxy for re-renders)
  const colorScheme = useColorScheme();

  const translate = useCallback((key: TranslationKey, options?: any) => {
    return i18n.t(key, options);
  }, []);

  return translate;
}

/**
 * Hook to get current locale
 * @returns Current locale code (e.g., 'ja', 'en')
 */
export function useLocale() {
  return useMemo(() => i18n.locale, []);
}

/**
 * Hook to change locale
 * @returns Function to change locale
 */
export function useChangeLocale() {
  return useCallback((locale: string) => {
    i18n.locale = locale;
    // Force re-render by triggering a state change in your app
    // You might want to use a context provider for this
  }, []);
}
