import EggAnimation from '@/components/molecules/EggAnimation';
import Tweet from '@/components/organisms/Tweet';
import { useColors } from '@/hooks/use-colors';
import { generateSearchTweets } from '@/services/aiService';
import { useSearchStore } from '@/stores/searchStore';
import { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';

export default function TabTwoScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const searchQuery = useSearchStore((state) => state.searchQuery);
  const searchResults = useSearchStore((state) => state.searchResults);
  const isSearching = useSearchStore((state) => state.isSearching);
  const addSearchResults = useSearchStore((state) => state.addSearchResults);

  const onRefresh = async () => {
    if (!searchQuery.trim()) return;

    setRefreshing(true);

    try {
      const results = await generateSearchTweets(searchQuery);
      // 既存のツイートの上に新しいツイートを追加
      addSearchResults(results);
      console.log('[Explore] Refresh completed, added:', results.length);
    } catch (error) {
      console.error('[Explore] Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (isSearching) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.blue} />
        <Text style={{ marginTop: 16, fontSize: 16, color: colors.black }}>
          「{searchQuery}」を検索中...
        </Text>
        <EggAnimation />
      </View>
    );
  }

  if (searchResults.length === 0 && !searchQuery) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, color: colors.lightGray, textAlign: 'center' }}>
          検索バーにキーワードを入力して検索してください
        </Text>
      </View>
    );
  }

  if (searchResults.length === 0 && searchQuery) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, color: colors.lightGray, textAlign: 'center' }}>
          「{searchQuery}」の検索結果が見つかりませんでした
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
      {searchResults.map((tweet) => (
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
      ))}
    </ScrollView>
  );
}
