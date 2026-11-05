import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { Animated, listEntering } from '../../components/motion';
import EmojiBadge from '../../components/EmojiBadge';
import Screen from '../../components/Screen';
import { useAuth } from '../../hooks/useAuth';
import type { AdminStackParamList } from '../../navigation/types';
import { queryErrorMessage, useGetQuestionsQuery, useGetRoundsQuery } from '../../store/api';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AdminStackParamList, 'Dashboard'>;

export default function DashboardScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  // Dùng chung cache với QuestionList/ExamList: vào màn con không phải tải lại.
  const questionsQuery = useGetQuestionsQuery();
  const roundsQuery = useGetRoundsQuery();

  const stats =
    questionsQuery.data && roundsQuery.data
      ? {
          questions: questionsQuery.data.length,
          rounds: roundsQuery.data.length,
          openRounds: roundsQuery.data.filter((r) => r.isOpen).length,
        }
      : null;
  const error = queryErrorMessage(questionsQuery.error) ?? queryErrorMessage(roundsQuery.error);

  return (
    <Screen scroll>
      <Text style={styles.greeting}>Xin chào, {user?.fullName}</Text>

      <Animated.View entering={listEntering(0)}>
        <View style={styles.statsRow}>
          <Card style={styles.stat}>
            <EmojiBadge name="redQuestionMark" tone="rose" size={48} />
            <Text style={styles.statValue}>{stats?.questions ?? '–'}</Text>
            <Text style={styles.muted}>Câu hỏi</Text>
          </Card>
          <Card style={styles.stat}>
            <EmojiBadge name="clipboard" tone="sky" size={48} />
            <Text style={styles.statValue}>{stats?.rounds ?? '–'}</Text>
            <Text style={styles.muted}>Vòng thi</Text>
          </Card>
          <Card style={styles.stat}>
            <EmojiBadge name="hourglass" tone="mint" size={48} />
            <Text style={styles.statValue}>{stats?.openRounds ?? '–'}</Text>
            <Text style={styles.muted}>Đang mở</Text>
          </Card>
        </View>
      </Animated.View>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Animated.View entering={listEntering(1)}>
        <Button title="Quản lý câu hỏi" onPress={() => navigation.navigate('QuestionList')} />
      </Animated.View>
      <Animated.View entering={listEntering(2)}>
        <Button title="Quản lý đề thi" onPress={() => navigation.navigate('ExamList')} />
      </Animated.View>
      <Animated.View entering={listEntering(3)}>
        <Button title="Đăng xuất" variant="secondary" onPress={logout} />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  greeting: {
    ...typography.heading,
    color: colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.title,
    color: colors.primary,
  },
  muted: {
    ...typography.caption,
    color: colors.textMuted,
  },
  error: {
    ...typography.body,
    color: colors.danger,
  },
});
