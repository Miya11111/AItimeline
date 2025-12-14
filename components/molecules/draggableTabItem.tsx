import { useColors } from '@/hooks/use-colors';
import { Tab } from '@/stores/tabStore';
import { useMemo, useRef } from 'react';
import { Animated, PanResponder, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '../atoms/icon';

type DraggableTabItemProps = {
  tab: Tab;
  index: number;
  isEdit: boolean;
  isDragging: boolean;
  onTabPress: (tabId: string) => void;
  onTitlePress: (tabId: string) => void;
  onRemove: (tabId: string) => void;
  onDragStart: (index: number) => void;
  onDragMove: (index: number, dy: number) => void;
  onDragEnd: () => void;
};

export default function DraggableTabItem({
  tab,
  index,
  isEdit,
  isDragging,
  onTabPress,
  onTitlePress,
  onRemove,
  onDragStart,
  onDragMove,
  onDragEnd,
}: DraggableTabItemProps) {
  const colors = useColors();
  const pan = useRef(new Animated.ValueXY()).current;
  const isBookmark = tab.id === 'bookmarks';
  const canDrag = isEdit && !isBookmark;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => canDrag,
        onMoveShouldSetPanResponder: () => canDrag,
        onPanResponderGrant: () => {
          onDragStart(index);
          pan.setOffset({
            x: 0,
            y: 0,
          });
        },
        onPanResponderMove: (_, gesture) => {
          pan.setValue({ x: 0, y: gesture.dy });
          onDragMove(index, gesture.dy);
        },
        onPanResponderRelease: () => {
          pan.flattenOffset();
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
          onDragEnd();
        },
      }),
    [canDrag, index, onDragStart, onDragMove, onDragEnd, pan]
  );

  const handleTitlePress = () => {
    if (isEdit && !isBookmark) {
      onTitlePress(tab.id);
    } else if (!isEdit) {
      onTabPress(tab.id);
    }
  };

  return (
    <Animated.View
      style={{
        paddingVertical: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: isDragging ? colors.darkGray : colors.white,
        transform: [{ translateY: pan.y }],
        zIndex: isDragging ? 1000 : 1,
        elevation: isDragging ? 5 : 0,
      }}
    >
      {/* ハンバーガーボタン（編集モード時のみ表示、ブックマーク以外） */}
      {isEdit && !isBookmark && (
        <View {...panResponder.panHandlers} style={{ marginRight: 12, padding: 4 }}>
          <Icon name="menu" size={24} color={colors.lightGray} />
        </View>
      )}

      {/* タブアイコンとタイトル */}
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
        onPress={handleTitlePress}
        disabled={isEdit && isBookmark}
      >
        <Icon name={tab.icon} size={28} color={colors.black} />
        <Text
          style={{
            fontSize: 20,
            color: colors.black,
            marginLeft: 8,
          }}
        >
          {tab.title}
        </Text>
      </TouchableOpacity>

      {/* 削除ボタン（編集モード時のみ表示、ブックマーク以外） */}
      {isEdit && !isBookmark && (
        <TouchableOpacity onPress={() => onRemove(tab.id)}>
          <Icon name="close-circle" size={24} color={colors.red} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}
