import { Text, YStack } from 'tamagui';
import { colors, spacing, typography } from '../theme';
import Button from './Button';

interface Props {
  message: string;
  onRetry?: () => void;
}

export default function ErrorView({ message, onRetry }: Props) {
  return (
    <YStack
      flex={1}
      justifyContent="center"
      gap={spacing.md}
      padding={spacing.lg}
      backgroundColor={colors.background}
    >
      <Text
        fontSize={typography.heading.fontSize}
        fontWeight={typography.heading.fontWeight}
        color={colors.text}
        textAlign="center"
      >
        Đã xảy ra lỗi
      </Text>
      <Text
        fontSize={typography.body.fontSize}
        fontWeight={typography.body.fontWeight}
        color={colors.danger}
        textAlign="center"
      >
        {message}
      </Text>
      {onRetry ? <Button title="Thử lại" variant="secondary" onPress={onRetry} /> : null}
    </YStack>
  );
}
