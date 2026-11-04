import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from './PrimaryButton';
import { colors, spacing } from '../utils/constants';

interface Props {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

/** Shows a spinner while loading, or an error with a retry button. */
export default function StateView({ loading, error, onRetry }: Props) {
  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <>
          <Text style={styles.error}>{error}</Text>
          <PrimaryButton title="Thử lại" onPress={onRetry} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  error: {
    color: colors.danger,
    textAlign: 'center',
  },
});
