import Ionicons from '@expo/vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'tamagui';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ErrorView from '../../components/ErrorView';
import LoadingView from '../../components/LoadingView';
import Screen from '../../components/Screen';
import { useResponsive } from '../../hooks/useResponsive';
import type { AdminStackParamList } from '../../navigation/types';
import {
  queryErrorMessage,
  useDeleteExamMutation,
  useGetExamsQuery,
  useGetRoundsQuery,
} from '../../store/api';
import { colors, spacing, typography } from '../../theme';
import type { ExamSummary } from '../../types';
import { confirm, showAlert } from '../../utils/confirm';

type Props = NativeStackScreenProps<AdminStackParamList, 'ExamList'>;

/** Danh sách đề thi cho giáo viên/admin: đề giáo viên tải lên (xoá được) + các vòng thi. */
export default function ExamListScreen({ navigation }: Props) {
  const { data: rounds, error, isLoading, refetch } = useGetRoundsQuery();
  const examsQuery = useGetExamsQuery();
  const [deleteExam, deleteState] = useDeleteExamMutation();
  const { width, columns } = useResponsive();

  if (isLoading) return <LoadingView />;
  if (!rounds) return <ErrorView message={queryErrorMessage(error) ?? ''} onRetry={refetch} />;

  const uploaded = (examsQuery.data ?? []).filter((e) => e.source === 'TEACHER');

  const gap = spacing.md;
  const maxItemWidth =
    columns > 1 ? Math.floor((width - spacing.md * 2 - gap * (columns - 1)) / columns) : undefined;

  const removeExam = async (exam: ExamSummary) => {
    const ok = await confirm(
      'Xoá đề này?',
      `"${exam.title}" sẽ bị xoá cùng câu hỏi và bài làm của học sinh. Không hoàn tác được.`,
      { confirmText: 'Xoá đề', destructive: true },
    );
    if (!ok) return;
    const result = await deleteExam(exam.id);
    if ('error' in result && result.error) {
      void showAlert('Không xoá được', queryErrorMessage(result.error) ?? 'Có lỗi xảy ra.');
    }
  };

  const header = (
    <View style={styles.header}>
      <Button title="Tải đề lên (Gemini AI)" onPress={() => navigation.navigate('ExamImport')} />
      <Text
        fontSize={typography.heading.fontSize}
        fontWeight={typography.heading.fontWeight}
        color={colors.text}
      >
        Đề giáo viên tải lên
      </Text>
      {examsQuery.isLoading ? (
        <Text color={colors.textMuted}>Đang tải…</Text>
      ) : examsQuery.error ? (
        <Text color={colors.danger}>{queryErrorMessage(examsQuery.error)}</Text>
      ) : uploaded.length === 0 ? (
        <Text color={colors.textMuted}>
          Chưa có đề nào. Bấm “Tải đề lên” để tạo đề từ file PDF/Word.
        </Text>
      ) : (
        uploaded.map((exam) => (
          <Card key={exam.id}>
            <View style={styles.examRow}>
              <View style={styles.flex}>
                <Text fontSize={typography.body.fontSize} fontWeight="700" color={colors.text}>
                  {exam.title}
                </Text>
                <Text fontSize={13} color={colors.textMuted}>
                  {exam.questionCount} câu · {exam.durationMinutes} phút
                  {exam.deadline ? ` · Hạn ${exam.deadline}` : ''} · {exam.roundTitle}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Xoá đề ${exam.title}`}
                hitSlop={8}
                disabled={deleteState.isLoading}
                onPress={() => void removeExam(exam)}
              >
                <Ionicons name="trash-outline" size={22} color={colors.danger} />
              </Pressable>
            </View>
          </Card>
        ))
      )}
      <Text
        fontSize={typography.heading.fontSize}
        fontWeight={typography.heading.fontWeight}
        color={colors.text}
      >
        Vòng thi
      </Text>
    </View>
  );

  return (
    <Screen contentStyle={styles.noPadding}>
      <FlatList
        key={`exams-grid-${columns}`}
        numColumns={columns}
        data={rounds}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        columnWrapperStyle={columns > 1 ? styles.columnWrapper : undefined}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <Text
            fontSize={typography.body.fontSize}
            fontWeight={typography.body.fontWeight}
            color={colors.textMuted}
          >
            Chưa có đề thi.
          </Text>
        }
        renderItem={({ item }) => (
          // flex: 1 chỉ dùng khi chia cột; 1 cột mà để flex: 1 thì thẻ bị co dẹt trên web
          <View
            style={[
              columns > 1 && styles.itemWrap,
              maxItemWidth != null && { maxWidth: maxItemWidth },
            ]}
          >
            <Card style={columns > 1 ? styles.cardFill : undefined}>
              <Text
                fontSize={typography.heading.fontSize}
                fontWeight={typography.heading.fontWeight}
                color={colors.text}
              >
                {item.title}
              </Text>
              <Text
                fontSize={typography.body.fontSize}
                fontWeight={typography.body.fontWeight}
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
  header: {
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
  examRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
});
