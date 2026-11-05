import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { gameColors, gameGradients } from '../../theme';
import Ellipse from './Ellipse';

const FRAME_WIDTH = 390;
const FRAME_STATUS_BAR = 48;

/**
 * Confetti của A4: [left, top, boxW, boxH] là khung bao sau khi xoay (Figma),
 * [w, h, rotate, color] là mảnh giấy gốc.
 */
const confetti: [number, number, number, number, number, number, number, string][] = [
  [14.51, 130, 12.73, 12.73, 6, 12, 45, gameColors.red],
  [74.05, 201, 9.87, 14.98, 8, 14, 8, gameColors.green],
  [129, 243.15, 16.5, 18.84, 10, 16, -29, '#5b8def'],
  [174.68, 123, 12.8, 18.88, 6, 18, 24, gameColors.purple],
  [235, 192.2, 10.49, 13.49, 8, 12, -13, gameColors.orange],
  [279, 265, 16.66, 17.15, 10, 14, 40, gameColors.yellow],
  [340.16, 116, 6.83, 16.29, 6, 16, 3, gameColors.red],
  [24, 182.53, 16.7, 19.4, 8, 18, -34, gameColors.green],
  [73.09, 258, 13.36, 14.6, 10, 12, 19, '#5b8def'],
  [130, 107.15, 10.03, 15.17, 6, 14, -18, gameColors.purple],
  [173.82, 180, 15.73, 17.7, 8, 16, 35, gameColors.orange],
  [236, 250.65, 10.62, 18.34, 10, 18, -2, gameColors.yellow],
  [289, 98.22, 12.21, 13.1, 6, 12, -39, gameColors.red],
  [338.61, 173, 11.15, 15.52, 8, 14, 14, gameColors.green],
  [25, 240.09, 15.46, 18.64, 10, 16, -23, '#5b8def'],
  [69, 95, 14.2, 18.59, 6, 18, 30, gameColors.purple],
  [131, 165.03, 9.4, 12.89, 8, 12, -7, gameColors.orange],
  [184, 230.05, 16.92, 17.02, 10, 14, -44, gameColors.yellow],
  [234.5, 284, 8.43, 16.74, 6, 16, 9, gameColors.red],
  [290, 155.24, 15.51, 19.65, 8, 18, -28, gameColors.green],
  [337.93, 230, 14.13, 15.1, 10, 12, 25, '#5b8def'],
  [26, 275.75, 8.78, 14.94, 6, 14, -12, gameColors.purple],
  [68.5, 152, 16.54, 17.32, 8, 16, 41, gameColors.orange],
  [130.74, 223, 11.23, 18.65, 10, 18, 4, gameColors.yellow],
  [185, 266.73, 11.57, 13.33, 6, 12, -33, gameColors.red],
  [233.21, 145, 12.31, 15.89, 8, 14, 20, gameColors.green],
];

const pct = (x: number) => `${(x / FRAME_WIDTH) * 100}%` as const;

/**
 * Một mảnh confetti: rơi từ trên màn hình xuống, xoay vài vòng rồi dừng đúng vị trí Figma.
 * Mỗi mảnh trễ một chút (theo chỉ số) để trông như mưa giấy.
 */
function ConfettiPiece({ index, top, rotate, style }: { index: number; top: number; rotate: number; style: object }) {
  const reduced = useReducedMotion();
  const t = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) return;
    t.value = withDelay((index % 9) * 70 + Math.floor(index / 9) * 120, withTiming(1, { duration: 1100 + (index % 4) * 180, easing: Easing.out(Easing.cubic) }));
  }, [reduced, index, t]);
  const spin = index % 2 === 0 ? 540 : -540;
  const animated = useAnimatedStyle(() => ({
    opacity: Math.min(t.value * 4, 1),
    transform: [
      { translateY: (1 - t.value) * -(top + 80) },
      { rotate: `${rotate + (1 - t.value) * spin}deg` },
    ],
  }));
  return <Animated.View style={[style, animated]} />;
}

/** Nền vàng nắng + đồi cỏ + confetti của màn kết quả (Figma A4). */
export default function SunnyBackground({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const topOffset = insets.top - FRAME_STATUS_BAR;
  // Toạ độ Figma theo bề ngang 390 → quy đổi theo bề ngang màn hình.
  const sx = (x: number) => (x / FRAME_WIDTH) * width;

  return (
    <LinearGradient colors={gameGradients.sunnyScreen} style={styles.fill}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Đồi cỏ: elip 760×420 tại x=-200 và 700×440 tại x=-40 (frame 390×844). */}
        <Ellipse width={sx(760)} height={420} left={sx(-200)} bottom={-276} color="#9BDB74" />
        <Ellipse width={sx(700)} height={440} left={sx(-40)} bottom={-336} color="#6CC24A" />
        {confetti.map(([left, top, boxW, boxH, w, h, rotate, color], i) => (
          <ConfettiPiece
            key={i}
            index={i}
            top={top + topOffset}
            rotate={rotate}
            style={[
              styles.confetti,
              {
                // Đặt theo tâm khung bao để giữ đúng vị trí sau khi xoay.
                left: pct(left + boxW / 2),
                marginLeft: -w / 2,
                top: top + boxH / 2 - h / 2 + topOffset,
                width: w,
                height: h,
                backgroundColor: color,
              },
            ]}
          />
        ))}
      </View>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    overflow: 'hidden',
  },
  confetti: {
    position: 'absolute',
    borderRadius: 2,
  },
});
