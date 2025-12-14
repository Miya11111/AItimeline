import { useColors } from '@/hooks/use-colors';
import { Animated, ImageSourcePropType, Modal, Text, TouchableOpacity, View } from 'react-native';
import IconButton from '../atoms/IconButton';
import RoundImage from '../atoms/RoundImage';
import AnimalIconButton from '../molecules/animalIconButton';
import FavIconButton from '../molecules/favIconButton';
import RetweetIconButton from '../molecules/retweetButton';

type TweetState = {
  animalNum: number;
  retweetNum: number;
  favoriteNum: number;
  impressionNum: number;
  bookmark: boolean;
  isLiked: boolean;
  isRetweeted: boolean;
  isAnimaled: boolean;
};

type TweetDetailProps = {
  visible: boolean;
  onClose: () => void;
  slideAnim: Animated.Value;
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

  const handleBookmarkPress = () => {
    setTweetState((prev) => ({ ...prev, bookmark: !prev.bookmark }));
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
          <View style={{ flex: 1 }}>
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
                <Text style={{ color: colors.lightGray, marginLeft: 4, fontSize: 16 }}>いいね</Text>
              </TouchableOpacity>
            </View>
            {/* ブックマーク */}
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
              <IconButton
                icon={{
                  name: 'bookmark',
                  size: 20,
                  color: tweetState.bookmark ? colors.blue : colors.lightGray,
                }}
                onPress={handleBookmarkPress}
                isJustifyContent
              />
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
            {/* <View style={{ padding: 20 }}>
              <Text style={{ color: colors.black }}>Name: {name}</Text>
              <Text style={{ color: colors.lightGray, marginTop: 10 }}>@{nameId}</Text>
              <Text style={{ color: colors.black, marginTop: 10 }}>{message}</Text>
            </View> */}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
