import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';

import Tweet from '@/components/organisms/tweet';
import { useColors } from '@/hooks/use-colors';
import { mockTweetsTab1 } from '@/mocks/tweetMockData';
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
  const addTweetToTab = useTabStore((state) => state.addTweetToTab);

  // アクティブタブのツイートを取得（新しいものが上に来るように逆順）
  const tweets = getTweetsForTab(activeTabId).reverse();

  // 初回読み込み時にモックデータを読み込む
  useEffect(() => {
    const loadInitialTweets = async () => {
      try {
        // tab1にモックデータを追加
        mockTweetsTab1.forEach((tweet) => {
          addTweetToTab('tab1', tweet);
        });
      } catch (error) {
        console.error('Failed to load initial tweets:', error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialTweets();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // 現在のタブの最大IDを取得
      const currentTweets = getTweetsForTab(activeTabId);
      const maxId = currentTweets.length > 0 ? Math.max(...currentTweets.map((t) => t.id)) : 0;

      // AIから新しいツイートを生成（IDは既存の最大値+1から開始）
      const aiTweets = await generateTweets(7, maxId + 1);

      // 現在のアクティブタブに追加
      aiTweets.forEach((tweet) => {
        addTweetToTab(activeTabId, tweet);
      });
    } catch (error) {
      console.error('Failed to generate tweets:', error);
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
