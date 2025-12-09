/**
 * i18n Configuration
 * Internationalization setup using i18n-js
 */

import { I18n } from 'i18n-js';
import { ja, en } from './translate';

// Debug: Log translations
console.log('=== i18n Setup ===');
console.log('ja translations:', ja);
console.log('en translations:', en);

// Create i18n instance
const i18n = new I18n({
  ja,
  en,
});

// Set default locale to Japanese
i18n.locale = 'ja';

// Debug: Test translation
console.log('i18n.locale:', i18n.locale);
console.log('Test translation:', i18n.t('home.welcome'));

// Enable fallback to Japanese if translation is missing
i18n.enableFallback = true;
i18n.defaultLocale = 'ja';

export default i18n;

// Type for translation keys
export type TranslationKey = RecursiveKeyOf<typeof ja>;

// Helper type to get nested keys as dot notation
type RecursiveKeyOf<TObj extends object> = {
  [TKey in keyof TObj & string]: TObj[TKey] extends object
    ? `${TKey}` | `${TKey}.${RecursiveKeyOf<TObj[TKey]>}`
    : `${TKey}`;
}[keyof TObj & string];
