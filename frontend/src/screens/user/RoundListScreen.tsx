import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Card from '../../components/Card';
import Emoji from '../../components/Emoji';
import EmojiBadge from '../../components/EmojiBadge';
import Screen from '../../components/Screen';
import { Animated, listEntering } from '../../components/motion';
import type { UserStackParamList, UserTabParamList } from '../../navigation/types';
import {
  getExamStatus,
  getRoundProgress,
  getRuntimeAttempts,
  mockExams,
  mockRounds,
  seasons,
  subscribeToStore,
  type Exam,
  type ExamAttempt,
  type SeasonRound,
} from '../../services/mock/data';
import { colors, radius, spacing, typography } from '../../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<UserTabParamList, 'RoundList'>,
  NativeStackScreenProps<UserStackParamList>
>;

export default function RoundListScreen({ navigation }: Props) {
  const [attempts, setAttempts] = useState<ExamAttempt[]>(getRuntimeAttempts());
  // Mặc định mở rộng Vòng 02 (đang diễn ra)
  const [expandedRoundIds, setExpandedRoundIds] = useState<Record<number, boolean>>({
    1: false,
    2: true,
    3: false,
  });
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setAttempts([...getRuntimeAttempts()]);
      const unsub = subscribeToStore(() => {
        setAttempts([...getRuntimeAttempts()]);
      });
      return unsub;
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    setAttempts([...getRuntimeAttempts()]);
    setTimeout(() => setRefreshing(false), 300);
  };

  const toggleExpand = (roundId: number) => {
    setExpandedRoundIds((prev) => ({ ...prev, [roundId]: !prev[roundId] }));
  };

  const activeSeason = seasons.find((s) => s.status === 'ACTIVE') ?? seasons[0];
  const seasonRounds = mockRounds.filter((r) => r.seasonId === activeSeason.id);

  // Xử lý khi bấm nút "Làm bài"
  const handleStartExam = (round: SeasonRound, exam: Exam) => {
    if (round.status === 'LOCKED') {
      Alert.alert('Vòng thi chưa mở', 'Vòng này hiện tại chưa mở.');
      return;
    }

    const status = getExamStatus(round, exam, attempts);
    if (status === 'LOCKED') {
      Alert.alert('Chưa mở khóa', 'Hãy hoàn thành Bài trước để mở khóa.');
      return;
    }

    (navigation.navigate as any)('Exam', {
      roundId: round.id,
      roundTitle: round.title,
      examId: exam.id,
      mode: 'exam',
    });
  };

  // Xem kết quả bài đã thi
  const handleViewResult = (round: SeasonRound, exam: Exam) => {
    const attempt = attempts.find(
      (a) => a.roundId === round.id && a.examId === exam.id
    );
    if (!attempt) return;

    navigation.navigate('Result', {
      result: {
        attemptId: attempt.id,
        roundId: attempt.roundId,
        roundTitle: attempt.roundTitle,
        score: attempt.score,
        correctCount: attempt.correctCount,
        totalQuestions: attempt.totalQuestions,
        submittedAt: attempt.submittedAt,
        review: attempt.review?.map((r) => ({ questionId: r.questionId, correct: r.correct })),
      },
      durationSeconds: attempt.durationSeconds,
    });
  };

  const renderExamItem = (round: SeasonRound, exam: Exam) => {
    const status = getExamStatus(round, exam, attempts);
    const isCompleted = status === 'COMPLETED';
    const isAvailable = status === 'AVAILABLE';
    const isLocked = status === 'LOCKED';

    const attempt = attempts.find(
      (a) => a.roundId === round.id && a.examId === exam.id
    );

    return (
      <View key={exam.id} style={styles.examCard}>
        <View style={styles.examLeft}>
          <View
            style={[
              styles.examOrderBadge,
              isCompleted && styles.examOrderGreen,
              isAvailable && styles.examOrderOrange,
              isLocked && styles.examOrderGray,
            ]}
          >
            <Text style={styles.examOrderText}>{exam.order}</Text>
          </View>

          <View style={styles.examInfo}>
            <Text style={[styles.examTitle, isLocked && styles.textMuted]}>
              {exam.title}
            </Text>
            <Text style={styles.examMeta}>
              {exam.questionCount} câu · {exam.durationMinutes} phút
            </Text>

            {/* Trạng thái bài */}
            {isCompleted && (
              <View style={styles.statusCompletedBadge}>
                <Ionicons name="checkmark-circle" size={13} color="#16a34a" />
                <Text style={styles.statusCompletedText}>
                  Đã hoàn thành · <Text style={styles.scoreBold}>{attempt?.score ?? 100}/100 đ</Text>
                </Text>
              </View>
            )}

            {isAvailable && (
              <View style={styles.statusAvailableBadge}>
                <Ionicons name="sparkles" size={13} color="#ea580c" />
                <Text style={styles.statusAvailableText}>Sẵn sàng làm</Text>
              </View>
            )}

            {isLocked && (
              <View style={styles.statusLockedBadge}>
                <Ionicons name="lock-closed" size={13} color="#64748b" />
                <Text style={styles.statusLockedText}>Khóa</Text>
              </View>
            )}
          </View>
        </View>

        {/* Nút hành động */}
        <View style={styles.examAction}>
          {isCompleted ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => handleViewResult(round, exam)}
              style={styles.viewResultBtn}
            >
              <Text style={styles.viewResultText}>Kết quả</Text>
            </Pressable>
          ) : isAvailable ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => handleStartExam(round, exam)}
              style={styles.startExamBtn}
            >
              <Text style={styles.startExamText}>Làm bài</Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                Alert.alert('Chưa mở khóa', 'Hãy hoàn thành Bài trước để mở khóa.')
              }
              style={styles.lockedBtn}
            >
              <Ionicons name="lock-closed" size={14} color="#94a3b8" />
              <Text style={styles.lockedBtnText}>Khóa</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  return (
    <Screen contentStyle={styles.noPadding}>
      <FlatList
        data={seasonRounds}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={styles.seasonBanner}>
            <View style={styles.seasonTitleRow}>
              <Text style={styles.seasonTitle}>{activeSeason.name}</Text>
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>ĐANG DIỄN RA</Text>
              </View>
            </View>
            <Text style={styles.seasonDesc}>
              Thời gian: {activeSeason.startDate} – {activeSeason.endDate}
            </Text>
            <Text style={styles.seasonMascotTip}>
              Hoàn thành lần lượt từng bài thi (1 → 2 → 3) để mở khóa trọn vẹn vòng thi!
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Emoji name="owl" size={88} />
            <Text style={styles.muted}>Chưa có vòng thi nào.</Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const { completedCount, total, score, isCompleted } = getRoundProgress(
            item.id,
            attempts
          );
          const isExpanded = !!expandedRoundIds[item.id];
          const roundExams = mockExams.filter((e) => e.roundId === item.id);
          const isLocked = item.status === 'LOCKED';

          return (
            <Animated.View entering={listEntering(index)}>
              <Card style={[styles.roundContainer, isLocked && styles.roundCardLocked]}>
                {/* Header của thẻ vòng thi */}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    if (isLocked) {
                      Alert.alert('Vòng thi chưa mở', 'Vòng này chưa mở.');
                      return;
                    }
                    toggleExpand(item.id);
                  }}
                  style={styles.roundHeaderPress}
                >
                  <EmojiBadge
                    name={isCompleted ? 'trophy' : isLocked ? 'locked' : 'books'}
                    tone={isCompleted ? 'cream' : isLocked ? 'lilac' : 'mint'}
                    size={46}
                  />

                  <View style={styles.roundHeadInfo}>
                    <View style={styles.roundTitleRow}>
                      <Text style={[styles.title, isLocked && styles.textMuted]}>
                        {item.title}
                      </Text>
                    </View>

                    <View style={styles.roundMetaRow}>
                      <Text style={styles.meta}>
                        Tiến độ: <Text style={styles.metaHighlight}>{completedCount}/{total} bài</Text>
                      </Text>
                      {score != null && (
                        <View style={styles.roundScoreBadge}>
                          <Ionicons name="trophy" size={13} color="#eab308" />
                          <Text style={styles.roundScoreText}>Điểm vòng: {score}/100</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.expandArrow}>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={isLocked ? '#94a3b8' : '#334155'}
                    />
                  </View>
                </Pressable>

                {/* Danh sách 3 bài thi (khi mở rộng) */}
                {isExpanded && !isLocked && (
                  <View style={styles.examsContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.examsSectionTitle}>
                      Danh sách bài thi ({roundExams.length} bài):
                    </Text>
                    {roundExams.map((exam) => renderExamItem(item, exam))}
                  </View>
                )}
              </Card>
            </Animated.View>
          );
        }}
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
    paddingBottom: 40,
  },
  seasonBanner: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#93c5fd',
    padding: spacing.md,
    gap: 6,
    boxShadow: '0px 3px 0px 0px #3b82f6',
    marginBottom: 4,
  },
  seasonTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seasonTitle: {
    ...typography.heading,
    fontSize: 18,
    color: '#1d4ed8',
  },
  activePill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16a34a',
  },
  seasonDesc: {
    ...typography.caption,
    color: colors.textMuted,
  },
  seasonMascotTip: {
    ...typography.caption,
    fontWeight: '600',
    color: '#0284c7',
    marginTop: 2,
  },
  muted: {
    ...typography.body,
    color: colors.textMuted,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  roundContainer: {
    padding: spacing.md,
    borderRadius: 22,
    gap: spacing.sm,
  },
  roundCardLocked: {
    backgroundColor: '#f8fafc',
    opacity: 0.85,
  },
  roundHeaderPress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roundHeadInfo: {
    flex: 1,
    gap: 4,
  },
  roundTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    ...typography.heading,
    fontSize: 16,
    color: colors.text,
  },
  textMuted: {
    color: colors.textMuted,
  },
  roundMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  meta: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textMuted,
  },
  metaHighlight: {
    fontWeight: '700',
    color: '#1d4ed8',
  },
  roundScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef9c3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fde047',
  },
  roundScoreText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '800',
    color: '#854d0e',
  },
  expandArrow: {
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
  examsContainer: {
    gap: 10,
    marginTop: 6,
  },
  examsSectionTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: '#475569',
  },
  examCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    padding: 10,
    gap: 10,
  },
  examLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  examOrderBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  examOrderGreen: {
    backgroundColor: '#16a34a',
  },
  examOrderOrange: {
    backgroundColor: '#ea580c',
  },
  examOrderGray: {
    backgroundColor: '#94a3b8',
  },
  examOrderText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
  examInfo: {
    flex: 1,
    gap: 2,
  },
  examTitle: {
    ...typography.heading,
    fontSize: 13,
    color: colors.text,
  },
  examMeta: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },
  statusCompletedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusCompletedText: {
    ...typography.caption,
    fontSize: 11,
    color: '#16a34a',
  },
  scoreBold: {
    fontWeight: '800',
  },
  statusAvailableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusAvailableText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: '#ea580c',
  },
  statusLockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusLockedText: {
    ...typography.caption,
    fontSize: 11,
    color: '#64748b',
  },
  examAction: {},
  viewResultBtn: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#93c5fd',
  },
  viewResultText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  startExamBtn: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#16a34a',
    boxShadow: '0px 2px 0px 0px #15803d',
  },
  startExamText: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  lockedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  lockedBtnText: {
    ...typography.caption,
    fontSize: 11,
    color: '#94a3b8',
  },
});
