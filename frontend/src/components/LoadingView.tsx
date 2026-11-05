import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';
import Emoji from './Emoji';
import { Float } from './motion';

export default function LoadingView({ message }: { message?: string }) {
  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={message ?? "Đang tải"}>
      {/* Cú mèo nhấp nhô thay cho vòng xoay. */}
      <Float distance={10} duration={1200}>
        <Emoji name="owl" size={72} />
      </Float>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  message: {
    ...typography.body,
    color: colors.textMuted,
  },
});
