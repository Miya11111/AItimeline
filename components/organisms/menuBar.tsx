import { useColors } from '@/hooks/use-colors';
import { useTabStore } from '@/stores/tabStore';
import { useAchievementStore } from '@/stores/achievementStore';
import { ANIMAL_ICONS } from '@/constants/animalIcons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import RoundImage from '../atoms/RoundImage';
import { Icon } from '../atoms/icon';
import AddTabModal from '../molecules/addTabModal';
import DraggableTabItem from '../molecules/draggableTabItem';
import EditTabTitleModal from '../molecules/editTabTitleModal';
import SelectLangPulldown from '../molecules/selectLangPulldown';

type MenuBarProps = {
  visible: boolean;
  onClose: () => void;
  slideAnim: Animated.Value;
};

export default function MenuBar({ visible, onClose, slideAnim }: MenuBarProps) {
  const colors = useColors();
  const screenWidth = Dimensions.get('window').width;
  const menuWidth = screenWidth * 0.8; // 画面幅の80%
  const router = useRouter();
  const [addTabModalVisible, setAddTabModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isVisibleAchievement, setIsVisibleAchievement] = useState<boolean>(false);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [achievementHeight] = useState(new Animated.Value(0));

  // Zustandから状態を取得
  const setActiveTab = useTabStore((state) => state.setActiveTab);
  const addTweetToTab = useTabStore((state) => state.addTweetToTab);
  const getTweetsForTab = useTabStore((state) => state.getTweetsForTab);
  const addTab = useTabStore((state) => state.addTab);
  const removeTab = useTabStore((state) => state.removeTab);
  const reorderTabs = useTabStore((state) => state.reorderTabs);
  const updateTabTitle = useTabStore((state) => state.updateTabTitle);

  // 全タブを取得（tabOrderとtabsを直接監視）
  const tabOrder = useTabStore((state) => state.tabOrder);
  const tabs = useTabStore((state) => state.tabs);

  // 実績を取得
  const achievements = useAchievementStore((state) => state.achievements);

  // tabOrderとtabsから配列を生成
  const tabArray = tabOrder.map((id) => tabs[id]).filter((tab) => tab !== undefined);

  const handleTabPress = (tabId: string) => {
    console.log(`${tabId} pressed`);

    // アクティブタブを変更
    setActiveTab(tabId);

    // メニューを閉じて画面遷移
    onClose();
    router.push('/(tabs)');
  };

  const handleAddTab = (tabName: string) => {
    // 新しいタブIDを生成（既存のタブ数 + 1）
    const newTabId = `tab${tabArray.length + 1}`;

    // Zustandに新しいタブを追加
    addTab({
      id: newTabId,
      title: tabName,
      icon: 'information-circle-outline',
    });

    console.log(`New tab added: ${tabName} (${newTabId})`);
  };

  const handleUpdateTabTitle = (tabId: string, newTitle: string) => {
    updateTabTitle(tabId, newTitle);
  };

  const handleMoveTab = (fromIndex: number, toIndex: number) => {
    const newOrder = [...tabOrder];
    const [movedTab] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedTab);
    reorderTabs(newOrder);
  };

  const handleDragStart = (index: number) => {
    setDraggingIndex(index);
  };

  const handleDragMove = (index: number, dy: number) => {
    const ITEM_HEIGHT = 68; // タブアイテムの高さ（paddingを含む）
    const offset = Math.round(dy / ITEM_HEIGHT);

    if (offset !== 0) {
      // ブックマークタブ（インデックス0）は移動できないため、最小値を1に設定
      const minIndex = 1;
      const newIndex = Math.max(minIndex, Math.min(tabArray.length - 1, index + offset));
      if (newIndex !== hoverIndex) {
        setHoverIndex(newIndex);
      }
    }
  };

  const handleDragEnd = () => {
    if (draggingIndex !== null && hoverIndex !== null && draggingIndex !== hoverIndex) {
      // ブックマークタブ（インデックス0）との入れ替えは禁止
      if (draggingIndex !== 0 && hoverIndex !== 0) {
        handleMoveTab(draggingIndex, hoverIndex);
      }
    }
    setDraggingIndex(null);
    setHoverIndex(null);
  };

  const toggleAchievement = () => {
    if (isVisibleAchievement) {
      // 閉じるアニメーション
      Animated.timing(achievementHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setIsVisibleAchievement(false);
      });
    } else {
      // 開くアニメーション
      setIsVisibleAchievement(true);
      Animated.timing(achievementHeight, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: menuWidth,
                backgroundColor: colors.white,
                transform: [{ translateX: slideAnim }],
                shadowColor: '#000',
                shadowOffset: { width: 2, height: 0 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <View style={{ flex: 1 }}>
                {/* ヘッダー */}
                <View
                  style={{
                    marginTop: 16,
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.darkGray,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <RoundImage source={require('@/assets/icon1.png')} size={48} />
                      <Text
                        style={{
                          color: colors.black,
                          paddingTop: 8,
                          fontSize: 16,
                          fontWeight: 'bold',
                        }}
                      >
                        テストユーザー
                      </Text>
                      <Text style={{ color: colors.lightGray }}>@test_user</Text>
                    </View>
                    {/* 編集アイコン */}
                    <TouchableOpacity onPress={() => setIsEdit(!isEdit)}>
                      <Icon
                        name="create-outline"
                        size={24}
                        color={isEdit ? colors.blue : colors.black}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={{ flexDirection: 'row', paddingVertical: 12 }}>
                    <TouchableOpacity style={{ flexDirection: 'row' }}>
                      <Text style={{ color: colors.black, fontWeight: 'bold' }}>1</Text>
                      <Text style={{ color: colors.lightGray, paddingLeft: 4 }}>フォロー</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flexDirection: 'row', paddingLeft: 8 }}>
                      <Text style={{ color: colors.black, fontWeight: 'bold' }}>10,000</Text>
                      <Text style={{ color: colors.lightGray, paddingLeft: 4 }}>フォロワー</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 実績 */}
                <TouchableOpacity
                  style={{
                    paddingVertical: 20,
                    paddingHorizontal: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  onPress={toggleAchievement}
                >
                  <Icon name={'trophy'} size={24} color={colors.black} />
                  <Text style={{ fontSize: 20, color: colors.black, marginLeft: 8 }}>実績</Text>
                </TouchableOpacity>
                {/* 実績表 */}
                {isVisibleAchievement && (
                  <Animated.View
                    style={{
                      marginHorizontal: 24,
                      marginBottom: 16,
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 12,
                      overflow: 'hidden',
                      maxHeight: achievementHeight.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 200],
                      }),
                      opacity: achievementHeight,
                    }}
                  >
                    {ANIMAL_ICONS.map((icon) => (
                      <View key={icon.type} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon
                          name={icon.type}
                          family="FontAwesome6"
                          size={16}
                          color={colors.black}
                        />
                        <Text style={{ color: colors.black, paddingLeft: 8 }}>
                          {achievements[icon.type]}
                        </Text>
                      </View>
                    ))}
                  </Animated.View>
                )}

                {/* タブリスト */}
                <View style={{ flex: 1 }}>
                  <ScrollView scrollEnabled={!isEdit || draggingIndex === null}>
                    {tabArray.map((tab, index) => (
                      <DraggableTabItem
                        key={tab.id}
                        tab={tab}
                        index={index}
                        isEdit={isEdit}
                        isDragging={draggingIndex === index}
                        onTabPress={handleTabPress}
                        onTitlePress={setEditingTabId}
                        onRemove={removeTab}
                        onDragStart={handleDragStart}
                        onDragMove={handleDragMove}
                        onDragEnd={handleDragEnd}
                      />
                    ))}

                    {/* 追加ボタン */}
                    <View style={{ borderTopWidth: 1, borderTopColor: colors.darkGray }} />
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 16,
                      }}
                      onPress={() => setAddTabModalVisible(true)}
                    >
                      <Icon name={'add-circle'} size={20} color={colors.blue} />
                      <Text style={{ color: colors.blue, marginLeft: 8, fontSize: 16 }}>追加</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>

                {/* 言語選択 */}
                <View style={{ marginTop: 'auto', marginBottom: 24 }}>
                  <SelectLangPulldown />
                </View>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

      {/* タブ追加モーダル */}
      <AddTabModal
        visible={addTabModalVisible}
        onClose={() => setAddTabModalVisible(false)}
        onConfirm={handleAddTab}
      />

      {/* タブタイトル編集モーダル */}
      {editingTabId && (
        <EditTabTitleModal
          visible={editingTabId !== null}
          currentTitle={tabs[editingTabId]?.title || ''}
          onClose={() => setEditingTabId(null)}
          onConfirm={(newTitle) => handleUpdateTabTitle(editingTabId, newTitle)}
        />
      )}
    </Modal>
  );
}
