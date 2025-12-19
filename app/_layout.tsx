import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTabStore } from '@/stores/tabStore';
import { useAchievementStore } from '@/stores/achievementStore';
import ApiKeyModal from '@/components/molecules/ApiKeyModal';
import { hasUserApiKey } from '@/services/apiKeyService';
import '@/i18n';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const hydrateTabStore = useTabStore((state) => state.hydrate);
  const hydrateAchievementStore = useAchievementStore((state) => state.hydrate);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);

  // アプリ起動時にストレージからデータを復元
  useEffect(() => {
    hydrateTabStore();
    hydrateAchievementStore();
  }, [hydrateTabStore, hydrateAchievementStore]);

  // 初回起動時にAPIキーモーダルを表示
  useEffect(() => {
    const checkApiKey = async () => {
      const hasKey = await hasUserApiKey();
      const envKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

      // ユーザーキーも.envキーもない場合は初回表示
      if (!hasKey && !envKey) {
        setIsFirstTime(true);
        setShowApiKeyModal(true);
      }
    };

    checkApiKey();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />

      {/* APIキー設定モーダル */}
      <ApiKeyModal
        visible={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        isFirstTime={isFirstTime}
      />
    </ThemeProvider>
  );
}
