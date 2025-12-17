import { useColors } from '@/hooks/use-colors';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '../atoms/Icon';

type SelectLangPulldownProps = {
  onLanguageChange?: (language: string) => void;
};

export default function SelectLangPulldown({ onLanguageChange }: SelectLangPulldownProps) {
  const colors = useColors();
  const [selectedLanguage, setSelectedLanguage] = useState('日本語');
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  const languages = ['日本語', 'English'];

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    setIsLanguageDropdownOpen(false);
    onLanguageChange?.(language);
    console.log(`Language changed to: ${language}`);
  };

  return (
    <View style={{ paddingHorizontal: 80, paddingBottom: 20 }}>
      {isLanguageDropdownOpen && (
        <View
          style={{
            marginBottom: 4,
            borderWidth: 1,
            borderColor: colors.darkGray,
            borderRadius: 8,
            backgroundColor: colors.white,
          }}
        >
          {languages.map((language, index) => (
            <TouchableOpacity
              key={index}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderBottomWidth: index < languages.length - 1 ? 1 : 0,
                borderBottomColor: colors.darkGray,
              }}
              onPress={() => handleLanguageSelect(language)}
            >
              <Text style={{ color: colors.black, fontSize: 16, textAlign: 'center' }}>
                {language}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 6,
          paddingHorizontal: 16,
          borderWidth: 1,
          borderColor: colors.darkGray,
          borderRadius: 32,
          position: 'relative',
        }}
        onPress={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
      >
        <Text style={{ color: colors.black, fontSize: 16, paddingRight: 16 }}>
          {selectedLanguage}
        </Text>
        <View style={{ position: 'absolute', right: 16 }}>
          <Icon
            name={isLanguageDropdownOpen ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.black}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}
