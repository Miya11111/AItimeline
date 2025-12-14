import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTabStore } from '@/stores/tabStore';
import { useAchievementStore } from '@/stores/achievementStore';
import '@/i18n';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const hydrateTabStore = useTabStore((state) => state.hydrate);
  const hydrateAchievementStore = useAchievementStore((state) => state.hydrate);

  // アプリ起動時にストレージからデータを復元
  useEffect(() => {
    hydrateTabStore();
    hydrateAchievementStore();
  }, [hydrateTabStore, hydrateAchievementStore]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
