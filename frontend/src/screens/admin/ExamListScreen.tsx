import { FlatList, StyleSheet, Text } from 'react-native';
import Card from '../../components/Card';
import ErrorView from '../../components/ErrorView';
import LoadingView from '../../components/LoadingView';
import Screen from '../../components/Screen';
import { queryErrorMessage, useGetRoundsQuery } from '../../store/api';
import { colors, spacing, typography } from '../../theme';

/** Danh sách đề thi (vòng thi) cho admin. */
export default function ExamListScreen() {
  const { data: rounds, error, isLoading, refetch } = useGetRoundsQuery();

  if (isLoading) return <LoadingView />;
  if (!rounds) return <ErrorView message={queryErrorMessage(error) ?? ''} onRetry={refetch} />;

  return (
    <Screen contentStyle={styles.noPadding}>
      <FlatList
        data={rounds}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.muted}>Chưa có đề thi.</Text>}
        renderItem={({ item }) => (
          <Card>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.muted}>
              {item.questionCount} câu · {item.durationMinutes} phút ·{' '}
              {item.isOpen ? 'Đang mở' : 'Đã đóng'}
            </Text>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  noPadding: {
    padding: 0,
  },
  list: {
    padding: spacing.md,
    gap: spacing.md,
  },
  title: {
    ...typography.heading,
    color: colors.text,
  },
  muted: {
    ...typography.body,
    color: colors.textMuted,
  },
});
