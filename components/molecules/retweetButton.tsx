import { useColors } from '@/hooks/use-colors';
import { useState } from 'react';
import IconButton from '../atoms/IconButton';

type RetweetIconButtonProps = {
  retweetNum: number;
  isJustifyContent?: boolean;
  size?: number;
};

export default function RetweetIconButton({
  retweetNum,
  isJustifyContent,
  size = 16,
}: RetweetIconButtonProps) {
  const colors = useColors();
  const [isRetweet, setIsRetweet] = useState(false);
  const [currentRetweetNum, setCurrentRetweetNum] = useState(retweetNum);

  // いいねを押したときの挙動
  const handleFavoritePress = () => {
    if (isRetweet) {
      setIsRetweet(false);
      setCurrentRetweetNum(currentRetweetNum - 1);
    } else {
      setIsRetweet(true);
      setCurrentRetweetNum(currentRetweetNum + 1);
    }
  };

  return (
    <IconButton
      icon={{
        name: 'retweet',
        family: 'FontAwesome6',
        size: size,
        color: isRetweet ? colors.green : colors.darkGray,
      }}
      number={currentRetweetNum}
      onPress={handleFavoritePress}
      isJustifyContent={isJustifyContent}
    />
  );
}
