import { Tabs } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, TouchableOpacity } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import MenuBar from '@/components/organisms/menuBar';
import { useColors } from '@/hooks/use-colors';
import { t } from 'i18next';
import { useTabStore } from '@/stores/tabStore';

export const TabLayoutLangJa = {
  home: 'ホーム',
};

export const TabLayoutLangEn = {
  home: 'Home',
};

export default function TabLayout() {
  const colors = useColors();
  const [menuVisible, setMenuVisible] = useState(false);
  const screenWidth = Dimensions.get('window').width;
  const menuWidth = screenWidth * 0.75;
  const menuSlideAnim = useRef(new Animated.Value(-menuWidth)).current;

  // Zustandからアクティブタブを取得
  const getActiveTab = useTabStore((state) => state.getActiveTab);
  const activeTab = getActiveTab();

  const openMenu = () => {
    setMenuVisible(true);
    Animated.spring(menuSlideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(menuSlideAnim, {
      toValue: -menuWidth,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setMenuVisible(false);
    });
  };

  return (
    <>
      <MenuBar visible={menuVisible} onClose={closeMenu} slideAnim={menuSlideAnim} />
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
            title: activeTab?.title || t('tabLayout.home'),
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
            headerLeft: () => (
              <TouchableOpacity
                onPress={openMenu}
                style={{ marginLeft: 16 }}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <IconSymbol size={24} name="line.horizontal.3" color={colors.black} />
              </TouchableOpacity>
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="paperplane.fill" color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
