import { useColors } from '@/hooks/use-colors';
import IconButton from '../atoms/IconButton';

type AnimalIconButtonProps = {
  animalNum: number;
  setAnimalNum: (num: number) => void;
  initialAnimalNum: number;
  isHideNumber?: boolean;
  isJustifyContent?: boolean;
  size?: number;
};

export default function AnimalIconButton({
  animalNum,
  setAnimalNum,
  initialAnimalNum,
  isHideNumber,
  isJustifyContent,
  size = 16,
}: AnimalIconButtonProps) {
  const colors = useColors();

  const isAnimaled = animalNum > initialAnimalNum;

  // アニマルを押したときの挙動
  const handleAnimalPress = () => {
    if (isAnimaled) {
      setAnimalNum(initialAnimalNum);
    } else {
      setAnimalNum(initialAnimalNum + 1);
    }
  };

  return (
    <IconButton
      icon={{
        name: 'paw',
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
