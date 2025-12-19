import ApiKeyModal from '@/components/molecules/ApiKeyModal';
import { useColors } from '@/hooks/use-colors';
import { getApiKey } from '@/services/apiKeyService';
import { useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Setting() {
  const colors = useColors();
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // APIキーを取得して表示
  useEffect(() => {
    const loadApiKey = async () => {
      const key = await getApiKey();
      // APIキーの最初の数文字だけ表示し、残りは*でマスク
      if (key) {
        const maskedKey =
          key.length > 10 ? `${key.substring(0, 10)}${'*'.repeat(key.length - 10)}` : key;
        setApiKey(maskedKey);
      } else {
        setApiKey('未設定');
      }
    };

    loadApiKey();
  }, []);

  // モーダルが閉じられたらAPIキーを再読み込み
  const handleModalClose = async () => {
    setShowApiKeyModal(false);
    const key = await getApiKey();
    if (key) {
      const maskedKey =
        key.length > 10 ? `${key.substring(0, 10)}${'*'.repeat(key.length - 10)}` : key;
      setApiKey(maskedKey);
    } else {
      setApiKey('未設定');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <View style={{ padding: 20 }}>
        {/* ヘッダー */}
        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.black,
            marginBottom: 24,
          }}
        >
          設定
        </Text>

        {/* APIキー設定 */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: colors.black,
              marginBottom: 8,
            }}
          >
            APIキー
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {/* APIキー表示（編集不可） */}
            <TextInput
              value={apiKey}
              editable={false}
              style={{
                flex: 1,
                backgroundColor: colors.darkGray,
                color: colors.black,
                padding: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.gray,
              }}
            />

            {/* 編集ボタン */}
            <TouchableOpacity
              onPress={() => setShowApiKeyModal(true)}
              style={{
                backgroundColor: colors.blue,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>編集</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* APIキー編集モーダル */}
      <ApiKeyModal visible={showApiKeyModal} onClose={handleModalClose} isFirstTime={false} />
    </SafeAreaView>
  );
}
