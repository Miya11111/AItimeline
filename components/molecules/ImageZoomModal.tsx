import { Dimensions, Image, Modal, Text, TouchableOpacity, View } from 'react-native';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type ImageZoomModalProps = {
  visible: boolean;
  imageSource: any;
  onClose: () => void;
};

export default function ImageZoomModal({ visible, imageSource, onClose }: ImageZoomModalProps) {
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  // アニメーション用のShared Values
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // ピンチジェスチャー
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      // 最小スケールは1、最大は4
      if (scale.value < 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else if (scale.value > 4) {
        scale.value = withSpring(4);
        savedScale.value = 4;
      } else {
        savedScale.value = scale.value;
      }
    });

  // パンジェスチャー（ドラッグ）
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // ダブルタップジェスチャー
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        // 拡大状態の場合は元に戻す
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        // 通常状態の場合は2倍に拡大
        scale.value = withSpring(2);
        savedScale.value = 2;
      }
    });

  // ジェスチャーを組み合わせ
  const composedGesture = Gesture.Simultaneous(
    Gesture.Race(doubleTapGesture, pinchGesture),
    panGesture
  );

  // アニメーションスタイル
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  const handleClose = () => {
    // リセット
    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <GestureDetector gesture={composedGesture}>
            <Animated.View
              style={[
                {
                  width: screenWidth,
                  height: screenHeight,
                  justifyContent: 'center',
                  alignItems: 'center',
                },
                animatedStyle,
              ]}
            >
              <Image
                source={imageSource}
                style={{
                  width: screenWidth * 0.95,
                  height: screenWidth * 0.95,
                }}
                resizeMode="contain"
              />
            </Animated.View>
          </GestureDetector>

          {/* 閉じるボタン */}
          <TouchableOpacity
            onPress={handleClose}
            style={{
              position: 'absolute',
              top: 40,
              right: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: 20,
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>×</Text>
          </TouchableOpacity>

          {/* 操作ヒント */}
          <View
            style={{
              position: 'absolute',
              bottom: 40,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 12 }}>
              ダブルタップで拡大/縮小　ピンチで拡大縮小
            </Text>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
