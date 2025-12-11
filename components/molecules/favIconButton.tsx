import { useColors } from '@/hooks/use-colors';
import { useState } from 'react';
import IconButton from '../atoms/IconButton';

type FavIconButtonProps = {
  favoriteNum: number;
  isJustifyContent?: boolean;
  size?: number;
};

export default function FavIconButton({
  favoriteNum,
  isJustifyContent,
  size = 16,
}: FavIconButtonProps) {
  const colors = useColors();
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentFavoriteNum, setCurrentFavoriteNum] = useState(favoriteNum);

  // いいねを押したときの挙動
  const handleFavoritePress = () => {
    if (isFavorited) {
      setIsFavorited(false);
      setCurrentFavoriteNum(currentFavoriteNum - 1);
    } else {
      setIsFavorited(true);
      setCurrentFavoriteNum(currentFavoriteNum + 1);
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
      number={currentFavoriteNum}
      onPress={handleFavoritePress}
      isJustifyContent={isJustifyContent}
    />
  );
}
