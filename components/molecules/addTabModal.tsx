import { useColors } from '@/hooks/use-colors';
import { useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';

type AddTabModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (tabName: string) => void;
};

export default function AddTabModal({ visible, onClose, onConfirm }: AddTabModalProps) {
  const colors = useColors();
  const [tabName, setTabName] = useState('');

  const handleConfirm = () => {
    if (tabName.trim()) {
      onConfirm(tabName.trim());
      setTabName('');
      onClose();
    }
  };

  const handleCancel = () => {
    setTabName('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={handleCancel}>
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
            width: '80%',
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: 20,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: colors.black,
              marginBottom: 16,
            }}
          >
            新しいタブを追加
          </Text>

          <TextInput
            style={{
              borderWidth: 1,
              borderColor: colors.gray,
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
              color: colors.black,
              marginBottom: 20,
            }}
            placeholder="タブ名を入力"
            placeholderTextColor={colors.lightGray}
            value={tabName}
            onChangeText={setTabName}
            autoFocus
            maxLength={20}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
            <TouchableOpacity
              onPress={handleCancel}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.gray,
              }}
            >
              <Text style={{ color: colors.black, fontSize: 16 }}>キャンセル</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 8,
                backgroundColor: tabName.trim() ? colors.blue : colors.lightGray,
              }}
              disabled={!tabName.trim()}
            >
              <Text
                style={{
                  color: colors.white,
                  fontSize: 16,
                  fontWeight: 'bold',
                }}
              >
                追加
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
