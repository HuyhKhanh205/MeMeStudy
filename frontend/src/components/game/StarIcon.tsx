import Emoji from '../Emoji';

interface Props {
  size: number;
  /** false = sao chưa đạt (mờ) ở màn kết quả. */
  filled?: boolean;
}

/** Ngôi sao Fluent Emoji 3D; sao chưa đạt hiển thị mờ. */
export default function StarIcon({ size, filled = true }: Props) {
  return <Emoji name="star" size={size} style={filled ? undefined : { opacity: 0.3 }} />;
}
