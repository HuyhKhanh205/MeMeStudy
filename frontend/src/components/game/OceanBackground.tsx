import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { gameGradients } from '../../theme';
import Emoji from '../Emoji';
import { RiseFade, Sway, Swim } from '../motion';
import type { EmojiName } from '../emojiAssets';
import Ellipse from './Ellipse';

/** Bố cục theo frame Figma 390×844, trong đó 48px trên cùng là status bar. */
const FRAME_STATUS_BAR = 48;

/** Tia sáng xoay 14° — vẽ bằng View. Toạ độ là tâm hình chữ nhật trong frame. */
const rays = [
  { cx: -39.8, cy: 404, width: 60, alpha: 0.1 },
  { cx: 60.5, cy: 401.5, width: 40, alpha: 0.08 },
  { cx: 185.1, cy: 405.1, width: 70, alpha: 0.07 },
];

/** Bong bóng nước — hình tròn viền trắng (vị trí/kích thước theo Figma). */
const bubbles: { size: number; top: number; left?: number; right?: number }[] = [
  { size: 22, left: 28, top: 150 },
  { size: 30, right: 14, top: 190 },
  { size: 18, right: 72, top: 520 },
  { size: 26, left: 24, top: 520 },
  { size: 14, right: 24, top: 420 },
  { size: 16, left: 70, top: 600 },
  { size: 12, left: 200, top: 560 },
];

type Deco = {
  name: EmojiName;
  size: number;
  flip?: boolean;
  /** Kiểu chuyển động: cá bơi, rong/san hô lắc lư; không có = đứng yên. */
  motion?: 'swim' | 'sway';
  delay?: number;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

/** Cá: neo theo cạnh trên. Fluent Emoji (MIT) đặt vào đúng chỗ cá trong Figma. */
const fishes: Deco[] = [
  { name: 'tropicalFish', size: 48, right: 22, top: 492, motion: 'swim' },
  { name: 'fish', size: 40, left: 18, top: 462, flip: true, motion: 'swim', delay: 900 },
];

/** Đáy biển: rong (herb), san hô, vỏ ốc thay cho rong/san hô/rương trong Figma. */
const seabed: Deco[] = [
  { name: 'herb', size: 76, left: -10, bottom: 70, motion: 'sway' },
  { name: 'herb', size: 64, right: -10, bottom: 70, flip: true, motion: 'sway', delay: 700 },
  { name: 'coral', size: 72, right: -8, bottom: 140, motion: 'sway', delay: 300 },
  { name: 'spiralShell', size: 58, right: 26, bottom: 12 },
];

function DecoEmoji({ deco, topOffset }: { deco: Deco; topOffset: number }) {
  const { name, size, flip, top, motion, delay, ...edges } = deco;
  const position = [styles.abs, edges, top != null && { top: top + topOffset }];
  const image = <Emoji name={name} size={size} flip={flip} />;
  if (motion === 'swim') return <Swim style={position} delay={delay}>{image}</Swim>;
  if (motion === 'sway') return <Sway style={position} delay={delay}>{image}</Sway>;
  return <View style={position}>{image}</View>;
}

/** Nền "dưới đáy biển" của màn làm bài (bố cục theo Figma A3). */
export default function OceanBackground({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const topOffset = insets.top - FRAME_STATUS_BAR;

  return (
    <LinearGradient colors={gameGradients.oceanScreen} style={styles.fill}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {rays.map((ray, i) => (
          <View
            key={i}
            style={[
              styles.ray,
              {
                left: ray.cx - ray.width / 2,
                top: ray.cy - 450 + topOffset,
                width: ray.width,
                backgroundColor: `rgba(255,255,255,${ray.alpha})`,
              },
            ]}
          />
        ))}
        {/* Đồi cát: elip 640×240 trên frame 390 → giãn theo bề ngang màn hình. */}
        <Ellipse width={width + 250} height={240} left={-125} bottom={-166} color="#F3D9A4" />
        {/* Bong bóng trôi lên rồi mờ dần, mỗi quả một nhịp khác nhau. */}
        {bubbles.map(({ size, top, ...edges }, i) => (
          <RiseFade
            key={i}
            style={[styles.abs, edges, { top: top + topOffset }]}
            delay={i * 650}
            duration={4200 + (i % 3) * 900}
          >
            <View style={[styles.bubble, { width: size, height: size, borderRadius: size / 2 }]} />
          </RiseFade>
        ))}
        {fishes.map((deco) => (
          <DecoEmoji key={deco.name} deco={deco} topOffset={topOffset} />
        ))}
        {seabed.map((deco, i) => (
          <DecoEmoji key={i} deco={deco} topOffset={topOffset} />
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
  abs: {
    position: 'absolute',
  },
  ray: {
    position: 'absolute',
    height: 900,
    transform: [{ rotate: '14deg' }],
  },
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
  },
});
