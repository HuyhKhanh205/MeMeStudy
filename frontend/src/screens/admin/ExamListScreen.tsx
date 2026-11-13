import { FlatList, StyleSheet, View } from 'react-native';
import { Text } from 'tamagui';
import Card from '../../components/Card';
import ErrorView from '../../components/ErrorView';
import LoadingView from '../../components/LoadingView';
import Screen from '../../components/Screen';
import { useResponsive } from '../../hooks/useResponsive';
import { queryErrorMessage, useGetRoundsQuery } from '../../store/api';
import { colors, spacing, typography } from '../../theme';

/** Danh sách đề thi (vòng thi) cho admin. */
export default function ExamListScreen() {
  const { data: rounds, error, isLoading, refetch } = useGetRoundsQuery();
  const { width, columns } = useResponsive();

  if (isLoading) return <LoadingView />;
  if (!rounds) return <ErrorView message={queryErrorMessage(error) ?? ''} onRetry={refetch} />;

  const gap = spacing.md;
  const maxItemWidth =
    columns > 1
      ? Math.floor((width - spacing.md * 2 - gap * (columns - 1)) / columns)
      : undefined;

  return (
    <Screen contentStyle={styles.noPadding}>
      <FlatList
        key={`exams-grid-${columns}`}
        numColumns={columns}
        data={rounds}
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
            Chưa có đề thi.
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.itemWrap,
              maxItemWidth != null && { maxWidth: maxItemWidth },
            ]}
          >
            <Card style={styles.cardFill}>
              <Text
                fontSize={typography.heading.fontSize}
                fontWeight={typography.heading.fontWeight}
                lineHeight={typography.heading.lineHeight}
                color={colors.text}
              >
                {item.title}
              </Text>
              <Text
                fontSize={typography.body.fontSize}
                fontWeight={typography.body.fontWeight}
                lineHeight={typography.body.lineHeight}
                color={colors.textMuted}
              >
                {item.questionCount} câu · {item.durationMinutes} phút ·{' '}
                {item.isOpen ? 'Đang mở' : 'Đã đóng'}
              </Text>
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
