import { useColors } from '@/hooks/use-colors';
import {
  Animated,
  Dimensions,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import RoundImage from '../atoms/RoundImage';
import { Icon } from '../atoms/icon';
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

  const tabArray = [
    {
      title: 'テスト1',
      icon: 'information-circle-outline',
    },
    {
      title: 'テスト2',
      icon: 'information-circle-outline',
    },
  ];

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
                    <TouchableOpacity onPress={() => console.log('Edit pressed')}>
                      <Icon name="create-outline" size={24} color={colors.black} />
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

                {/* メニュー項目 */}
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
                {tabArray.map((tab, index) => (
                  <TouchableOpacity
                    key={index}
                    style={{
                      paddingVertical: 20,
                      paddingHorizontal: 20,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      console.log(`${tab.title} pressed`);
                      onClose();
                    }}
                  >
                    <Icon name={tab.icon} size={28} color={colors.black} />
                    <Text style={{ fontSize: 20, color: colors.black, marginLeft: 8 }}>
                      {tab.title}
                    </Text>
                  </TouchableOpacity>
                ))}
                {/* 追加 */}
                <View style={{ borderWidth: 1, borderColor: colors.darkGray }} />
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 16,
                  }}
                >
                  <Icon name={'add-circle'} size={20} color={colors.blue} />
                  <Text style={{ color: colors.blue, marginLeft: 8, fontSize: 16 }}>追加</Text>
                </TouchableOpacity>

                {/* 言語選択 */}
                <View style={{ marginTop: 'auto', marginBottom: 24 }}>
                  <SelectLangPulldown />
                </View>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
