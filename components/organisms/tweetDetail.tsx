import { AnimalIconType } from '@/constants/animalIcons';
import { useColors } from '@/hooks/use-colors';
import { generateReplyTweets } from '@/services/aiService';
import { Tweet as TweetType, useTabStore } from '@/stores/tabStore';
import { useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  ImageSourcePropType,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconButton from '../atoms/IconButton';
import RoundImage from '../atoms/RoundImage';
import AnimalIconButton from '../molecules/AnimalIconButton';
import EggAnimation from '../molecules/EggAnimation';
import FavIconButton from '../molecules/FavIconButton';
import RetweetIconButton from '../molecules/RetweetButton';
import Tweet from './Tweet';

type TweetState = {
  animalIconType: AnimalIconType;
  animalNum: number;
  retweetNum: number;
  favoriteNum: number;
  impressionNum: number;
  bookmark?: boolean;
  isLiked: boolean;
  isRetweeted: boolean;
  isAnimaled: boolean;
};

type TweetDetailProps = {
  visible: boolean;
  onClose: () => void;
  slideAnim: Animated.Value;
  tweetId: string;
  image: ImageSourcePropType;
  name: string;
  nameId: string;
  message: string;
  tweetState: TweetState;
  setTweetState: React.Dispatch<React.SetStateAction<TweetState>>;
  initialAnimalNum: number;
  initialRetweetNum: number;
  initialFavoriteNum: number;
};

export default function TweetDetail({
  visible,
  onClose,
  slideAnim,
  tweetId,
  image,
  name,
  nameId,
  message,
  tweetState,
  setTweetState,
  initialAnimalNum,
  initialRetweetNum,
  initialFavoriteNum,
}: TweetDetailProps) {
  const colors = useColors();
  const addTweetsToStore = useTabStore((state) => state.addTweetsToStore);
  const updateTweetInteraction = useTabStore((state) => state.updateTweetInteraction);
  const [isGeneratingReply, setIsGeneratingReply] = useState<boolean>(false);
  const [finishGenerateReply, setFinishGenerateReply] = useState<boolean>(false);
  const [generatedReplies, setGeneratedReplies] = useState<TweetType[]>([]);

  const handleBookmarkPress = () => {
    // Zustandに保存してブックマークタブに追加/削除
    updateTweetInteraction(tweetId, {
      isBookmarked: !tweetState.bookmark,
    });
    setTweetState((prev) => ({ ...prev, bookmark: !prev.bookmark }));
  };

  const handleGenerateReply = async () => {
    setIsGeneratingReply(true);
    try {
      const replies = await generateReplyTweets(message, 10000);
      // 返信ツイートをストアに保存
      addTweetsToStore(replies);
      setGeneratedReplies(replies);
      setFinishGenerateReply(true);
    } catch (error) {
      console.error('Failed to generate reply:', error);
    } finally {
      setIsGeneratingReply(false);
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="none" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
        }}
      >
        <Animated.View
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '100%',
            backgroundColor: colors.white,
            transform: [{ translateX: slideAnim }],
            shadowColor: '#000',
            shadowOffset: { width: -2, height: 0 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            <ScrollView style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.darkGray,
                }}
              >
                <TouchableOpacity onPress={onClose}>
                  <Text style={{ fontSize: 24, color: colors.black }}>←</Text>
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: colors.black,
                    marginLeft: 24,
                  }}
                >
                  ツイート
                </Text>
              </View>
              {/* プロフィール */}
              <View style={{ padding: 12, flexDirection: 'row' }}>
                <RoundImage source={image} size={40} />
                <View style={{ flexDirection: 'column', marginHorizontal: 8 }}>
                  <Text style={{ color: colors.black, fontWeight: 'bold' }}>{name}</Text>
                  <Text style={{ color: colors.lightGray }}>@{nameId}</Text>
                </View>
              </View>
              {/* 本文 */}
              <View
                style={{
                  paddingLeft: 12,
                  paddingBottom: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.darkGray,
                }}
              >
                <Text style={{ color: colors.black, fontSize: 18 }}>{message}</Text>
              </View>
              {/* リツイート、引用リツイート、いいね数 */}
              <View
                style={{
                  flexDirection: 'row',
                  padding: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.darkGray,
                }}
              >
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}
                >
                  <Text style={{ color: colors.black, fontWeight: 'bold', fontSize: 16 }}>
                    {tweetState.retweetNum}
                  </Text>
                  <Text style={{ color: colors.lightGray, marginLeft: 4, fontSize: 16 }}>
                    リツイート
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}
                >
                  <Text style={{ color: colors.black, fontWeight: 'bold', fontSize: 16 }}>
                    {tweetState.retweetNum}
                  </Text>
                  <Text style={{ color: colors.lightGray, marginLeft: 4, fontSize: 16 }}>
                    件の引用
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}
                >
                  <Text style={{ color: colors.black, fontWeight: 'bold', fontSize: 16 }}>
                    {tweetState.favoriteNum}
                  </Text>
                  <Text style={{ color: colors.lightGray, marginLeft: 4, fontSize: 16 }}>
                    いいね
                  </Text>
                </TouchableOpacity>
              </View>
              {/* ブックマーク */}
              {tweetState.bookmark !== undefined && (
                <View
                  style={{
                    flexDirection: 'row',
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.darkGray,
                  }}
                >
                  <Text style={{ color: colors.black, fontWeight: 'bold', fontSize: 16 }}>
                    {tweetState.retweetNum}
                  </Text>

                  <Text style={{ color: colors.lightGray, marginLeft: 4, fontSize: 16 }}>
                    ブックマーク
                  </Text>
                </View>
              )}
              {/* 各アイコン */}
              <View
                style={{
                  flexDirection: 'row',
                  padding: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.darkGray,
                }}
              >
                <AnimalIconButton
                  animalIconType={tweetState.animalIconType}
                  animalNum={tweetState.animalNum}
                  setAnimalNum={(num) => setTweetState((prev) => ({ ...prev, animalNum: num }))}
                  initialAnimalNum={initialAnimalNum}
                  isAnimaled={tweetState.isAnimaled}
                  isHideNumber
                  isJustifyContent
                  size={20}
                />
                <RetweetIconButton
                  retweetNum={tweetState.retweetNum}
                  setRetweetNum={(num) => setTweetState((prev) => ({ ...prev, retweetNum: num }))}
                  initialRetweetNum={initialRetweetNum}
                  isRetweet={tweetState.isRetweeted}
                  isHideNumber
                  isJustifyContent
                  size={20}
                />
                <FavIconButton
                  favoriteNum={tweetState.favoriteNum}
                  setFavoriteNum={(num) => setTweetState((prev) => ({ ...prev, favoriteNum: num }))}
                  initialFavoriteNum={initialFavoriteNum}
                  isFavorited={tweetState.isLiked}
                  isHideNumber
                  isJustifyContent
                  size={20}
                />
                {tweetState.bookmark !== undefined && (
                  <IconButton
                    icon={{
                      name: 'bookmark',
                      size: 20,
                      color: tweetState.bookmark ? colors.blue : colors.lightGray,
                    }}
                    onPress={handleBookmarkPress}
                    isJustifyContent
                  />
                )}
                <IconButton
                  icon={{
                    name: 'share-nodes',
                    family: 'FontAwesome6',
                    size: 20,
                    color: colors.lightGray,
                  }}
                  isJustifyContent
                />
              </View>
              {/* AI返信生成ボタン */}
              {!finishGenerateReply && (
                <View style={{ padding: 10 }}>
                  {isGeneratingReply ? (
                    <View style={{ padding: 10 }}>
                      <ActivityIndicator color={colors.blue} />
                      <EggAnimation />
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={handleGenerateReply}
                      style={{
                        padding: 10,
                        borderRadius: 20,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: colors.blue, fontSize: 16 }}>返信を表示</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* 生成された返信 */}
              {generatedReplies.length > 0 && (
                <View>
                  {generatedReplies.map((reply) => (
                    <Tweet
                      key={reply.id}
                      id={reply.id}
                      image={reply.image}
                      name={reply.name}
                      nameId={reply.nameId}
                      message={reply.message}
                      retweetNum={reply.retweetNum}
                      favoriteNum={reply.favoriteNum}
                      impressionNum={reply.impressionNum}
                      animalNum={reply.animalNum}
                      animalIconType={reply.animalIconType}
                      isLiked={reply.isLiked}
                      isRetweeted={reply.isRetweeted}
                      isBookmarked={reply.isBookmarked ?? false}
                      isAnimaled={reply.isAnimaled}
                    />
                  ))}
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}
