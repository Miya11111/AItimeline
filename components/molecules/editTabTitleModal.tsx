import { useColors } from '@/hooks/use-colors';
import { useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';

type EditTabTitleModalProps = {
  visible: boolean;
  currentTitle: string;
  onClose: () => void;
  onConfirm: (newTitle: string) => void;
};

export default function EditTabTitleModal({
  visible,
  currentTitle,
  onClose,
  onConfirm,
}: EditTabTitleModalProps) {
  const colors = useColors();
  const [title, setTitle] = useState(currentTitle);

  const handleConfirm = () => {
    if (title.trim()) {
      onConfirm(title.trim());
      onClose();
    }
  };

  const handleCancel = () => {
    setTitle(currentTitle);
    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={handleCancel}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        <View
          style={{
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: 20,
            width: '80%',
            maxWidth: 400,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: colors.black }}>
            タブ名を編集
          </Text>

          <TextInput
            style={{
              borderWidth: 1,
              borderColor: colors.darkGray,
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
              marginBottom: 20,
              color: colors.black,
            }}
            value={title}
            onChangeText={setTitle}
            placeholder="タブ名を入力"
            placeholderTextColor={colors.lightGray}
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
                backgroundColor: colors.darkGray,
              }}
            >
              <Text style={{ color: colors.black, fontWeight: 'bold' }}>キャンセル</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 8,
                backgroundColor: colors.blue,
              }}
              disabled={!title.trim()}
            >
              <Text style={{ color: colors.white, fontWeight: 'bold' }}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
