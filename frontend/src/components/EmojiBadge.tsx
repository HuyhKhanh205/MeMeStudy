import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { gameColors } from '../theme';
import Emoji from './Emoji';
import type { EmojiName } from './emojiAssets';

/** Màu nền pastel lấy từ bảng màu Figma (game/peach, mint, lilac, sky-light, cream). */
const tones = {
  peach: gameColors.peach,
  mint: gameColors.mint,
  lilac: gameColors.lilac,
  sky: gameColors.skyLight,
  cream: gameColors.cream,
  rose: gameColors.reviewFill,
} as const;

export type BadgeTone = keyof typeof tones;

interface Props {
  name: EmojiName;
  tone: BadgeTone;
  /** Đường kính vòng tròn nền; emoji chiếm ~70%. */
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/** Emoji 3D đặt trên nền tròn pastel — dùng cho thẻ, danh sách, thống kê. */
export default function EmojiBadge({ name, tone, size = 56, style }: Props) {
  return (
    <View
      style={[
        styles.badge,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: tones[tone] },
        style,
      ]}
    >
      <Emoji name={name} size={Math.round(size * 0.7)} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
