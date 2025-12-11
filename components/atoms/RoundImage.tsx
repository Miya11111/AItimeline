import { Image, ImageSourcePropType, View } from 'react-native';

type RoundImageProps = {
  source: ImageSourcePropType;
  size: number;
};

export default function RoundImage({ source, size }: RoundImageProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
      }}
    >
      <Image
        source={source}
        style={{
          width: size,
          height: size,
        }}
      />
    </View>
  );
}
