import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { gameColors, gameFonts, gameGradients, gameShadows } from '../../theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Animated, Bounce, usePressScale } from '../motion';

/**
 * Figma: Game/AnswerButton.
 * - `true` / `false`: biến thể Kind=True (xanh lá, dấu ✓) và Kind=False (đỏ, dấu ✕) — dùng cho câu 2 đáp án.
 * - `choice`: câu nhiều đáp án, cùng hình khối nhưng nền xanh dương và chữ cái A/B/C/D.
 */
export type AnswerKind = 'true' | 'false' | 'choice';

interface Props {
  kind: AnswerKind;
  label: string;
  /** Chữ cái hiển thị trong vòng tròn khi kind = 'choice'. */
  letter?: string;
  selected: boolean;
  /** Có đáp án khác đang được chọn → làm mờ nút này. */
  dimmed: boolean;
  disabled?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

const look = {
  true: { colors: gameGradients.greenAnswer, shadow: gameShadows.greenAnswer, ink: '#1e8a52' },
  false: { colors: gameGradients.redAnswer, shadow: gameShadows.redAnswer, ink: '#b02a40' },
  choice: { colors: gameGradients.blueCircle, shadow: gameShadows.blueAnswer, ink: gameColors.navy },
} as const;

export default function AnswerButton({
  kind,
  label,
  letter,
  selected,
  dimmed,
  disabled,
  onPress,
  style,
}: Props) {
  const { colors, shadow, ink } = look[kind];
  const press = usePressScale(0.96);
  return (
    // Bounce: nảy một nhịp khi vừa được chọn; lớp trong co lại khi nhấn giữ.
    <Bounce trigger={selected} scale={1.06} style={style}>
      <Animated.View style={press.style}>
        <Pressable
          accessibilityRole="radio"
          accessibilityLabel={label}
          aria-checked={selected}
          aria-disabled={disabled}
          disabled={disabled}
          onPress={onPress}
          onPressIn={press.onPressIn}
          onPressOut={press.onPressOut}
          style={[styles.wrap, { boxShadow: shadow }, dimmed && styles.dimmed]}
        >
          <LinearGradient colors={colors} style={[styles.button, selected && styles.selected]}>
            <View style={styles.badge}>
              {kind === 'true' ? <Ionicons name="checkmark-sharp" size={28} color="#22A35F" /> : null}
              {kind === 'false' ? <Ionicons name="close-sharp" size={28} color="#E8475E" /> : null}
              {kind === 'choice' ? <Text style={[styles.letter, { color: ink }]}>{letter}</Text> : null}
            </View>
            <Text style={[styles.label, kind === 'choice' && styles.choiceLabel]} numberOfLines={2}>
              {label}
            </Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </Bounce>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 20,
  },
  dimmed: {
    opacity: 0.55,
  },
  button: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 20,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  selected: {
    borderColor: '#ffffff',
    boxShadow: '0px 0px 0px 3px rgba(255,201,60,0.9)',
  },
  badge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontFamily: gameFonts.display,
    fontSize: 22,
  },
  label: {
    flex: 1,
    fontFamily: gameFonts.display,
    fontSize: 24,
    color: '#ffffff',
  },
  choiceLabel: {
    fontSize: 19,
    lineHeight: 24,
  },
});
