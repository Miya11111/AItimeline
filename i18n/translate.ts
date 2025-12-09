/**
 * Translation collection system
 * Uses dynamic imports to avoid circular dependencies
 */

/**
 * Dynamically load translations from component files
 * This avoids circular dependency issues
 */
async function loadTranslations() {
  const homeModule = await import('@/app/(tabs)/index');

  return {
    ja: {
      home: homeModule.HomeJa,
      // Add more component translations here
      // profile: profileModule.ProfileJa,
    },
    en: {
      home: homeModule.HomeEn,
      // Add more component translations here
      // profile: profileModule.ProfileEn,
    },
  };
}

// Synchronous fallback for initial load
// These will be replaced by dynamic imports
export const ja = {
  home: {
    welcome: 'こんにちは',
  },
} as const;

export const en = {
  home: {
    welcome: 'welcome',
  },
} as const;

// Load actual translations asynchronously
loadTranslations().then((translations) => {
  Object.assign(ja, translations.ja);
  Object.assign(en, translations.en);
});
