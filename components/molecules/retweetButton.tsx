import { useColors } from '@/hooks/use-colors';
import IconButton from '../atoms/IconButton';

type RetweetIconButtonProps = {
  retweetNum: number;
  setRetweetNum: (retweet: number) => void;
  initialRetweetNum: number;
  isRetweet: boolean;
  isHideNumber?: boolean;
  isJustifyContent?: boolean;
  size?: number;
};

export default function RetweetIconButton({
  retweetNum,
  setRetweetNum,
  initialRetweetNum,
  isRetweet,
  isHideNumber,
  isJustifyContent,
  size = 16,
}: RetweetIconButtonProps) {
  const colors = useColors();

  // リツイートを押したときの挙動
  const handleRetweetPress = () => {
    if (isRetweet) {
      setRetweetNum(initialRetweetNum);
    } else {
      setRetweetNum(initialRetweetNum + 1);
    }
  };

  return (
    <IconButton
      icon={{
        name: 'retweet',
        family: 'FontAwesome6',
        size: size,
        color: isRetweet ? colors.green : colors.lightGray,
      }}
      number={!isHideNumber ? retweetNum : undefined}
      onPress={handleRetweetPress}
      isJustifyContent={isJustifyContent}
    />
  );
}
