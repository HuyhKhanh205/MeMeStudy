import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';
import Button from './Button';

interface Props {
  message: string;
  onRetry?: () => void;
}

export default function ErrorView({ message, onRetry }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đã xảy ra lỗi</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? <Button title="Thử lại" variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.heading,
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
  },
});
