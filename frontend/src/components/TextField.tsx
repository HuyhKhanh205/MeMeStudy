import { useState } from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { Text, YStack } from 'tamagui';
import { colors, radius, spacing, typography } from '../theme';

interface Props extends TextInputProps {
  label: string;
  error?: string | null;
}

export default function TextField({ label, error, style, onFocus, onBlur, ...rest }: Props) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.danger
    : focused
      ? colors.primary
      : colors.border;

  return (
    <YStack gap={spacing.xs}>
      <Text
        fontSize={typography.label.fontSize}
        fontWeight={typography.label.fontWeight}
        lineHeight={typography.label.lineHeight}
        color={colors.text}
      >
        {label}
      </Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel={label}
        {...rest}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[
          {
            fontSize: typography.body.fontSize,
            fontWeight: typography.body.fontWeight,
            lineHeight: typography.body.lineHeight,
            minHeight: 48,
            paddingHorizontal: spacing.md,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor,
            backgroundColor: colors.surface,
            color: colors.text,
          },
          style,
        ]}
      />
      {error ? (
        <Text
          fontSize={typography.caption.fontSize}
          fontWeight={typography.caption.fontWeight}
          lineHeight={typography.caption.lineHeight}
          color={colors.danger}
        >
          {error}
        </Text>
      ) : null}
    </YStack>
  );
}
