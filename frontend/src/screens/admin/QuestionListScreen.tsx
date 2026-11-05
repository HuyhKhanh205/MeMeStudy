import { FlatList, StyleSheet, Text } from 'react-native';
import Card from '../../components/Card';
import ErrorView from '../../components/ErrorView';
import LoadingView from '../../components/LoadingView';
import Screen from '../../components/Screen';
import { queryErrorMessage, useGetQuestionsQuery } from '../../store/api';
import { colors, spacing, typography } from '../../theme';

export default function QuestionListScreen() {
  const { data: questions, error, isLoading, refetch } = useGetQuestionsQuery();

  if (isLoading) return <LoadingView />;
  if (!questions) return <ErrorView message={queryErrorMessage(error) ?? ''} onRetry={refetch} />;

  return (
    <Screen contentStyle={styles.noPadding}>
      <FlatList
        data={questions}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.muted}>Chưa có câu hỏi.</Text>}
        renderItem={({ item, index }) => (
          <Card>
            <Text style={styles.title}>
              {index + 1}. {item.content}
            </Text>
            {item.choices.map((c, i) => (
              <Text
                key={c.id}
                style={[styles.choice, c.id === item.correctChoiceId && styles.correct]}
              >
                {String.fromCharCode(65 + i)}. {c.content}
              </Text>
            ))}
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
    ...typography.label,
    color: colors.text,
  },
  choice: {
    ...typography.body,
    color: colors.textMuted,
  },
  correct: {
    color: colors.success,
    fontWeight: '600',
  },
  muted: {
    ...typography.body,
    color: colors.textMuted,
  },
});
