import { useColors } from '@/hooks/use-colors';
import { useTabStore } from '@/stores/tabStore';
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

  // Zustandから状態を取得
  const setActiveTab = useTabStore((state) => state.setActiveTab);
  const addTweetToTab = useTabStore((state) => state.addTweetToTab);
  const getTweetsForTab = useTabStore((state) => state.getTweetsForTab);
  const addTab = useTabStore((state) => state.addTab);
  const removeTab = useTabStore((state) => state.removeTab);

  // 全タブを取得（tabOrderとtabsを直接監視）
  const tabOrder = useTabStore((state) => state.tabOrder);
  const tabs = useTabStore((state) => state.tabs);

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
                        color={isEdit ? colors.yellow : colors.black}
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
                  onPress={() => {
                    console.log('Achievement pressed');
                    onClose();
                  }}
                >
                  <Icon name={'trophy'} size={24} color={colors.black} />
                  <Text style={{ fontSize: 20, color: colors.black, marginLeft: 8 }}>実績</Text>
                </TouchableOpacity>

                {/* タブリスト */}
                <View style={{ flex: 1 }}>
                  <ScrollView>
                    {tabArray.map((tab, index) => (
                      <TouchableOpacity
                        key={index}
                        style={{
                          paddingVertical: 20,
                          paddingHorizontal: 20,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                        onPress={() => handleTabPress(tab.id)}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                          <Icon name={tab.icon} size={28} color={colors.black} />
                          <Text style={{ fontSize: 20, color: colors.black, marginLeft: 8 }}>
                            {tab.title}
                          </Text>
                        </View>
                        {isEdit && tab.id !== 'bookmarks' && (
                          <TouchableOpacity onPress={() => removeTab(tab.id)}>
                            <Icon name="close-circle" size={24} color={colors.red} />
                          </TouchableOpacity>
                        )}
                      </TouchableOpacity>
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
    </Modal>
  );
}
