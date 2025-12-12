import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import Tweet, { TweetType } from '@/components/organisms/tweet';
import { useColors } from '@/hooks/use-colors';
import { generateTweets } from '@/services/aiService';

export const HomeLangJa = {
  welcome: 'こんにちは',
};

export const HomeLangEn = {
  welcome: 'welcome',
};

export default function HomeScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [tweets, setTweets] = useState<TweetType[]>([]);
  const [loading, setLoading] = useState(true);

  // 初回読み込み時にAIでツイート生成
  useEffect(() => {
    const loadInitialTweets = async () => {
      try {
        const initialTweets = await generateTweets(10); // 初回は10件生成
        setTweets(initialTweets);
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
      // AIから新しいツイートを生成
      const aiTweets = await generateTweets(7);
      // 既存のツイートの先頭に追加
      setTweets([...aiTweets, ...tweets]);
    } catch (error) {
      console.error('Failed to generate tweets:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.blue} />
        <Text style={[styles.loadingText, { color: colors.black }]}>
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
      {tweets.map((tweet, key) => (
        <Tweet
          image={tweet.image}
          name={tweet.name}
          nameId={tweet.nameId}
          message={tweet.message}
          key={key}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
