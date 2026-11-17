import { FlatList, StyleSheet, View } from 'react-native';
import { Text } from 'tamagui';
import Card from '../../components/Card';
import ErrorView from '../../components/ErrorView';
import LoadingView from '../../components/LoadingView';
import Screen from '../../components/Screen';
import { useResponsive } from '../../hooks/useResponsive';
import { queryErrorMessage, useGetQuestionsQuery } from '../../store/api';
import { colors, spacing, typography } from '../../theme';

export default function QuestionListScreen() {
  const { data: questions, error, isLoading, refetch } = useGetQuestionsQuery();
  const { width, columns } = useResponsive();

  if (isLoading) return <LoadingView />;
  if (!questions) return <ErrorView message={queryErrorMessage(error) ?? ''} onRetry={refetch} />;

  const gap = spacing.md;
  const maxItemWidth =
    columns > 1
      ? Math.floor((width - spacing.md * 2 - gap * (columns - 1)) / columns)
      : undefined;

  return (
    <Screen contentStyle={styles.noPadding}>
      <FlatList
        key={`questions-grid-${columns}`}
        numColumns={columns}
        data={questions}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        columnWrapperStyle={columns > 1 ? styles.columnWrapper : undefined}
        ListEmptyComponent={
          <Text
            fontSize={typography.body.fontSize}
            fontWeight={typography.body.fontWeight}
            lineHeight={typography.body.lineHeight}
            color={colors.textMuted}
          >
            Chưa có câu hỏi.
          </Text>
        }
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.itemWrap,
              maxItemWidth != null && { maxWidth: maxItemWidth },
            ]}
          >
            <Card style={styles.cardFill}>
              <Text
                fontSize={typography.label.fontSize}
                fontWeight={typography.label.fontWeight}
                lineHeight={typography.label.lineHeight}
                color={colors.text}
              >
                {index + 1}. {item.content}
              </Text>
              {item.choices.map((c, i) => {
                const isCorrect = c.id === item.correctChoiceId;
                return (
                  <Text
                    key={c.id}
                    fontSize={typography.body.fontSize}
                    fontWeight={isCorrect ? '600' : typography.body.fontWeight}
                    lineHeight={typography.body.lineHeight}
                    color={isCorrect ? colors.success : colors.textMuted}
                  >
                    {String.fromCharCode(65 + i)}. {c.content}
                  </Text>
                );
              })}
            </Card>
          </View>
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
  columnWrapper: {
    gap: spacing.md,
  },
  itemWrap: {
    flex: 1,
  },
  cardFill: {
    flex: 1,
  },
});
