import { useColors } from '@/hooks/use-colors';
import { Text, TouchableOpacity } from 'react-native';
import { Icon, IconProps } from './icon';

type IconButtonProps = {
  icon: IconProps;
  number?: number;
  onPress?: () => void;
  isJustifyContent?: boolean;
};

export default function IconButton({ icon, number, onPress, isJustifyContent }: IconButtonProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: isJustifyContent ? 'center' : 'flex-start',
      }}
    >
      <Icon name={icon.name} family={icon.family} size={icon.size} color={icon.color} />
      {number !== undefined && (
        <Text style={{ color: colors.lightGray, marginLeft: 3 }}>{number}</Text>
      )}
    </TouchableOpacity>
  );
}
