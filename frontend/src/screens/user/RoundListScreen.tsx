import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useLayoutEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  ImageBackground,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CircleButton, WoodLabel } from '../../components/game';
import Emoji from '../../components/Emoji';
import EmojiBadge from '../../components/EmojiBadge';
import { Animated, listEntering } from '../../components/motion';
import type { UserStackParamList, UserTabParamList } from '../../navigation/types';
import {
  getExamStatus,
  getRoundProgress,
  getRoundRank,
  getRoundScore,
  getRuntimeAttempts,
  mockExams,
  mockRounds,
  seasons,
  subscribeToStore,
  type Exam,
  type ExamAttempt,
  type SeasonRound,
} from '../../services/mock/data';
import { colors, gameFonts, spacing, typography } from '../../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<UserTabParamList, 'RoundList'>,
  NativeStackScreenProps<UserStackParamList>
>;

function notifyUser(title: string, message: string) {
  if (Platform.OS === 'web') {
    globalThis.alert?.(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export default function RoundListScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const [attempts, setAttempts] = useState<ExamAttempt[]>(getRuntimeAttempts());
  // Mặc định mở rộng Vòng 02 (đang diễn ra)
  const [expandedRoundIds, setExpandedRoundIds] = useState<Record<number, boolean>>({
    1: false,
    2: true,
    3: false,
  });
  const [refreshing, setRefreshing] = useState(false);

  // Ẩn thanh header mặc định của Tab để hiển thị trọn vẹn nền trời của Home.png
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      setAttempts([...getRuntimeAttempts()]);
      const focusRoundId = (route.params as any)?.focusRoundId;
      if (focusRoundId) {
        setExpandedRoundIds((prev) => ({
          ...prev,
          [focusRoundId]: true,
        }));
      }
      const unsub = subscribeToStore(() => {
        setAttempts([...getRuntimeAttempts()]);
      });
      return unsub;
    }, [route.params])
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

  // Bắt đầu làm bài thi chính thức (chế độ kiểm tra)
  const handleStartExam = (round: SeasonRound, exam: Exam) => {
    if (round.status === 'LOCKED') {
      notifyUser('Vòng này chưa mở', 'Vòng thi này hiện tại đang tạm khóa.');
      return;
    }

    const status = getExamStatus(round, exam, attempts);
    if (status === 'LOCKED') {
      notifyUser(
        'Chưa mở khóa',
        `Hãy hoàn thành Bài ${exam.order - 1} trước để mở khóa Bài ${exam.order} nhé!`
      );
      return;
    }

    (navigation.navigate as any)('Exam', {
      roundId: round.id,
      roundTitle: round.title,
      examId: exam.id,
      mode: 'exam',
    });
  };

  // Ôn tập lại (chỉ khả dụng trong chế độ ôn tập cho bài đã hoàn thành)
  const handlePracticeExam = (round: SeasonRound, exam: Exam) => {
    (navigation.navigate as any)('Exam', {
      roundId: round.id,
      roundTitle: round.title,
      examId: exam.id,
      mode: 'practice',
    });
  };

  // Xem kết quả bài thi đã hoàn thành
  const handleViewResult = (round: SeasonRound, exam: Exam) => {
    const attempt = attempts.find(
      (a) => a.roundId === round.id && a.examId === exam.id
    );
    if (!attempt) return;

    (navigation.navigate as any)('Result', {
      result: {
        attemptId: attempt.id,
        roundId: attempt.roundId,
        roundTitle: attempt.roundTitle,
        score: attempt.score,
        correctCount: attempt.correctCount,
        totalQuestions: attempt.totalQuestions,
        submittedAt: attempt.submittedAt,
        review: attempt.review?.map((r) => ({
          questionId: r.questionId,
          correct: r.correct,
          choiceId: r.choiceId,
        })),
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
        <View style={styles.examActionCol}>
          {isCompleted ? (
            <View style={styles.completedActionsRow}>
              <Pressable
                accessibilityRole="button"
                onPress={() => handleViewResult(round, exam)}
                style={styles.viewResultBtn}
              >
                <Text style={styles.viewResultText}>Kết quả</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => handlePracticeExam(round, exam)}
                style={styles.practiceBtn}
              >
                <Ionicons name="refresh" size={12} color="#16a34a" />
                <Text style={styles.practiceBtnText}>Ôn lại</Text>
              </Pressable>
            </View>
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
                notifyUser(
                  'Chưa mở khóa',
                  `Hãy hoàn thành Bài ${exam.order - 1} trước để mở khóa Bài ${exam.order} nhé!`
                )
              }
              style={styles.lockedBtn}
            >
              <Ionicons name="lock-closed" size={13} color="#94a3b8" />
              <Text style={styles.lockedBtnText}>Khóa</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require('../../../assets/background/Home.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <FlatList
        data={seasonRounds}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[
          styles.list,
          {
            paddingTop: insets.top > 0 ? insets.top + 8 : 16,
            paddingBottom: insets.bottom > 0 ? insets.bottom + 24 : 36,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            {/* Thanh tiêu đề trên cùng */}
            <View style={styles.topBar}>
              <View style={styles.headerTitleWrap}>
                <WoodLabel text="Vòng thi & Bài thi" fontSize={18} />
                <View style={styles.seasonTag}>
                  <Text style={styles.seasonTagText}>{activeSeason.name}</Text>
                </View>
              </View>

              <CircleButton
                icon="home"
                accessibilityLabel="Về trang chủ"
                onPress={() => navigation.navigate('Home')}
                tone="blue"
              />
            </View>

            {/* Thẻ hướng dẫn & mẹo Cú MeMe */}
            <View style={styles.tipCard}>
              <Emoji name="owl" size={44} />
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Quy tắc mở khóa vòng thi:</Text>
                <Text style={styles.tipText}>
                  Làm lần lượt từng bài: <Text style={styles.bold}>Bài 1 ➔ Bài 2 ➔ Bài 3</Text>. Hoàn thành cả 3 bài để được tính điểm vòng và nhận huy hiệu!
                </Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Emoji name="owl" size={88} />
            <Text style={styles.emptyText}>Chưa có vòng thi nào.</Text>
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
              <View style={[styles.roundCardBox, isLocked && styles.roundCardBoxLocked]}>
                {/* Header của thẻ vòng thi */}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    if (isLocked) {
                      notifyUser(
                        'Vòng này chưa mở',
                        'Vòng này hiện tại chưa mở. Hãy hoàn thành các vòng trước nhé!'
                      );
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
                      {isLocked && <Ionicons name="lock-closed" size={16} color="#94a3b8" />}
                    </View>

                    <View style={styles.roundMetaRow}>
                      <Text style={styles.meta}>
                        Tiến độ: <Text style={styles.metaHighlight}>{completedCount}/{total} bài</Text>
                      </Text>
                      {score != null && (
                        <View style={styles.roundScoreBadge}>
                          <Ionicons name="trophy" size={13} color="#ca8a04" />
                          <Text style={styles.roundScoreText}>
                            Điểm vòng: {score}/300 đ ({getRoundRank(score).label})
                          </Text>
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
              </View>
            </Animated.View>
          );
        }}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5CB4F8',
    width: '100%',
     height:"100%"
  },
  list: {
    paddingHorizontal: spacing.md,
    gap: 12,
  },
  headerSection: {
    gap: 10,
    marginBottom: 4,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleWrap: {
    gap: 4,
  },
  seasonTag: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: '#93c5fd',
  },
  seasonTagText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 11,
    color: '#1d4ed8',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fed7aa',
    padding: 12,
    boxShadow: '0px 3px 0px 0px #fb923c',
  },
  tipContent: {
    flex: 1,
    gap: 2,
  },
  tipTitle: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 13,
    color: '#9a3412',
  },
  tipText: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
  bold: {
    fontFamily: gameFonts.bodyExtraBold,
    color: '#1d4ed8',
  },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 15,
    color: '#ffffff',
  },
  roundCardBox: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    borderWidth: 2.5,
    borderColor: '#bfdbfe',
    padding: spacing.md,
    gap: 8,
    boxShadow: '0px 4px 0px 0px #60a5fa',
  },
  roundCardBoxLocked: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
    boxShadow: '0px 4px 0px 0px #94a3b8',
    opacity: 0.9,
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
    gap: 6,
  },
  title: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 15,
    color: '#0f172a',
  },
  textMuted: {
    color: '#64748b',
  },
  roundMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  meta: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 12,
    color: '#64748b',
  },
  metaHighlight: {
    fontFamily: gameFonts.bodyExtraBold,
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
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 11,
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
    marginTop: 4,
  },
  examsSectionTitle: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 12,
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
    gap: 8,
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
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 13,
  },
  examInfo: {
    flex: 1,
    gap: 2,
  },
  examTitle: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 13,
    color: '#1e293b',
  },
  examMeta: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 11,
    color: '#64748b',
  },
  statusCompletedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusCompletedText: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 11,
    color: '#16a34a',
  },
  scoreBold: {
    fontFamily: gameFonts.bodyExtraBold,
  },
  statusAvailableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusAvailableText: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 11,
    color: '#ea580c',
  },
  statusLockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusLockedText: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 11,
    color: '#64748b',
  },
  examActionCol: {
    alignItems: 'flex-end',
  },
  completedActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewResultBtn: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#93c5fd',
  },
  viewResultText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 11,
    color: '#1d4ed8',
  },
  practiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#86efac',
  },
  practiceBtnText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 10,
    color: '#16a34a',
  },
  startExamBtn: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#16a34a',
    boxShadow: '0px 3px 0px 0px #15803d',
  },
  startExamText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 12,
    color: '#ffffff',
  },
  lockedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  lockedBtnText: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 11,
    color: '#94a3b8',
  },
});
