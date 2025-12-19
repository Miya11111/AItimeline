import { Tabs } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, TextInput, TouchableOpacity, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import MenuBar from '@/components/organisms/MenuBar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useTabStore } from '@/stores/tabStore';
import { useSearchStore } from '@/stores/searchStore';
import { generateSearchTweets } from '@/services/aiService';
import { t } from 'i18next';

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

  // 検索ストアの状態
  const searchQuery = useSearchStore((state) => state.searchQuery);
  const setSearchQuery = useSearchStore((state) => state.setSearchQuery);
  const setSearchResults = useSearchStore((state) => state.setSearchResults);
  const setIsSearching = useSearchStore((state) => state.setIsSearching);

  // Zustandからアクティブタブとタブ順序を取得
  const activeTab = useTabStore((state) => state.getActiveTab());
  const tabOrder = useTabStore((state) => state.tabOrder);
  const tabs = useTabStore((state) => state.tabs);

  // タブ順序の最初のタブ（bookmarks以外）を取得
  const firstTab = tabOrder.find((id) => id !== 'bookmarks');
  const displayTab = activeTab || (firstTab ? tabs[firstTab] : undefined);

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

  // 検索実行
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    console.log('[Search] Searching for:', searchQuery);
    setIsSearching(true);

    try {
      const results = await generateSearchTweets(searchQuery);
      setSearchResults(results);
      console.log('[Search] Search completed, results:', results.length);
    } catch (error) {
      console.error('[Search] Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
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
          tabBarShowLabel: false,
          headerStyle: {
            borderBottomWidth: 1,
            borderBottomColor: colors.gray,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: displayTab?.title || t('tabLayout.home'),
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
            title: '',
            headerTitle: '',
            header: () => (
              <View
                style={{
                  backgroundColor: colors.white,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.gray,
                  paddingTop: 60,
                  paddingBottom: 12,
                  paddingHorizontal: 16,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.darkGray,
                    borderRadius: 24,
                    paddingHorizontal: 12,
                    marginHorizontal: 12,
                    height: 40,
                  }}
                >
                  <IconSymbol name="magnifyingglass" size={20} color={colors.lightGray} />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="用語を検索"
                    placeholderTextColor={colors.lightGray}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                    style={{
                      flex: 1,
                      marginLeft: 8,
                      fontSize: 16,
                      color: colors.black,
                    }}
                  />
                </View>
              </View>
            ),
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="magnifyingglass" color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
