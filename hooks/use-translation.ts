/**
 * Hook for accessing translations
 * Provides type-safe translation function with auto-completion
 */

import { useTranslation as useTranslationI18next } from 'react-i18next';

/**
 * Hook to get translation function
 * @returns Translation function
 *
 * @example
 * const { t } = useTranslation();
 * const text = t('home.welcome'); // "こんにちは"
 */
export function useTranslation() {
  return useTranslationI18next();
}
