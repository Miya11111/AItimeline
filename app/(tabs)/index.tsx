import { ScrollView } from 'react-native';

import Tweet, { TweetType } from '@/components/organisms/tweet';

export const HomeLangJa = {
  welcome: 'こんにちは',
};

export const HomeLangEn = {
  welcome: 'welcome',
};

export default function HomeScreen() {
  const tweets: TweetType[] = [
    {
      image: require('@/assets/mock_icon1.png'),
      name: 'ミジンコ2',
      nameId: 'mijinji_minji',
      message: 'あああああああああああああああああああああああああああ',
      animalNum: 1,
      retweetNum: 2,
      favoriteNum: 3,
      impressionNum: 10,
    },
    {
      image: require('@/assets/mock_icon1.png'),
      name: 'ユーザー名',
      nameId: 'user_id',
      message: 'サンプルツイートメッセージです',
      animalNum: 5,
      retweetNum: 3,
      favoriteNum: 8,
      impressionNum: 25,
    },
  ];

  return (
    <ScrollView>
      {/* つぶやきタブ */}
      {tweets.map((tweet, key) => (
        <Tweet
          image={tweet.image}
          name={tweet.name}
          nameId={tweet.nameId}
          message={tweet.message}
          animalNum={tweet.animalNum}
          retweetNum={tweet.retweetNum}
          favoriteNum={tweet.favoriteNum}
          impressionNum={tweet.impressionNum}
          key={key}
        />
      ))}
    </ScrollView>
  );
}
