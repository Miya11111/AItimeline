import { AnimalIconType } from '@/constants/animalIcons';
import { useColors } from '@/hooks/use-colors';
import { useAchievementStore } from '@/stores/achievementStore';
import { useTabStore } from '@/stores/tabStore';
import { useState } from 'react';
import { Animated, ImageSourcePropType, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '../atoms/Icon';
import IconButton from '../atoms/IconButton';
import RoundImage from '../atoms/RoundImage';
import AnimalIconButton from '../molecules/AnimalIconButton';
import FavIconButton from '../molecules/FavIconButton';
import RetweetIconButton from '../molecules/RetweetButton';
import TweetDetail from './TweetDetail';

export type TweetType = {
  id: string;
  image: ImageSourcePropType;
  name: string;
  nameId: string;
  message: string;
  retweetNum: number;
  favoriteNum: number;
  impressionNum: number;
  animalNum: number;
  animalIconType: AnimalIconType;
  isLiked: boolean;
  isRetweeted: boolean;
  isBookmarked?: boolean;
  isAnimaled: boolean;
};

export default function Tweet({
  id,
  image,
  name,
  nameId,
  message,
  retweetNum,
  favoriteNum,
  impressionNum,
  animalNum,
  animalIconType,
  isLiked,
  isRetweeted,
  isBookmarked,
  isAnimaled,
}: TweetType) {
  const colors = useColors();
  const updateTweetInteraction = useTabStore((state) => state.updateTweetInteraction);
  const incrementAnimal = useAchievementStore((state) => state.incrementAnimal);
  const decrementAnimal = useAchievementStore((state) => state.decrementAnimal);

  // 生成中かどうかを取得
  const activeTabId = useTabStore((state) => state.activeTabId);
  const tabs = useTabStore((state) => state.tabs);
  const isGenerating = tabs[activeTabId]?.isGenerating ?? false;

  // Zustandから最新の状態を個別に取得（パフォーマンスとリアクティビティのため）
  const currentRetweetNum = useTabStore((state) => state.tweets[id]?.retweetNum ?? retweetNum);
  const currentFavoriteNum = useTabStore((state) => state.tweets[id]?.favoriteNum ?? favoriteNum);
  const currentImpressionNum = useTabStore(
    (state) => state.tweets[id]?.impressionNum ?? impressionNum
  );
  const currentAnimalNum = useTabStore((state) => state.tweets[id]?.animalNum ?? animalNum);
  const currentAnimalIconType = useTabStore(
    (state) => state.tweets[id]?.animalIconType ?? animalIconType
  );
  const currentIsLiked = useTabStore((state) => state.tweets[id]?.isLiked ?? isLiked);
  const currentIsRetweeted = useTabStore((state) => state.tweets[id]?.isRetweeted ?? isRetweeted);
  const currentIsBookmarked = useTabStore((state) => state.tweets[id]?.isBookmarked ?? undefined);
  const currentIsAnimaled = useTabStore((state) => state.tweets[id]?.isAnimaled ?? isAnimaled);

  const initialAnimalNum = animalNum;
  const initialRetweetNum = retweetNum;
  const initialFavoriteNum = favoriteNum;

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(400));

  //ブックマークを押した際の挙動
  const handleBookmarkPress = () => {
    const newBookmarkState = !currentIsBookmarked;

    // Zustandに保存
    updateTweetInteraction(id, {
      isBookmarked: newBookmarkState,
    });
  };

  // ツイートの詳細モーダルを表示
  const handleTweetPress = () => {
    // 生成中は詳細画面を開かない
    if (isGenerating) return;

    setSidebarVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // ツイートの詳細モーダルを非表示
  const handleCloseSidebar = () => {
    Animated.timing(slideAnim, {
      toValue: 400,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSidebarVisible(false);
    });
  };
  return (
    <>
      <TouchableOpacity
        onPress={handleTweetPress}
        style={{
          width: '100%',
          backgroundColor: colors.white,
          borderBottomWidth: 1,
          borderBottomColor: colors.darkGray,
        }}
      >
        <View style={{ flex: 1, flexDirection: 'row', padding: 4, paddingBottom: 0 }}>
          <View style={{ padding: 4 }}>
            <RoundImage source={image} size={40} />
          </View>
          <View style={{ flex: 1, flexDirection: 'column', padding: 4 }}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ color: colors.black, fontWeight: 'bold' }}>{name}</Text>
              <Text style={{ color: colors.lightGray, marginLeft: 2 }}>@{nameId}</Text>
            </View>
            <View style={{ paddingRight: 10 }}>
              <Text style={{ color: colors.black }}>{message}</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 8,
                alignItems: 'center',
                paddingVertical: 4,
                paddingRight: 10,
              }}
            >
              <View style={{ flex: 1 }}>
                <AnimalIconButton
                  animalNum={currentAnimalNum}
                  setAnimalNum={(num) => {
                    // Zustandに保存
                    updateTweetInteraction(id, {
                      animalNum: num,
                      isAnimaled: num > initialAnimalNum,
                    });
                  }}
                  initialAnimalNum={initialAnimalNum}
                  isAnimaled={currentIsAnimaled}
                  animalIconType={currentAnimalIconType}
                  onAnimalPress={() => incrementAnimal(currentAnimalIconType)}
                  onAnimalUnpress={() => decrementAnimal(currentAnimalIconType)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <RetweetIconButton
                  retweetNum={currentRetweetNum}
                  setRetweetNum={(num) => {
                    // Zustandに保存
                    updateTweetInteraction(id, {
                      retweetNum: num,
                      isRetweeted: num > initialRetweetNum,
                    });
                  }}
                  initialRetweetNum={initialRetweetNum}
                  isRetweet={currentIsRetweeted}
                />
              </View>
              <View style={{ flex: 1 }}>
                <FavIconButton
                  favoriteNum={currentFavoriteNum}
                  setFavoriteNum={(num) => {
                    // Zustandに保存
                    updateTweetInteraction(id, {
                      favoriteNum: num,
                      isLiked: num > initialFavoriteNum,
                    });
                  }}
                  initialFavoriteNum={initialFavoriteNum}
                  isFavorited={currentIsLiked}
                />
              </View>
              <View style={{ flex: 1 }}>
                <IconButton
                  icon={{
                    name: 'chart-simple',
                    family: 'FontAwesome6',
                    size: 16,
                    color: colors.lightGray,
                  }}
                  number={currentImpressionNum}
                />
              </View>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {isBookmarked !== undefined && (
                  <TouchableOpacity
                    onPress={handleBookmarkPress}
                    style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}
                  >
                    <Icon
                      name="bookmark"
                      size={16}
                      color={currentIsBookmarked ? colors.blue : colors.lightGray}
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon
                    name="share-nodes"
                    family="FontAwesome6"
                    size={16}
                    color={colors.lightGray}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      <TweetDetail
        visible={sidebarVisible}
        onClose={handleCloseSidebar}
        slideAnim={slideAnim}
        image={image}
        name={name}
        nameId={nameId}
        message={message}
        tweetState={{
          animalIconType: currentAnimalIconType,
          animalNum: currentAnimalNum,
          retweetNum: currentRetweetNum,
          favoriteNum: currentFavoriteNum,
          impressionNum: currentImpressionNum,
          bookmark: currentIsBookmarked,
          isLiked: currentIsLiked,
          isRetweeted: currentIsRetweeted,
          isAnimaled: currentIsAnimaled,
        }}
        setTweetState={(updater) => {
          const newState =
            typeof updater === 'function'
              ? updater({
                  animalIconType: currentAnimalIconType,
                  animalNum: currentAnimalNum,
                  retweetNum: currentRetweetNum,
                  favoriteNum: currentFavoriteNum,
                  impressionNum: currentImpressionNum,
                  bookmark: currentIsBookmarked,
                  isLiked: currentIsLiked,
                  isRetweeted: currentIsRetweeted,
                  isAnimaled: currentIsAnimaled,
                })
              : updater;

          // すべてZustandに保存
          updateTweetInteraction(id, {
            animalNum: newState.animalNum,
            retweetNum: newState.retweetNum,
            favoriteNum: newState.favoriteNum,
            isLiked: newState.favoriteNum > initialFavoriteNum,
            isRetweeted: newState.retweetNum > initialRetweetNum,
            isAnimaled: newState.animalNum > initialAnimalNum,
            isBookmarked: newState.bookmark,
          });
        }}
        initialAnimalNum={initialAnimalNum}
        initialRetweetNum={initialRetweetNum}
        initialFavoriteNum={initialFavoriteNum}
      />
    </>
  );
}
