import { useState, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { YStack } from 'tamagui';
import { colors, radius, spacing } from '../theme';

interface Props {
  children: ReactNode;
  /** Có onPress thì Card thành nút bấm được. */
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function Card({ children, onPress, disabled, style }: Props) {
  const [pressed, setPressed] = useState(false);

  return (
    <YStack
      role={onPress ? 'button' : undefined}
      onPress={disabled ? undefined : onPress}
      onPressIn={onPress && !disabled ? () => setPressed(true) : undefined}
      onPressOut={onPress && !disabled ? () => setPressed(false) : undefined}
      disabled={disabled}
      backgroundColor={pressed && onPress ? colors.primaryLight : colors.surface}
      borderRadius={radius.lg}
      borderWidth={1}
      borderColor={colors.border}
      padding={spacing.md}
      gap={spacing.sm}
      opacity={disabled ? 0.6 : 1}
      style={style as any}
    >
      {children}
    </YStack>
  );
}
