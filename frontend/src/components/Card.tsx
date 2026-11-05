import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme';

interface Props {
  children: ReactNode;
  /** Có onPress thì Card thành nút bấm được. */
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function Card({ children, onPress, disabled, style }: Props) {
  if (!onPress) {
    return <View style={[styles.card, style]}>{children}</View>;
  }
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, disabled && styles.disabled, style]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  pressed: {
    backgroundColor: colors.primaryLight,
  },
  disabled: {
    opacity: 0.6,
  },
});
