import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';

import EggAnimation from '@/components/molecules/EggAnimation';
import Tweet from '@/components/organisms/Tweet';
import { useColors } from '@/hooks/use-colors';
import { generateTweets } from '@/services/aiService';
import { useTabStore } from '@/stores/tabStore';

export const HomeLangJa = {
  welcome: 'こんにちは',
};

export const HomeLangEn = {
  welcome: 'welcome',
};

export default function HomeScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Zustandから状態を取得
  const activeTabId = useTabStore((state) => state.activeTabId);
  const getTweetsForTab = useTabStore((state) => state.getTweetsForTab);
  const getBookmarkedTweets = useTabStore((state) => state.getBookmarkedTweets);
  const isHydrated = useTabStore((state) => state.isHydrated);
  const tabs = useTabStore((state) => state.tabs);

  // ストック管理用の関数
  const addTweetsToStock = useTabStore((state) => state.addTweetsToStock);
  const loadTweetsFromStock = useTabStore((state) => state.loadTweetsFromStock);
  const getStockCount = useTabStore((state) => state.getStockCount);
  const setGenerating = useTabStore((state) => state.setGenerating);

  // アクティブタブのツイートを取得（新しいものが上に来るように逆順）
  // 特別なタブID 'bookmarks' の場合はブックマークされたツイートを表示
  const tweets =
    activeTabId === 'bookmarks'
      ? getBookmarkedTweets().reverse()
      : getTweetsForTab(activeTabId).reverse();

  // 初回読み込み時とタブ切り替え時にツイートを生成してストック（hydrateが完了してから）
  useEffect(() => {
    if (!isHydrated) return;

    const loadInitialTweets = async () => {
      // タブIDをキャプチャ（非同期処理中にactiveTabIdが変わる可能性があるため）
      const targetTabId = activeTabId;

      // ブックマークタブの場合はツイート生成をスキップ
      if (targetTabId === 'bookmarks') {
        setLoading(false);
        return;
      }

      try {
        // targetTabIdのタブを取得
        const currentTab = tabs[targetTabId];
        if (!currentTab) return;

        // 既に表示されているツイートがある場合はスキップ
        const existingTweets = getTweetsForTab(targetTabId);
        if (existingTweets.length > 0) {
          setLoading(false);
          return;
        }

        // 既に生成中の場合はスキップ
        if (currentTab.isGenerating) {
          setLoading(false);
          return;
        }

        // タブ切り替え時にローディング画面を表示
        setLoading(true);

        // 生成中フラグを立てる
        setGenerating(targetTabId, true);

        // AIから20件のツイートを生成してストックに追加（UUIDを使用するため、maxIdは不要）
        console.log('[HomeScreen] Generating initial 20 tweets for stock...');
        const aiTweets = await generateTweets(20, 1, currentTab.title);
        addTweetsToStock(targetTabId, aiTweets);

        // ストックから7〜10件をランダムに表示
        const displayCount = Math.floor(Math.random() * 4) + 7; // 7 ~ 10
        loadTweetsFromStock(targetTabId, displayCount);

        console.log(`[HomeScreen] Loaded ${displayCount} tweets from stock`);
      } catch (error) {
        console.error('Failed to load initial tweets:', error);
      } finally {
        setGenerating(targetTabId, false);
        setLoading(false);
      }
    };
    loadInitialTweets();
  }, [isHydrated, activeTabId]);

  const onRefresh = async () => {
    setRefreshing(true);

    // タブIDをキャプチャ（非同期処理中にactiveTabIdが変わる可能性があるため）
    const targetTabId = activeTabId;

    // ブックマークタブの場合はリフレッシュしない
    if (targetTabId === 'bookmarks') {
      setRefreshing(false);
      return;
    }

    try {
      const currentTab = tabs[targetTabId];
      if (!currentTab || currentTab.isGenerating) {
        setRefreshing(false);
        return;
      }

      const stockCount = getStockCount(targetTabId);

      // ストックが10件より多くある場合はストックから読み込む
      if (stockCount > 10) {
        console.log(`[HomeScreen] Loading from stock (${stockCount} available)`);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1秒待機
        const displayCount = Math.floor(Math.random() * 4) + 7; // 7〜10
        loadTweetsFromStock(targetTabId, displayCount);
      } else {
        // ストックが10件以下の場合は新しく生成
        console.log(`[HomeScreen] Stock low (${stockCount}), generating new tweets...`);
        setGenerating(targetTabId, true);

        // AIから20件のツイートを生成してストックに追加（UUIDを使用するため、maxIdは不要）
        const aiTweets = await generateTweets(20, 1, currentTab.title);
        addTweetsToStock(targetTabId, aiTweets);

        // ストックから5〜7件を表示
        const displayCount = Math.floor(Math.random() * 3) + 5; // 5〜7
        loadTweetsFromStock(targetTabId, displayCount);

        setGenerating(targetTabId, false);
      }
    } catch (error) {
      console.error('Failed to refresh tweets:', error);
      setGenerating(targetTabId, false);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <ActivityIndicator size="large" color={colors.blue} />
        <Text
          style={{
            marginTop: 16,
            fontSize: 16,
            textAlign: 'center',
            lineHeight: 24,
            color: colors.black,
          }}
        >
          ツイートを生成しています。{'\n'}しばらくお待ちください。
        </Text>
        <EggAnimation />
      </View>
    );
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.blue}
          colors={[colors.blue]}
          progressBackgroundColor={colors.white}
        />
      }
    >
      {/* つぶやきタブ */}
      {tweets.length === 0 ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: colors.lightGray, fontSize: 16 }}>ツイートがありません</Text>
        </View>
      ) : (
        tweets.map((tweet) => (
          <Tweet
            key={tweet.id}
            id={tweet.id}
            image={tweet.image}
            name={tweet.name}
            nameId={tweet.nameId}
            message={tweet.message}
            retweetNum={tweet.retweetNum}
            favoriteNum={tweet.favoriteNum}
            impressionNum={tweet.impressionNum}
            animalNum={tweet.animalNum}
            animalIconType={tweet.animalIconType}
            isLiked={tweet.isLiked}
            isRetweeted={tweet.isRetweeted}
            isBookmarked={tweet.isBookmarked}
            isAnimaled={tweet.isAnimaled}
          />
        ))
      )}
    </ScrollView>
  );
}
