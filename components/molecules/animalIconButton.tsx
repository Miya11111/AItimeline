import { useColors } from '@/hooks/use-colors';
import { AnimalIconType } from '@/constants/animalIcons';
import IconButton from '../atoms/IconButton';

type AnimalIconButtonProps = {
  animalNum: number;
  setAnimalNum: (num: number) => void;
  initialAnimalNum: number;
  isAnimaled: boolean;
  animalIconType: AnimalIconType;
  onAnimalPress?: () => void; // 実績を+1するコールバック
  onAnimalUnpress?: () => void; // 実績を-1するコールバック
  isHideNumber?: boolean;
  isJustifyContent?: boolean;
  size?: number;
};

export default function AnimalIconButton({
  animalNum,
  setAnimalNum,
  initialAnimalNum,
  isAnimaled,
  animalIconType,
  onAnimalPress,
  onAnimalUnpress,
  isHideNumber,
  isJustifyContent,
  size = 16,
}: AnimalIconButtonProps) {
  const colors = useColors();

  // アニマルを押したときの挙動
  const handleAnimalPress = () => {
    if (isAnimaled) {
      setAnimalNum(initialAnimalNum);
      // 実績を-1
      if (onAnimalUnpress) {
        onAnimalUnpress();
      }
    } else {
      setAnimalNum(initialAnimalNum + 1);
      // 実績を+1
      if (onAnimalPress) {
        onAnimalPress();
      }
    }
  };

  return (
    <IconButton
      icon={{
        name: animalIconType,
        family: 'FontAwesome6',
        size: size,
        color: isAnimaled ? colors.blue : colors.lightGray,
      }}
      number={!isHideNumber ? animalNum : undefined}
      onPress={handleAnimalPress}
      isJustifyContent={isJustifyContent}
    />
  );
}
