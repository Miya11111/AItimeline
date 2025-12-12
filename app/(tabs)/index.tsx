import { useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

import Tweet, { TweetType } from '@/components/organisms/tweet';
import { useColors } from '@/hooks/use-colors';

export const HomeLangJa = {
  welcome: 'こんにちは',
};

export const HomeLangEn = {
  welcome: 'welcome',
};

export default function HomeScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // 更新処理をシミュレート（実際にはAPI呼び出しなど）
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const tweets: TweetType[] = [
    {
      image: require('@/assets/mock_icon1.png'),
      name: 'ミジンコ2',
      nameId: 'mijinji_minji',
      message: 'あああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああ',
    },
    {
      image: require('@/assets/mock_icon1.png'),
      name: 'ユーザー名',
      nameId: 'user_id',
      message: 'サンプルツイートメッセージです',
    },
        {
      image: require('@/assets/mock_icon1.png'),
      name: 'ミジンコ2',
      nameId: 'mijinji_minji',
      message: 'あああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああ',
    },
    {
      image: require('@/assets/mock_icon1.png'),
      name: 'ユーザー名',
      nameId: 'user_id',
      message: 'サンプルツイートメッセージです',
    },
        {
      image: require('@/assets/mock_icon1.png'),
      name: 'ミジンコ2',
      nameId: 'mijinji_minji',
      message: 'あああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああ',
    },
    {
      image: require('@/assets/mock_icon1.png'),
      name: 'ユーザー名',
      nameId: 'user_id',
      message: 'サンプルツイートメッセージです',
    },
        {
      image: require('@/assets/mock_icon1.png'),
      name: 'ミジンコ2',
      nameId: 'mijinji_minji',
      message: 'あああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああ',
    },
    {
      image: require('@/assets/mock_icon1.png'),
      name: 'ユーザー名',
      nameId: 'user_id',
      message: 'サンプルツイートメッセージです',
    },
        {
      image: require('@/assets/mock_icon1.png'),
      name: 'ミジンコ2',
      nameId: 'mijinji_minji',
      message: 'あああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああ',
    },
    {
      image: require('@/assets/mock_icon1.png'),
      name: 'ユーザー名',
      nameId: 'user_id',
      message: 'サンプルツイートメッセージです',
    },
  ];

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
