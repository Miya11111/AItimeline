import { useColors } from '@/hooks/use-colors';
import IconButton from '../atoms/IconButton';

type FavIconButtonProps = {
  favoriteNum: number;
  setFavoriteNum: (favorite: number) => void;
  initialFavoriteNum: number;
  isFavorited: boolean;
  isHideNumber?: boolean;
  isJustifyContent?: boolean;
  size?: number;
};

export default function FavIconButton({
  favoriteNum,
  setFavoriteNum,
  initialFavoriteNum,
  isFavorited,
  isHideNumber,
  isJustifyContent,
  size = 16,
}: FavIconButtonProps) {
  const colors = useColors();

  // いいねを押したときの挙動
  const handleFavoritePress = () => {
    if (isFavorited) {
      setFavoriteNum(initialFavoriteNum);
    } else {
      setFavoriteNum(initialFavoriteNum + 1);
    }
  };

  return (
    <IconButton
      icon={{
        name: isFavorited ? 'favorite' : 'favorite-border',
        family: 'MaterialIcons',
        size: size,
        color: isFavorited ? colors.red : colors.lightGray,
      }}
      number={!isHideNumber ? favoriteNum : undefined}
      onPress={handleFavoritePress}
      isJustifyContent={isJustifyContent}
    />
  );
}
