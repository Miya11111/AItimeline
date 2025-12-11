import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { t } from 'i18next';

export const TabLayoutLangJa = {
  home: 'ホーム',
};

export const TabLayoutLangEn = {
  home: 'Home',
};

export default function TabLayout() {
  const colors = useColors();
  // const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.lightGray,
        headerShown: true,
        headerTitleAlign: 'center',
        tabBarButton: HapticTab,
        headerStyle: {
          borderBottomWidth: 1,
          borderBottomColor: colors.darkGray,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabLayout.home'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
