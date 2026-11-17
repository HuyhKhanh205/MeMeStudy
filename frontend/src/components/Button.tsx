import type { StyleProp, ViewStyle } from 'react-native';
import { Spinner, Text, XStack } from 'tamagui';
import { colors, radius, spacing, typography } from '../theme';
import { Animated, usePressScale } from './motion';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: Props) {
  const inactive = disabled || loading;
  const press = usePressScale(0.97);
  const textColor =
    variant === 'primary' || variant === 'danger' ? colors.white : colors.primary;

  const bgByVariant: Record<Variant, string> = {
    primary: colors.primary,
    secondary: colors.primaryLight,
    danger: colors.danger,
    ghost: 'transparent',
  };

  return (
    <Animated.View style={press.style}>
      <XStack
        role="button"
        aria-disabled={inactive}
        aria-busy={loading}
        onPress={inactive ? undefined : onPress}
        onPressIn={inactive ? undefined : press.onPressIn}
        onPressOut={inactive ? undefined : press.onPressOut}
        disabled={inactive}
        minHeight={48}
        paddingHorizontal={spacing.md}
        borderRadius={radius.md}
        alignItems="center"
        justifyContent="center"
        backgroundColor={bgByVariant[variant]}
        borderWidth={variant === 'secondary' ? 1 : 0}
        borderColor={variant === 'secondary' ? colors.primary : 'transparent'}
        opacity={inactive ? 0.5 : 1}
        style={style as any}
      >
        {loading ? (
          <Spinner color={textColor} />
        ) : (
          <Text
            color={textColor}
            fontSize={16}
            fontWeight={typography.label.fontWeight}
            lineHeight={typography.label.lineHeight}
          >
            {title}
          </Text>
        )}
      </XStack>
    </Animated.View>
  );
}
