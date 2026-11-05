import { Image } from 'expo-image';
import type { ImageStyle, StyleProp } from 'react-native';
import { emojiAssets, type EmojiName } from './emojiAssets';

interface Props {
  name: EmojiName;
  size: number;
  /** Lật ngang (ví dụ cá bơi theo hướng ngược lại). */
  flip?: boolean;
  style?: StyleProp<ImageStyle>;
}

/** Hình minh hoạ Fluent Emoji 3D (PNG, hiển thị bằng expo-image). */
export default function Emoji({ name, size, flip, style }: Props) {
  return (
    <Image
      source={emojiAssets[name]}
      contentFit="contain"
      accessible={false}
      style={[{ width: size, height: size }, flip && { transform: [{ scaleX: -1 }] }, style]}
    />
  );
}
