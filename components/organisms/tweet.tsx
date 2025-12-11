import { useColors } from '@/hooks/use-colors';
import { useState } from 'react';
import { Animated, ImageSourcePropType, Text, TouchableOpacity, View } from 'react-native';
import IconButton from '../atoms/IconButton';
import { Icon } from '../atoms/icon';
import RoundImage from '../atoms/RoundImage';
import FavIconButton from '../molecules/favIconButton';
import RetweetIconButton from '../molecules/retweetButton';
import TweetDetail from './tweetDetail';

export type TweetType = {
  image: ImageSourcePropType;
  name: string;
  nameId: string;
  message: string;
  animalNum: number;
  retweetNum: number;
  favoriteNum: number;
  impressionNum: number;
};

export default function Tweet({
  image,
  name,
  nameId,
  message,
  animalNum,
  retweetNum,
  favoriteNum,
  impressionNum,
}: TweetType) {
  const colors = useColors();
  const [bookmark, setBookmark] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(400));

  //ブックマークを押した際の挙動
  const handleBookmarkPress = () => {
    setBookmark(!bookmark);
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
                <IconButton
                  icon={{ name: 'paw', family: 'FontAwesome6', size: 16, color: colors.lightGray }}
                  number={animalNum}
                />
              </View>
              <View style={{ flex: 1 }}>
                <RetweetIconButton retweetNum={retweetNum} />
              </View>
              <View style={{ flex: 1 }}>
                <FavIconButton favoriteNum={favoriteNum} />
              </View>
              <View style={{ flex: 1 }}>
                <IconButton
                  icon={{
                    name: 'chart-simple',
                    family: 'FontAwesome6',
                    size: 16,
                    color: colors.lightGray,
                  }}
                  number={impressionNum}
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
                    color={bookmark ? colors.blue : colors.lightGray}
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
        animalNum={animalNum}
        retweetNum={retweetNum}
        favoriteNum={favoriteNum}
        impressionNum={impressionNum}
        bookmark={bookmark}
        setBookmark={handleBookmarkPress}
      />
    </>
  );
}
