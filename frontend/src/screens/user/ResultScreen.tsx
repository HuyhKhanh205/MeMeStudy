import Ionicons from '@expo/vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CircleButton,
  GameBoard,
  GameButton,
  StarIcon,
  WoodLabel,
} from '../../components/game';
import Emoji from '../../components/Emoji';
import { CountUp, Float, PopIn } from '../../components/motion';
import { formatSeconds } from '../../hooks/useCountdown';
import type { UserStackParamList } from '../../navigation/types';
import {
  getRoundRank,
  getRoundScore,
  getRuntimeAttempts,
  mockExams,
  mockRounds,
} from '../../services/mock/data';
import { mockApi } from '../../services/mock';
import { gameColors, gameFonts, spacing } from '../../theme';

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
  const routeParams = route.params as any;
  const fromHistory = Boolean(routeParams?.fromHistory);
  const insets = useSafeAreaInsets();
  const [showExplanationList, setShowExplanationList] = useState(false);

  // Tìm thông tin attempt và bài thi đã lưu
  const savedAttempts = getRuntimeAttempts();
  const savedAttempt = savedAttempts.find((a) => a.id === result.attemptId);
  const examId: number = savedAttempt?.examId ?? (result as any)?.examId ?? 201;
  const currentExam = mockExams.find((e) => e.id === examId);
  const examOrder = savedAttempt?.examOrder || (result as any)?.examOrder || currentExam?.order || 1;
  const examTitle = savedAttempt?.examTitle || currentExam?.title || `Bài ${examOrder}`;
  const isPractice = savedAttempt?.mode === 'practice' || (result as any)?.mode === 'practice';
  const score = result.score;
  const total = result.totalQuestions || 10;
  const stars = starCount(score);
  const wrongCount = total - result.correctCount;

  // Tính toán chính xác trạng thái vòng và bài tiếp theo
  const round = mockRounds.find((r) => r.id === result.roundId);
  const roundExams = mockExams.filter((e) => e.roundId === result.roundId);
  const roundAttempts = savedAttempts.filter((a) => a.roundId === result.roundId);
  const completedOrders = new Set(roundAttempts.map((a) => a.examOrder));
  const isArchived =
    savedAttempt?.seasonId === '2025-2026' || round?.seasonId === '2025-2026';

  const isCompletedRound =
    isArchived ||
    round?.status === 'COMPLETED' ||
    completedOrders.size >= 3 ||
    (roundExams.length > 0 &&
      roundExams.every((e) =>
        savedAttempts.some((a) => a.roundId === result.roundId && a.examId === e.id)
      ));

  const roundScore = isCompletedRound
    ? getRoundScore(result.roundId, savedAttempts) ??
      ([1, 2, 3].every((ord) => completedOrders.has(ord))
        ? [1, 2, 3].reduce(
            (sum, ord) => sum + (roundAttempts.find((a) => a.examOrder === ord)?.score ?? 0),
            0
          )
        : null)
    : null;

  const nextExam = roundExams.find((e) => e.order === examOrder + 1);
  const isNextExamCompleted = nextExam
    ? savedAttempts.some(
        (a) =>
          a.roundId === result.roundId &&
          (a.examId === nextExam.id || a.examOrder === nextExam.order)
      )
    : true;

  // Chỉ cho phép bấm "Làm Bài tiếp theo" khi:
  // - Không phải chế độ ôn tập (isPractice)
  // - Không phải mở xem lại từ Lịch sử (fromHistory)
  // - Vòng thi chưa hoàn thành (không phải COMPLETED / đủ 3 bài)
  // - Có bài tiếp theo và bài tiếp theo chưa làm
  const canStartNextExam =
    !isPractice && !fromHistory && !isCompletedRound && !!nextExam && !isNextExamCompleted;

  // Lấy đúng 10 câu hỏi của bài thi để hiển thị phần giải thích
  const displayQuestions = mockApi.getQuestionsForExam(examId);

  // Xử lý làm bài tiếp theo
  const handleNextExam = () => {
    if (!canStartNextExam || !nextExam) {
      Alert.alert(
        'Vòng thi đã hoàn thành',
        'Bạn đã hoàn thành bài thi này. Các bài kiểm tra đã thi xong không thể thi lại.'
      );
      return;
    }

    navigation.replace('Exam', {
      roundId: result.roundId,
      roundTitle: result.roundTitle,
      examId: nextExam.id,
      mode: 'exam',
    } as any);
  };

  // Làm lại (chế độ ôn tập)
  const handleRetry = () => {
    navigation.replace('Exam', {
      roundId: result.roundId,
      roundTitle: result.roundTitle,
      examId,
      mode: 'practice',
    } as any);
  };

  return (
    <ImageBackground
      source={require('../../../assets/background/Home.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top > 0 ? insets.top + 6 : 16,
            paddingBottom: insets.bottom > 0 ? insets.bottom + 24 : 36,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.page}>
          {/* Header trên: Nút Đóng + Tiêu đề + Nút Trang chủ */}
          <View style={styles.headerRow}>
            <CircleButton
              icon="close"
              tone="red"
              accessibilityLabel="Đóng"
              onPress={() => navigation.navigate('Tabs', { screen: 'RoundList' })}
            />
            <WoodLabel text="Kết quả bài thi" fontSize={18} />
            <CircleButton
              icon="home"
              tone="blue"
              accessibilityLabel="Trang chủ"
              onPress={() => navigation.navigate('Tabs', { screen: 'Home' })}
            />
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
              {result.roundTitle} {examTitle ? `· ${examTitle}` : ''}
            </Text>

            {/* Thông báo mở khóa bài tiếp theo, chế độ ôn tập hoặc hoàn thành vòng */}
            <View style={styles.unlockBannerBox}>
              {isPractice ? (
                <View style={styles.completedRoundBox}>
                  <Ionicons name="sparkles" size={24} color="#16a34a" />
                  <View style={styles.roundScoreInfo}>
                    <Text style={styles.completedRoundTitle}>Hoàn thành lượt ôn tập! 🌟</Text>
                    <Text style={styles.roundScoreSummary}>
                      Chế độ ôn tập không ảnh hưởng điểm thi chính thức. Hãy xem lời giải hoặc làm lại để nhớ bài hơn nhé!
                    </Text>
                  </View>
                </View>
              ) : isCompletedRound ? (
                <View style={styles.completedRoundBox}>
                  <Ionicons name="trophy" size={24} color="#eab308" />
                  <View style={styles.roundScoreInfo}>
                    <Text style={styles.completedRoundTitle}>
                      {fromHistory ? 'Vòng thi đã hoàn thành! 🏆' : 'Hoàn thành trọn vẹn vòng thi! 🏆'}
                    </Text>
                    {roundScore != null && (
                      <Text style={styles.roundScoreSummary}>
                        Điểm vòng: <Text style={styles.scoreHighlight}>{roundScore}/300 đ</Text> (Cộng từ 3 bài · {getRoundRank(roundScore).tier})
                      </Text>
                    )}
                  </View>
                </View>
              ) : canStartNextExam ? (
                <View style={styles.unlockNextBox}>
                  <Ionicons name="gift" size={22} color="#ea580c" />
                  <View style={styles.unlockTextCol}>
                    <Text style={styles.unlockNextText}>
                      Đã mở khóa Bài {examOrder + 1} tiếp theo! 🎉
                    </Text>
                    <Text style={styles.unlockNextSub}>
                      Hãy tiếp tục hành trình để chinh phục điểm vòng nhé!
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.completedRoundBox}>
                  <Ionicons name="checkmark-done-circle" size={24} color="#16a34a" />
                  <View style={styles.roundScoreInfo}>
                    <Text style={styles.completedRoundTitle}>
                      Đã hoàn thành Bài {examOrder} ({score}/100 đ)
                    </Text>
                    <Text style={styles.roundScoreSummary}>
                      Tiến độ vòng thi: <Text style={styles.scoreHighlight}>{completedOrders.size}/3 bài</Text> đã hoàn thành
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </GameBoard>

          {/* Các nút hành động chính */}
          <View style={styles.actionsContainer}>
            {/* Nút Làm bài tiếp theo chỉ hiện khi vừa làm xong và bài tiếp theo chưa làm */}
            {canStartNextExam && (
              <GameButton
                label={`Làm Bài ${examOrder + 1} tiếp theo`}
                pulse
                onPress={handleNextExam}
                style={styles.nextExamBtn}
              />
            )}

            {/* Nút bật/tắt xem đáp án & giải thích chi tiết */}
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowExplanationList((v) => !v)}
              style={styles.explanationToggleBtn}
            >
              <Ionicons
                name={showExplanationList ? 'chevron-up' : 'document-text-outline'}
                size={18}
                color="#1d4ed8"
              />
              <Text style={styles.explanationToggleText}>
                {showExplanationList ? 'Thu gọn đáp án & giải thích' : 'Xem đáp án & giải thích chi tiết'}
              </Text>
            </Pressable>

            {/* Danh sách 10 câu hỏi kèm đáp án & giải thích chi tiết */}
            {showExplanationList && (
              <View style={styles.explanationsContainer}>
                <WoodLabel text="Chi tiết câu hỏi & Lời giải" fontSize={15} />

                {displayQuestions.map((q, idx) => {
                  const r = result.review?.find((rev) => rev.questionId === q.id);
                  const savedRev = savedAttempt?.review?.find((sr) => sr.questionId === q.id);
                  const isCorrect = r ? r.correct : savedRev ? savedRev.correct : idx < result.correctCount;
                  const choiceId = (r as any)?.choiceId ?? savedRev?.choiceId;
                  const userChoice = q.choices.find((c) => c.id === choiceId);

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
                          {isCorrect ? 'Chính xác (+10 đ)' : 'Chưa đúng (0 đ)'}
                        </Text>
                      </View>

                      <Text style={styles.reviewQuestion}>{q.content}</Text>

                      {userChoice && (
                        <Text style={styles.reviewUserAnswer}>
                          Bạn đã chọn: <Text style={styles.boldText}>{userChoice.content}</Text>
                        </Text>
                      )}

                      <Text style={styles.reviewAnswer}>
                        Đáp án đúng: <Text style={styles.correctHighlight}>{q.options[q.correctIndex]}</Text>
                      </Text>

                      <View style={styles.explainDivider} />
                      <Text style={styles.reviewExplanation}>💡 Lời giải: {q.explanation}</Text>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Chế độ ôn tập hoặc nút ôn lại */}
            {isPractice && (
              <GameButton label="Làm lại bài thi" pulse onPress={handleRetry} />
            )}

            {/* 3 nút điều hướng: Xem các bài · Xem lịch sử · Trang chủ */}
            <View style={styles.navLinksRow}>
              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.navigate('Tabs', { screen: 'RoundList' })}
                style={styles.navLinkCard}
              >
                <Ionicons name="list" size={18} color="#1d4ed8" />
                <Text style={styles.navLinkText}>Các bài thi</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.navigate('Tabs', { screen: 'History' })}
                style={styles.navLinkCard}
              >
                <Ionicons name="trophy-outline" size={18} color="#1d4ed8" />
                <Text style={styles.navLinkText}>Lịch sử</Text>
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
    gap: 10,
    backgroundColor: '#fff7ed',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fdba74',
    padding: 10,
  },
  unlockTextCol: {
    flex: 1,
    gap: 2,
  },
  unlockNextText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 14,
    color: '#ea580c',
  },
  unlockNextSub: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 11,
    color: '#9a3412',
  },
  completedRoundBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fefce8',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fde047',
    padding: 12,
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
    gap: 10,
    marginTop: 6,
  },
  nextExamBtn: {
    width: '100%',
  },
  explanationToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#93c5fd',
    boxShadow: '0px 3px 0px 0px #3b82f6',
  },
  explanationToggleText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 13,
    color: '#1d4ed8',
  },
  explanationsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: '#bfdbfe',
    padding: spacing.md,
    gap: 10,
    boxShadow: '0px 4px 0px 0px #60a5fa',
  },
  reviewCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 12,
    gap: 6,
  },
  reviewCardCorrect: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  reviewCardWrong: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
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
    fontSize: 11,
    color: '#ffffff',
  },
  reviewStatusText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 12,
  },
  reviewQuestion: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 13,
    color: '#1e293b',
    lineHeight: 18,
  },
  reviewUserAnswer: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 12,
    color: '#475569',
  },
  boldText: {
    fontFamily: gameFonts.bodyExtraBold,
    color: '#0f172a',
  },
  reviewAnswer: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 12,
    color: '#334155',
  },
  correctHighlight: {
    fontFamily: gameFonts.bodyExtraBold,
    color: '#16a34a',
  },
  explainDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 2,
  },
  reviewExplanation: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
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
