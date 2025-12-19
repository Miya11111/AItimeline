import { useColors } from '@/hooks/use-colors';
import { deleteApiKey, saveApiKey, validateApiKey } from '@/services/apiKeyService';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ImageZoomModal from './ImageZoomModal';

type ApiKeyModalProps = {
  visible: boolean;
  onClose: () => void;
  isFirstTime?: boolean;
};

// チュートリアル画像とテキストのデータ
const tutorialPages = [
  {
    description:
      '\nこのアプリでは、gemini APIを使用しています。\nアプリを開始する前に、APIキーを生成する必要があります。\n※無料枠のみでの使用が可能で、追加で課金の必要はありません。\n\nこの画面をスワイプすることで、APIキーを取得する方法の確認ができます。\n\nまた、APIキーの再設定は設定画面から行えます。',
  },
  {
    image: require('@/assets/aiStudio/aiStudio1.png'),
    description: '以下の「Google AI Studioでキーを取得」ボタンを\n押し、利用規約に同意してください',
  },
  {
    image: require('@/assets/aiStudio/aiStudio2.png'),
    description: '画面右上の「APIキーを作成」ボタンを\n押してください',
  },
  {
    image: require('@/assets/aiStudio/aiStudio3.png'),
    description: '「キーを作成」ボタンを押してください\n（キー名は設定しなくても構いません）',
  },
  {
    image: require('@/assets/aiStudio/aiStudio4.png'),
    description:
      '作成したキーのテーブルを左にスワイプして\nコピーアイコンを押し、\nコピーされたキーをここに貼り付けてください',
  },
];

export default function ApiKeyModal({ visible, onClose, isFirstTime = false }: ApiKeyModalProps) {
  const colors = useColors();
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [expandedImage, setExpandedImage] = useState<any>(null);
  const screenWidth = Dimensions.get('window').width;
  const modalWidth = Math.min(screenWidth * 0.9, 400);

  const handleOpenApiKeyPage = () => {
    Linking.openURL('https://aistudio.google.com/apikey');
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      Alert.alert('エラー', 'APIキーを入力してください');
      return;
    }

    setIsValidating(true);

    try {
      // APIキーの有効性を確認
      const isValid = await validateApiKey(apiKey);

      if (!isValid) {
        Alert.alert('エラー', 'APIキーが無効です。正しいキーを入力してください。');
        setIsValidating(false);
        return;
      }

      // 有効なキーを保存
      await saveApiKey(apiKey);
      Alert.alert('成功', 'APIキーを保存しました');
      setApiKey('');
      onClose();
    } catch (error) {
      console.error('[ApiKeyModal] Failed to save API key:', error);
      Alert.alert('エラー', 'APIキーの保存に失敗しました');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSkip = () => {
    if (isFirstTime) {
      Alert.alert('確認', '.envファイルのAPIキーを使用します。後で設定画面から変更できます。', [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'スキップ',
          onPress: onClose,
        },
      ]);
    } else {
      onClose();
    }
  };

  const handleDeleteKey = () => {
    Alert.alert('確認', 'APIキーを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteApiKey();
            Alert.alert('成功', 'APIキーを削除しました');
            onClose();
          } catch (error) {
            Alert.alert('エラー', 'APIキーの削除に失敗しました');
          }
        },
      },
    ]);
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / modalWidth);
    setCurrentPage(page);
  };

  const handleImagePress = (image: any) => {
    setExpandedImage(image);
    setIsImageExpanded(true);
  };

  const handleCloseExpandedImage = () => {
    setIsImageExpanded(false);
    setExpandedImage(null);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: colors.background,
            borderRadius: 16,
            padding: 24,
            width: modalWidth,
          }}
        >
          {/* タイトル */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: colors.text,
              marginBottom: 16,
              textAlign: 'center',
            }}
          >
            APIキーの管理
          </Text>

          {/* スワイプ可能なコンテンツエリア */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={{ marginBottom: 16 }}
          >
            {tutorialPages.map((page, index) => (
              <View key={index} style={{ width: modalWidth - 48 }}>
                {/* 説明文 */}
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.text,
                    marginBottom: 16,
                    lineHeight: 20,
                    textAlign: 'center',
                    minHeight: 60,
                  }}
                >
                  {page.description}
                </Text>

                {/* 画像（ある場合のみ） */}
                {page.image ? (
                  <TouchableOpacity
                    onPress={() => handleImagePress(page.image)}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={page.image}
                      style={{
                        width: '100%',
                        height: 200,
                        borderRadius: 8,
                      }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                ) : (
                  <View />
                )}
              </View>
            ))}
          </ScrollView>

          {/* ページインジケーター */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginBottom: 16,
              gap: 8,
            }}
          >
            {tutorialPages.map((_, index) => (
              <View
                key={index}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: currentPage === index ? colors.blue : colors.lightGray,
                }}
              />
            ))}
          </View>

          {/* APIキー取得リンク */}
          <TouchableOpacity
            onPress={handleOpenApiKeyPage}
            style={{
              backgroundColor: colors.blue,
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Google AI Studioでキーを取得</Text>
          </TouchableOpacity>

          {/* APIキー入力フィールド */}
          <TextInput
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="ここにAPIキーを貼りつけてください"
            placeholderTextColor={colors.lightGray}
            style={{
              backgroundColor: colors.surface,
              color: colors.text,
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* ボタン群 */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {/* 保存ボタン */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={isValidating}
              style={{
                flex: 1,
                backgroundColor: colors.blue,
                padding: 12,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              {isValidating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>保存</Text>
              )}
            </TouchableOpacity>

            {/* スキップまたはキャンセルボタン */}
            <TouchableOpacity
              onPress={handleSkip}
              disabled={isValidating}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                padding: 12,
                borderRadius: 8,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.text, fontWeight: 'bold' }}>
                {isFirstTime ? 'スキップ' : 'キャンセル'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 削除ボタン（初回以外） */}
          {!isFirstTime && (
            <TouchableOpacity
              onPress={handleDeleteKey}
              disabled={isValidating}
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: colors.error, fontWeight: 'bold' }}>APIキーを削除</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 画像拡大モーダル */}
      {isImageExpanded && (
        <ImageZoomModal
          visible={isImageExpanded}
          imageSource={expandedImage}
          onClose={handleCloseExpandedImage}
        />
      )}
    </Modal>
  );
}
