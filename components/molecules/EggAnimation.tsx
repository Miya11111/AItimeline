import { useColors } from '@/hooks/use-colors';
import { useEffect, useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';

type AnimationType = 'normal' | 'slender' | 'golden' | 'chicken';

// 画像を事前に読み込み（Metro bundlerの制約対応）
const ANIMATION_IMAGES = {
  normal: [
    require('@/assets/icon_anim/normal/normal1.png'),
    require('@/assets/icon_anim/normal/normal2.png'),
    require('@/assets/icon_anim/normal/normal3.png'),
    require('@/assets/icon_anim/normal/normal4.png'),
    require('@/assets/icon_anim/normal/normal5.png'),
    require('@/assets/icon_anim/normal/normal6.png'),
    require('@/assets/icon_anim/normal/normal7.png'),
    require('@/assets/icon_anim/normal/normal8.png'),
    require('@/assets/icon_anim/normal/normal9.png'),
    require('@/assets/icon_anim/normal/normal10.png'),
    require('@/assets/icon_anim/normal/normal11.png'),
    require('@/assets/icon_anim/normal/normal12.png'),
    require('@/assets/icon_anim/normal/normal13.png'),
    require('@/assets/icon_anim/normal/normal14.png'),
    require('@/assets/icon_anim/normal/normal15.png'),
  ],
  slender: [
    require('@/assets/icon_anim/slender/slender1.png'),
    require('@/assets/icon_anim/slender/slender2.png'),
    require('@/assets/icon_anim/slender/slender3.png'),
    require('@/assets/icon_anim/slender/slender4.png'),
    require('@/assets/icon_anim/slender/slender5.png'),
    require('@/assets/icon_anim/slender/slender6.png'),
    require('@/assets/icon_anim/slender/slender7.png'),
    require('@/assets/icon_anim/slender/slender8.png'),
    require('@/assets/icon_anim/slender/slender9.png'),
    require('@/assets/icon_anim/slender/slender10.png'),
    require('@/assets/icon_anim/slender/slender11.png'),
    require('@/assets/icon_anim/slender/slender12.png'),
    require('@/assets/icon_anim/slender/slender13.png'),
    require('@/assets/icon_anim/slender/slender14.png'),
    require('@/assets/icon_anim/slender/slender15.png'),
  ],
  golden: [
    require('@/assets/icon_anim/golden/golden1.png'),
    require('@/assets/icon_anim/golden/golden2.png'),
    require('@/assets/icon_anim/golden/golden3.png'),
    require('@/assets/icon_anim/golden/golden4.png'),
    require('@/assets/icon_anim/golden/golden5.png'),
    require('@/assets/icon_anim/golden/golden6.png'),
    require('@/assets/icon_anim/golden/golden7.png'),
    require('@/assets/icon_anim/golden/golden8.png'),
    require('@/assets/icon_anim/golden/golden9.png'),
    require('@/assets/icon_anim/golden/golden10.png'),
    require('@/assets/icon_anim/golden/golden11.png'),
    require('@/assets/icon_anim/golden/golden12.png'),
    require('@/assets/icon_anim/golden/golden13.png'),
    require('@/assets/icon_anim/golden/golden14.png'),
    require('@/assets/icon_anim/golden/golden15.png'),
  ],
  chicken: [
    require('@/assets/icon_anim/chicken/chicken1.png'),
    require('@/assets/icon_anim/chicken/chicken2.png'),
    require('@/assets/icon_anim/chicken/chicken3.png'),
    require('@/assets/icon_anim/chicken/chicken4.png'),
    require('@/assets/icon_anim/chicken/chicken5.png'),
    require('@/assets/icon_anim/chicken/chicken6.png'),
    require('@/assets/icon_anim/chicken/chicken7.png'),
    require('@/assets/icon_anim/chicken/chicken8.png'),
    require('@/assets/icon_anim/chicken/chicken9.png'),
    require('@/assets/icon_anim/chicken/chicken10.png'),
    require('@/assets/icon_anim/chicken/chicken11.png'),
    require('@/assets/icon_anim/chicken/chicken12.png'),
    require('@/assets/icon_anim/chicken/chicken13.png'),
    require('@/assets/icon_anim/chicken/chicken14.png'),
    require('@/assets/icon_anim/chicken/chicken15.png'),
  ],
};

export default function EggAnimation() {
  const colors = useColors();
  const [buttonPressCount, setButtonPressCount] = useState(0);
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationFrame, setAnimationFrame] = useState(1);
  const [selectedAnimation, setSelectedAnimation] = useState<AnimationType>('normal');

  // ランダムにアニメーションタイプを選択（確率付き）
  const selectRandomAnimation = (): AnimationType => {
    const random = Math.random() * 100;

    // 確率設定: normal: 70%, slender: 15%, golden: 10%, chicken: 5%
    if (random < 70) {
      return 'normal';
    } else if (random < 85) {
      return 'slender';
    } else if (random < 95) {
      return 'golden';
    } else {
      return 'chicken';
    }
  };

  // 10回押された後のアニメーション
  useEffect(() => {
    if (buttonPressCount >= 10 && !isAnimating) {
      // ランダムにアニメーションを選択
      const animationType = selectRandomAnimation();
      setSelectedAnimation(animationType);
      console.log('[EggAnimation] Starting animation! Type:', animationType);
      setIsAnimating(true);

      let frame = 0;
      const interval = setInterval(() => {
        frame += 1;
        console.log('[EggAnimation] Frame:', frame);
        setAnimationFrame(frame);

        if (frame >= 15) {
          console.log('[EggAnimation] Animation complete!');
          clearInterval(interval);
          setTimeout(() => {
            setIsAnimating(false);
            setButtonPressCount(0);
            setAnimationFrame(1);
          }, 100);
        }
      }, 100); // 100msごとにフレームを更新

      return () => {
        console.log('[EggAnimation] Cleanup interval');
        clearInterval(interval);
      };
    }
  }, [buttonPressCount]);

  // アニメーションタイプに応じた画像配列を取得
  const getAnimationImages = (type: AnimationType) => {
    return ANIMATION_IMAGES[type];
  };

  // 表示する画像を決定
  const getImageSource = () => {
    if (isAnimating) {
      // アニメーション中は選択されたタイプの画像を表示
      const images = getAnimationImages(selectedAnimation);
      const index = Math.min(animationFrame - 1, 14);
      console.log('[EggAnimation] Showing frame:', animationFrame, 'type:', selectedAnimation);
      return images[index];
    } else if (isButtonPressed) {
      // ボタン押下中はegg2.pngを表示
      return require('@/assets/icon_anim/egg2.png');
    } else {
      // 通常時はegg1.pngを表示
      return require('@/assets/icon_anim/egg1.png');
    }
  };

  const handleButtonPress = () => {
    if (!isAnimating) {
      const newCount = buttonPressCount + 1;
      console.log('[EggAnimation] Button pressed! Count:', newCount);
      setButtonPressCount(newCount);
    }
  };

  return (
    <View style={{ alignItems: 'center', marginTop: 24 }}>
      {/* 卵の画像 */}
      <Image
        source={getImageSource()}
        style={{
          width: 200,
          height: 200,
          marginBottom: 24,
        }}
        resizeMode="contain"
      />

      {/* 青い丸いボタン */}
      <TouchableOpacity
        onPressIn={() => setIsButtonPressed(true)}
        onPressOut={() => setIsButtonPressed(false)}
        onPress={handleButtonPress}
        disabled={isAnimating}
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: isAnimating ? colors.lightGray : colors.blue,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      />

      {/* 画像プリロード用（非表示） */}
      <View style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}>
        {[
          ...ANIMATION_IMAGES.normal,
          ...ANIMATION_IMAGES.slender,
          ...ANIMATION_IMAGES.golden,
          ...ANIMATION_IMAGES.chicken,
        ].map((img, idx) => (
          <Image key={idx} source={img} style={{ width: 1, height: 1 }} />
        ))}
      </View>
    </View>
  );
}
