import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Card from '../../components/Card';
import { Animated, listEntering } from '../../components/motion';
import Emoji from '../../components/Emoji';
import EmojiBadge from '../../components/EmojiBadge';
import ErrorView from '../../components/ErrorView';
import LoadingView from '../../components/LoadingView';
import Screen from '../../components/Screen';
import { queryErrorMessage, useGetMyResultsQuery } from '../../store/api';
import { colors, spacing, typography } from '../../theme';

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export default function HistoryScreen() {
  // Nộp bài (submitAttempt) invalidates tag 'Result' → danh sách này tự tải lại, không cần useFocusEffect.
  const { data: results, error, isLoading, isFetching, refetch } = useGetMyResultsQuery();

  if (isLoading) return <LoadingView />;
  if (!results) return <ErrorView message={queryErrorMessage(error) ?? ''} onRetry={refetch} />;

  return (
    <Screen contentStyle={styles.noPadding}>
      <FlatList
        data={results}
        refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} />}
        keyExtractor={(item) => String(item.attemptId)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Emoji name="owl" size={88} />
            <Text style={styles.muted}>Bạn chưa nộp bài thi nào.</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={listEntering(index)}>
            <Card>
              <View style={styles.row}>
                <EmojiBadge
                  name={item.score >= 8 ? 'trophy' : item.score >= 5 ? 'partyPopper' : 'memo'}
                  tone={item.score >= 8 ? 'cream' : item.score >= 5 ? 'peach' : 'sky'}
                  size={48}
                />
                <Text style={styles.title}>{item.roundTitle}</Text>
                <Text style={styles.score}>{item.score}</Text>
              </View>
              <Text style={styles.muted}>
                Đúng {item.correctCount}/{item.totalQuestions} · {formatDateTime(item.submittedAt)}
              </Text>
            </Card>
          </Animated.View>
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
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.heading,
    color: colors.text,
    flex: 1,
  },
  score: {
    ...typography.title,
    color: colors.primary,
  },
  muted: {
    ...typography.body,
    color: colors.textMuted,
  },
});
