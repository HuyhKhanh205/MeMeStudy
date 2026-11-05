import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../utils/constants';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="person-circle" size={96} color={colors.secondary} />
      <Text style={styles.name}>Học viên MeMeStudy</Text>
      <Text style={styles.muted}>Đăng nhập và thống kê XP sẽ được bổ sung sau.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  muted: {
    color: colors.textMuted,
    textAlign: 'center',
  },
});
