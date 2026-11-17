import { Text, YStack } from 'tamagui';
import { colors, spacing, typography } from '../theme';
import Emoji from './Emoji';
import { Float } from './motion';

export default function LoadingView({ message }: { message?: string }) {
  return (
    <YStack
      flex={1}
      alignItems="center"
      justifyContent="center"
      gap={spacing.md}
      padding={spacing.lg}
      backgroundColor={colors.background}
      role="progressbar"
      aria-label={message ?? 'Đang tải'}
    >
      {/* Cú mèo nhấp nhô thay cho vòng xoay. */}
      <Float distance={10} duration={1200}>
        <Emoji name="owl" size={72} />
      </Float>
      {message ? (
        <Text
          fontSize={typography.body.fontSize}
          fontWeight={typography.body.fontWeight}
          lineHeight={typography.body.lineHeight}
          color={colors.textMuted}
        >
          {message}
        </Text>
      ) : null}
    </YStack>
  );
}
