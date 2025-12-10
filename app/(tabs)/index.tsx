import { Text, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { useTranslation } from 'react-i18next';

export const HomeLangJa = {
  welcome: 'こんにちは',
};

export const HomeLangEn = {
  welcome: 'welcome',
};

export default function HomeScreen() {
  const colors = useColors();
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1}}>
        <View style={{width: '100%', height: 36, backgroundColor:colors.primary}}>
          <Text style={{color: colors.white}}>{t("home.welcome")}</Text>
        </View>
    </View>
  )
}
