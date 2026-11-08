import Ionicons from '@expo/vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CircleButton,
  GameBoard,
  GameButton,
  StarIcon,
  SunnyBackground,
  WoodLabel,
} from '../../components/game';
import Emoji from '../../components/Emoji';
import { CountUp, Float, PopIn } from '../../components/motion';
import { formatSeconds } from '../../hooks/useCountdown';
import type { UserStackParamList } from '../../navigation/types';
import {
  getRoundProgress,
  getRoundScore,
  getRuntimeAttempts,
  mockExams,
  mockQuestionsData,
} from '../../services/mock/data';
import { gameColors, gameFonts, gameGradients, spacing } from '../../theme';

type Props = NativeStackScreenProps<UserStackParamList, 'Result'>;

function headline(score: number): string {
  if (score >= 80) return 'Hoàn thành xuất sắc!';
  if (score >= 50) return 'Làm tốt lắm!';
  return 'Cố gắng lần sau nhé!';
}

function starCount(score: number): number {
  if (score >= 80) return 3;
  if (score >= 50) return 2;
  return 1;
}

export default function ResultScreen({ navigation, route }: Props) {
  const { result, durationSeconds } = route.params;
  const insets = useSafeAreaInsets();
  const [showExplanationList, setShowExplanationList] = useState(false);

  // Tìm thông tin attempt và bài thi đã lưu
  const savedAttempts = getRuntimeAttempts();
  const savedAttempt = savedAttempts.find((a) => a.id === result.attemptId);
  const examOrder = savedAttempt?.examOrder || (result as any)?.examOrder || 1;
  const isPractice = savedAttempt?.mode === 'practice' || (result as any)?.mode === 'practice';
  const score = result.score;
  const total = result.totalQuestions || 10;
  const stars = starCount(score);
  const wrongCount = total - result.correctCount;

  // Tính toán trạng thái mở khóa vòng/bài
  const roundExams = mockExams.filter((e) => e.roundId === result.roundId);
  const nextExam = roundExams.find((e) => e.order === examOrder + 1);
  const isCompletedRound = examOrder === 3 || examOrder >= roundExams.length;
  const roundScore = isCompletedRound ? getRoundScore(result.roundId, savedAttempts) : null;

  // Xử lý làm bài tiếp theo
  const handleNextExam = () => {
    if (nextExam) {
      navigation.replace('Exam', {
        roundId: result.roundId,
        roundTitle: result.roundTitle,
        examId: nextExam.id,
        mode: 'exam',
      } as any);
    } else {
      navigation.navigate('Tabs', { screen: 'RoundList' });
    }
  };

  // Làm lại (chế độ ôn tập)
  const handleRetry = () => {
    navigation.replace('Exam', {
      roundId: result.roundId,
      roundTitle: result.roundTitle,
      examId: savedAttempt?.examId,
      mode: 'practice',
    } as any);
  };

  return (
    <SunnyBackground>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top > 0 ? insets.top + 6 : 16,
            paddingBottom: insets.bottom > 0 ? insets.bottom + 24 : 32,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.page}>
          {/* Header trên */}
          <View style={styles.headerRow}>
            <CircleButton
              icon="close"
              tone="red"
              accessibilityLabel="Đóng"
              onPress={() => navigation.navigate('Tabs', { screen: 'RoundList' })}
            />
            <View style={styles.headerCenter}>
              <WoodLabel text="Kết quả bài thi" />
            </View>
          </View>

          {/* Mascot Cú mèo biểu cảm theo điểm */}
          <PopIn style={styles.mascotWrap}>
            <Float distance={6}>
              <View style={styles.mascotBox}>
                <Emoji name="owl" size={106} />
                <View style={styles.gradCap}>
                  <Emoji name="graduationCap" size={54} />
                </View>
                {score >= 80 && (
                  <View style={styles.sparkleBox}>
                    <Emoji name="sparkles" size={36} />
                  </View>
                )}
              </View>
            </Float>
          </PopIn>

          {/* Bảng kết quả (GameBoard) */}
          <GameBoard style={styles.board}>
            <Text style={styles.headline}>{headline(score)}</Text>

            {/* Các ngôi sao nảy lên */}
            <View style={styles.starsRow}>
              <PopIn delay={250}>
                <StarIcon size={38} filled={stars >= 1} />
              </PopIn>
              <PopIn delay={450}>
                <StarIcon size={50} filled={stars >= 2} />
              </PopIn>
              <PopIn delay={650}>
                <StarIcon size={38} filled={stars >= 3} />
              </PopIn>
            </View>

            {/* Điểm số to bản / 100 */}
            <View style={styles.scoreRow}>
              <CountUp
                value={score}
                delay={200}
                format={(n) => `${Math.round(n)}`}
                style={styles.scoreNumber}
              />
              <Text style={styles.scoreMax}>/100 điểm</Text>
            </View>

            {/* Chips thống kê: Thời gian · Đúng · Sai */}
            <View style={styles.chipsRow}>
              {durationSeconds != null && (
                <View style={[styles.statChip, { backgroundColor: '#eff6ff' }]}>
                  <Ionicons name="time-outline" size={15} color="#1d4ed8" />
                  <Text style={[styles.statChipText, { color: '#1d4ed8' }]}>
                    {formatSeconds(durationSeconds)}
                  </Text>
                </View>
              )}
              <View style={[styles.statChip, { backgroundColor: '#f0fdf4' }]}>
                <Ionicons name="checkmark-sharp" size={15} color="#16a34a" />
                <Text style={[styles.statChipText, { color: '#16a34a' }]}>
                  Đúng {result.correctCount}/{total} câu
                </Text>
              </View>
              {wrongCount > 0 && (
                <View style={[styles.statChip, { backgroundColor: '#fef2f2' }]}>
                  <Ionicons name="close-sharp" size={15} color="#dc2626" />
                  <Text style={[styles.statChipText, { color: '#dc2626' }]}>
                    Sai {wrongCount} câu
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.roundTitleText} numberOfLines={2}>
              {result.roundTitle} {savedAttempt ? `· ${savedAttempt.examTitle}` : ''}
            </Text>

            {/* Thông báo mở khóa bài tiếp theo hoặc hoàn thành vòng */}
            {!isPractice && (
              <View style={styles.unlockBannerBox}>
                {!isCompletedRound ? (
                  <View style={styles.unlockNextBox}>
                    <Ionicons name="gift" size={20} color="#ea580c" />
                    <Text style={styles.unlockNextText}>
                      Đã mở khóa Bài {examOrder + 1} tiếp theo! 🎉
                    </Text>
                  </View>
                ) : (
                  <View style={styles.completedRoundBox}>
                    <Ionicons name="trophy" size={22} color="#eab308" />
                    <View style={styles.roundScoreInfo}>
                      <Text style={styles.completedRoundTitle}>Hoàn thành trọn vẹn vòng thi! 🏆</Text>
                      {roundScore != null && (
                        <Text style={styles.roundScoreSummary}>
                          Điểm vòng: <Text style={styles.scoreHighlight}>{roundScore}/100 đ</Text> (Trung bình 3 bài)
                        </Text>
                      )}
                    </View>
                  </View>
                )}
              </View>
            )}
          </GameBoard>

          {/* Các nút hành động chính */}
          <View style={styles.actionsContainer}>
            {/* Nếu đang thi và chưa phải bài cuối: Nút Làm bài tiếp theo */}
            {!isPractice && !isCompletedRound && nextExam && (
              <GameButton
                label={`Làm Bài ${examOrder + 1} tiếp theo`}
                pulse
                onPress={handleNextExam}
                style={styles.nextExamBtn}
              />
            )}

            {/* Chế độ ôn tập: Nút Làm lại & Xem đáp án */}
            {isPractice && (
              <View style={styles.practiceBtnsCol}>
                <GameButton label="Làm lại bài thi" pulse onPress={handleRetry} />
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setShowExplanationList((v) => !v)}
                  style={styles.explanationToggleBtn}
                >
                  <Ionicons
                    name={showExplanationList ? 'chevron-up' : 'book-outline'}
                    size={16}
                    color="#1d4ed8"
                  />
                  <Text style={styles.explanationToggleText}>
                    {showExplanationList ? 'Thu gọn lời giải' : 'Xem đáp án & giải thích chi tiết'}
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Chi tiết đáp án & giải thích (chế độ ôn tập) */}
            {isPractice && showExplanationList && (
              <View style={styles.explanationsContainer}>
                <WoodLabel text="Đáp án & Giải thích" fontSize={15} />
                {mockQuestionsData.slice(0, 10).map((q, idx) => {
                  const r = result.review?.find((rev) => rev.questionId === q.id);
                  const isCorrect = r?.correct ?? false;

                  return (
                    <View
                      key={q.id}
                      style={[
                        styles.reviewCard,
                        isCorrect ? styles.reviewCardCorrect : styles.reviewCardWrong,
                      ]}
                    >
                      <View style={styles.reviewCardHead}>
                        <View
                          style={[
                            styles.reviewIndexBadge,
                            { backgroundColor: isCorrect ? '#16a34a' : '#dc2626' },
                          ]}
                        >
                          <Text style={styles.reviewIndexText}>Câu {idx + 1}</Text>
                        </View>
                        <Text
                          style={[
                            styles.reviewStatusText,
                            { color: isCorrect ? '#16a34a' : '#dc2626' },
                          ]}
                        >
                          {isCorrect ? 'Đúng (+10 đ)' : 'Chưa đúng'}
                        </Text>
                      </View>
                      <Text style={styles.reviewQuestion}>{q.content}</Text>
                      <Text style={styles.reviewAnswer}>
                        Đáp án đúng: <Text style={styles.correctHighlight}>{q.options[q.correctIndex]}</Text>
                      </Text>
                      <Text style={styles.reviewExplanation}>Giải thích: {q.explanation}</Text>
                    </View>
                  );
                })}
              </View>
            )}

            {/* 3 nút điều hướng: Về trang chủ · Xem các bài trong vòng · Xem lịch sử */}
            <View style={styles.navLinksRow}>
              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.navigate('Tabs', { screen: 'RoundList' })}
                style={styles.navLinkCard}
              >
                <Ionicons name="list" size={18} color="#1d4ed8" />
                <Text style={styles.navLinkText}>Xem các bài</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.navigate('Tabs', { screen: 'History' })}
                style={styles.navLinkCard}
              >
                <Ionicons name="trophy-outline" size={18} color="#1d4ed8" />
                <Text style={styles.navLinkText}>Xem lịch sử</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.navigate('Tabs', { screen: 'Home' })}
                style={[styles.navLinkCard, styles.navLinkCardHome]}
              >
                <Ionicons name="home" size={18} color="#ffffff" />
                <Text style={styles.navLinkTextHome}>Trang chủ</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SunnyBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  page: {
    flex: 1,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
  },
  headerCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: -1,
  },
  mascotWrap: {
    alignItems: 'center',
    marginVertical: 4,
  },
  mascotBox: {
    width: 120,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gradCap: {
    position: 'absolute',
    top: -16,
    left: 28,
    transform: [{ rotate: '-12deg' }],
  },
  sparkleBox: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  board: {
    padding: spacing.md,
    gap: 12,
  },
  headline: {
    fontFamily: gameFonts.display,
    fontSize: 24,
    color: gameColors.ink,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    gap: 6,
  },
  scoreNumber: {
    fontFamily: gameFonts.display,
    fontSize: 52,
    color: '#f97316',
  },
  scoreMax: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 18,
    color: '#64748b',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statChipText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 12,
  },
  roundTitleText: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  unlockBannerBox: {
    marginTop: 4,
  },
  unlockNextBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff7ed',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fdba74',
    padding: 10,
  },
  unlockNextText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 13,
    color: '#ea580c',
  },
  completedRoundBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fefce8',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fde047',
    padding: 10,
  },
  roundScoreInfo: {
    flex: 1,
    gap: 2,
  },
  completedRoundTitle: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 14,
    color: '#854d0e',
  },
  roundScoreSummary: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 12,
    color: '#713f12',
  },
  scoreHighlight: {
    fontFamily: gameFonts.bodyExtraBold,
    color: '#16a34a',
  },
  actionsContainer: {
    gap: 12,
    marginTop: 6,
  },
  nextExamBtn: {
    width: '100%',
  },
  practiceBtnsCol: {
    gap: 8,
  },
  explanationToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#93c5fd',
  },
  explanationToggleText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 13,
    color: '#1d4ed8',
  },
  explanationsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    padding: spacing.md,
    gap: 10,
  },
  reviewCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 10,
    gap: 4,
  },
  reviewCardCorrect: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  reviewCardWrong: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  reviewCardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewIndexBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  reviewIndexText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 10,
    color: '#ffffff',
  },
  reviewStatusText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 11,
  },
  reviewQuestion: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 13,
    color: '#1e293b',
    marginTop: 2,
  },
  reviewAnswer: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 12,
    color: '#475569',
  },
  correctHighlight: {
    fontWeight: '800',
    color: '#16a34a',
  },
  reviewExplanation: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 11,
    color: '#64748b',
    fontStyle: 'italic',
  },
  navLinksRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  navLinkCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    boxShadow: '0px 2px 0px 0px #93c5fd',
  },
  navLinkText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 11,
    color: '#1d4ed8',
  },
  navLinkCardHome: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    boxShadow: '0px 2px 0px 0px #1d4ed8',
  },
  navLinkTextHome: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 11,
    color: '#ffffff',
  },
});
