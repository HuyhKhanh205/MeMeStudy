import { View } from 'react-native';

interface Props {
  width: number;
  height: number;
  left: number;
  /** Khoảng cách mép dưới hình elip tới mép dưới màn hình (âm = tràn ra ngoài). */
  bottom: number;
  color: string;
}

/**
 * Hình elip (đồi cát/đồi cỏ) vẽ bằng View: một hình tròn đường kính `width`
 * rồi ép dọc bằng scaleY để thành elip `width × height`.
 */
export default function Ellipse({ width, height, left, bottom, color }: Props) {
  // scaleY co quanh tâm → bù phần chênh để mép dưới nằm đúng `bottom`.
  const offset = (width - height) / 2;
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left,
        bottom: bottom - offset,
        width,
        height: width,
        borderRadius: width / 2,
        backgroundColor: color,
        transform: [{ scaleY: height / width }],
      }}
    />
  );
}
