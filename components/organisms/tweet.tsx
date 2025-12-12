import { useColors } from '@/hooks/use-colors';
import { useState } from 'react';
import { Animated, ImageSourcePropType, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '../atoms/icon';
import IconButton from '../atoms/IconButton';
import RoundImage from '../atoms/RoundImage';
import AnimalIconButton from '../molecules/animalIconButton';
import FavIconButton from '../molecules/favIconButton';
import RetweetIconButton from '../molecules/retweetButton';
import TweetDetail from './tweetDetail';

export type TweetType = {
  image: ImageSourcePropType;
  name: string;
  nameId: string;
  message: string;
};

export default function Tweet({
  image,
  name,
  nameId,
  message,
}: TweetType) {
  const colors = useColors();

  const [tweetState, setTweetState] = useState({
    animalNum: 0,
    retweetNum: 0,
    favoriteNum: 0,
    impressionNum: 0,
    bookmark: false,
  });

  const initialAnimalNum = 0;
  const initialRetweetNum = 0;
  const initialFavoriteNum = 0;

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(400));

  //ブックマークを押した際の挙動
  const handleBookmarkPress = () => {
    setTweetState((prev) => ({ ...prev, bookmark: !prev.bookmark }));
  };

  // ツイートの詳細モーダルを表示
  const handleTweetPress = () => {
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
                  animalNum={tweetState.animalNum}
                  setAnimalNum={(num) => setTweetState((prev) => ({ ...prev, animalNum: num }))}
                  initialAnimalNum={initialAnimalNum}
                />
              </View>
              <View style={{ flex: 1 }}>
                <RetweetIconButton
                  retweetNum={tweetState.retweetNum}
                  setRetweetNum={(num) => setTweetState((prev) => ({ ...prev, retweetNum: num }))}
                  initialRetweetNum={initialRetweetNum}
                />
              </View>
              <View style={{ flex: 1 }}>
                <FavIconButton
                  favoriteNum={tweetState.favoriteNum}
                  setFavoriteNum={(num) => setTweetState((prev) => ({ ...prev, favoriteNum: num }))}
                  initialFavoriteNum={initialFavoriteNum}
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
                  number={tweetState.impressionNum}
                />
              </View>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <TouchableOpacity
                  onPress={handleBookmarkPress}
                  style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}
                >
                  <Icon
                    name="bookmark"
                    size={16}
                    color={tweetState.bookmark ? colors.blue : colors.lightGray}
                  />
                </TouchableOpacity>
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
        tweetState={tweetState}
        setTweetState={setTweetState}
      />
    </>
  );
}
