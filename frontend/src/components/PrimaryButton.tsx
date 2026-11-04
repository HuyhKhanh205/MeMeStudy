import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../utils/constants';

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export default function PrimaryButton({ title, onPress, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.button, (pressed || disabled) && styles.pressed]}
    >
      <Text style={styles.title}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderBottomColor: colors.primaryDark,
    borderBottomWidth: 4,
    borderRadius: 16,
    paddingVertical: spacing.md - 2,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  title: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
