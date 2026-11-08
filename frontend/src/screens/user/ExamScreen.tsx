import Ionicons from '@expo/vector-icons/Ionicons';
import { usePreventRemove } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AnswerButton,
  CircleButton,
  GameBoard,
  GameButton,
  OceanBackground,
  SpeechBubble,
  StarIcon,
  StepProgress,
  type AnswerKind,
} from '../../components/game';
import Emoji from '../../components/Emoji';
import type { EmojiName } from '../../components/emojiAssets';
import { Float, PopIn, Pulse } from '../../components/motion';
import { useCountdown } from '../../hooks/useCountdown';
import type { UserStackParamList } from '../../navigation/types';
import { mockApi } from '../../services/mock';
import {
  mockExams,
  mockQuestionsData,
  mockRounds,
  type Exam,
  type MockQuestionItem,
} from '../../services/mock/data';
import { gameColors, gameFonts, gameGradients, gameShadows, spacing } from '../../theme';
import { confirm } from '../../utils/confirm';

type Props = NativeStackScreenProps<UserStackParamList, 'Exam'>;

const LETTERS = 'ABCDEFGH';

export default function ExamScreen({ navigation, route }: Props) {
  const { roundId, roundTitle } = route.params;
  const insets = useSafeAreaInsets();

  // Nhận các tham số mở rộng (examId, mode)
  const routeParams = route.params as any;
  const targetExamId: number | undefined = routeParams?.examId;
  const mode: 'exam' | 'practice' = routeParams?.mode === 'practice' ? 'practice' : 'exam';

  // Tìm bài thi tương ứng
  const roundExams = mockExams.filter((e) => e.roundId === roundId);
  const exam: Exam =
    (targetExamId ? roundExams.find((e) => e.id === targetExamId) : undefined) ??
    roundExams[0] ?? {
      id: 201,
      roundId: 2,
      order: 1,
      title: 'Bài 1: Hobbies & Sports',
      questionCount: 10,
      durationMinutes: 15,
      questionIds: [],
    };

  // Lấy 10 câu hỏi của bài thi
  const questions: MockQuestionItem[] = mockApi.getQuestionsForExam(exam.id);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [startedAt] = useState(Date.now());
  const submittedRef = useRef(false);

  // Audio simulation state cho câu LISTENING
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioPlayCount, setAudioPlayCount] = useState(0);
  const audioTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hạn giờ đếm ngược
  const expiresAt = new Date(startedAt + exam.durationMinutes * 60_000).toISOString();
  const { label: timeLeft, secondsLeft } = useCountdown(expiresAt, () => {
    void handleAutoSubmit();
  });

  // Dừng phát audio khi đổi câu
  useEffect(() => {
    setIsPlayingAudio(false);
    if (audioTimerRef.current) clearTimeout(audioTimerRef.current);
  }, [currentIndex]);

  const toggleAudio = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      if (audioTimerRef.current) clearTimeout(audioTimerRef.current);
    } else {
      setIsPlayingAudio(true);
      setAudioPlayCount((c) => c + 1);
      // Giả lập đoạn audio kết thúc sau 6 giây
      audioTimerRef.current = setTimeout(() => {
        setIsPlayingAudio(false);
      }, 6000);
    }
  };

  // Ngăn vô tình thoát khi đang thi
  usePreventRemove(!submittedRef.current, ({ data }) => {
    if (submittedRef.current) {
      navigation.dispatch(data.action);
      return;
    }
    void confirm('Thoát bài thi?', 'Bài làm sẽ không được lưu.', {
      confirmText: 'Thoát',
      destructive: true,
    }).then((ok) => {
      if (ok) navigation.dispatch(data.action);
    });
  });

  // Nộp bài
  const submitExam = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);

    try {
      const durationSeconds = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
      // Gọi submitAttempt của mockApi
      const attempt = await mockApi.startAttempt(roundId, exam.id);
      const result = await mockApi.submitAttempt(
        attempt.id,
        {
          answers: questions.map((q) => ({
            questionId: q.id,
            choiceId: answers[q.id] ?? null,
          })),
        },
        { durationSeconds, mode }
      );

      // Thêm thông tin bài thi vào kết quả để màn Result sử dụng
      (result as any).examId = exam.id;
      (result as any).examOrder = exam.order;
      (result as any).mode = mode;

      navigation.replace('Result', { result, durationSeconds });
    } catch (e: any) {
      submittedRef.current = false;
      setSubmitting(false);
      Alert.alert('Lỗi nộp bài', e?.message || 'Có lỗi xảy ra khi nộp bài.');
    }
  }, [answers, exam, mode, navigation, questions, roundId, startedAt]);

  const handleAutoSubmit = async () => {
    Alert.alert('Hết giờ làm bài!', 'Thời gian đã hết, hệ thống sẽ tự động nộp bài.');
    await submitExam();
  };

  const handleSubmitPress = async () => {
    const unanswered = questions.length - Object.keys(answers).length;
    const message =
      unanswered > 0
        ? `Bạn còn ${unanswered} câu chưa trả lời. Vẫn nộp bài?`
        : 'Bạn chắc chắn muốn nộp bài?';
    if (await confirm('Nộp bài', message, { confirmText: 'Nộp bài' })) {
      await submitExam();
    }
  };

  const question = questions[currentIndex];
  const total = questions.length;
  const isLast = currentIndex === total - 1;
  const currentAnswered = answers[question.id] != null;
  const selectedChoiceId = answers[question.id];

  // Mascot bubble text gợi ý
  const bubbleText =
    secondsLeft > 0 && secondsLeft <= 60
      ? 'Sắp hết giờ rồi, cố gắng nộp bài nhé!'
      : isLast
        ? 'Câu cuối rồi! Kiểm tra lại rồi bấm Nộp bài nhé.'
        : currentAnswered
          ? 'Tuyệt vời! Bấm Câu tiếp theo để làm tiếp nhé.'
          : 'Đọc kỹ câu hỏi nhé, Cú MeMe tin bạn làm được!';

  const handleSelectChoice = (choiceId: number) => {
    setAnswers((prev) => ({ ...prev, [question.id]: choiceId }));
  };

  return (
    <OceanBackground>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 6 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.page}>
          {/* Header trên: Nút quay lại + Tiêu đề vòng/bài + Thanh bước câu */}
          <View style={styles.headerRow}>
            <CircleButton
              icon="arrow-back"
              accessibilityLabel="Quay lại"
              onPress={navigation.goBack}
            />

            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {roundTitle} · Bài {exam.order}
              </Text>
              {mode === 'practice' && (
                <View style={styles.practiceBadge}>
                  <Text style={styles.practiceBadgeText}>ÔN TẬP</Text>
                </View>
              )}
            </View>

            <StepProgress
              total={total}
              current={currentIndex}
              isAnswered={(i) => answers[questions[i].id] != null}
              onSelect={setCurrentIndex}
            />
          </View>

          {/* Info bar: Đồng hồ đếm ngược · Tiến độ làm bài · Câu x/10 */}
          <LinearGradient colors={gameGradients.infoBar} style={styles.infoBar}>
            <Pulse active={secondsLeft > 0 && secondsLeft <= 60} scale={1.1}>
              <LinearGradient
                colors={secondsLeft <= 60 ? gameGradients.redAnswer : gameGradients.timerPill}
                style={styles.timer}
              >
                <Ionicons name="time-outline" size={17} color="#ffffff" />
                <Text style={styles.timerText}>{timeLeft}</Text>
              </LinearGradient>
            </Pulse>

            <View style={styles.infoItem}>
              <StarIcon size={18} />
              <Text style={styles.infoText}>
                Đã làm: {Object.keys(answers).length}/{total}
              </Text>
            </View>

            <Text style={styles.infoMuted}>
              Câu {currentIndex + 1}/{total}
            </Text>
          </LinearGradient>

          {/* Bảng câu hỏi chính (GameBoard) */}
          <Animated.View key={currentIndex} entering={FadeInRight.duration(260)}>
            <GameBoard style={styles.board}>
              {/* Tiêu đề & Nội dung câu */}
              <View style={styles.questionHeader}>
                <LinearGradient colors={gameGradients.blueCircle} style={styles.questionBadge}>
                  <Text style={styles.questionBadgeText}>{currentIndex + 1}</Text>
                </LinearGradient>
                <View style={styles.typePill}>
                  <Text style={styles.typePillText}>
                    {question.type === 'LISTENING'
                      ? 'NGHE'
                      : question.type === 'IMAGE'
                        ? 'HÌNH ẢNH'
                        : 'TRẮC NGHIỆM'}
                  </Text>
                </View>
              </View>

              <Text style={styles.questionContent}>{question.content}</Text>

              {/* Phần hiển thị riêng theo dạng câu hỏi: LISTENING hoặc IMAGE */}
              {question.type === 'LISTENING' && (
                <View style={styles.listeningCard}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={toggleAudio}
                    style={[styles.audioBtn, isPlayingAudio && styles.audioBtnPlaying]}
                  >
                    <Ionicons
                      name={isPlayingAudio ? 'pause-circle' : 'volume-high'}
                      size={28}
                      color="#ffffff"
                    />
                    <Text style={styles.audioBtnText}>
                      {isPlayingAudio ? 'Đang phát âm thanh...' : 'Bấm để nghe audio'}
                    </Text>
                  </Pressable>
                  <Text style={styles.audioMeta}>
                    {audioPlayCount > 0
                      ? `Đã nghe: ${audioPlayCount} lần (Cho phép nghe lại)`
                      : 'Bấm nút trên để nghe giọng đọc bản xứ'}
                  </Text>
                </View>
              )}

              {question.type === 'IMAGE' && question.imageUrl && (
                <View style={styles.imageCard}>
                  <View style={styles.imageIllustrationBox}>
                    <Emoji name={question.imageUrl as EmojiName} size={80} />
                  </View>
                  <Text style={styles.imageHint}>Quan sát hình ảnh và chọn đáp án đúng nhất</Text>
                </View>
              )}

              {/* Danh sách các đáp án A, B, C, D */}
              <View style={styles.answersList} accessibilityRole="radiogroup">
                {question.choices.map((choice, i) => {
                  const isSelected = selectedChoiceId === choice.id;
                  const isDimmed = selectedChoiceId != null && !isSelected;

                  return (
                    <AnswerButton
                      key={choice.id}
                      kind="choice"
                      letter={LETTERS[i]}
                      label={choice.content}
                      selected={isSelected}
                      dimmed={isDimmed}
                      disabled={submitting}
                      onPress={() => handleSelectChoice(choice.id)}
                      style={styles.answerItem}
                    />
                  );
                })}
              </View>

              {/* Chế độ ÔN TẬP: Hiện ngay giải thích đúng/sai sau khi chọn */}
              {mode === 'practice' && currentAnswered && (
                <View
                  style={[
                    styles.explanationBox,
                    selectedChoiceId === question.correctChoiceId
                      ? styles.explainCorrect
                      : styles.explainWrong,
                  ]}
                >
                  <View style={styles.explainHeader}>
                    <Ionicons
                      name={
                        selectedChoiceId === question.correctChoiceId
                          ? 'checkmark-circle'
                          : 'alert-circle'
                      }
                      size={18}
                      color={
                        selectedChoiceId === question.correctChoiceId ? '#16a34a' : '#dc2626'
                      }
                    />
                    <Text
                      style={[
                        styles.explainTitle,
                        {
                          color:
                            selectedChoiceId === question.correctChoiceId
                              ? '#16a34a'
                              : '#dc2626',
                        },
                      ]}
                    >
                      {selectedChoiceId === question.correctChoiceId
                        ? 'Chính xác! (+10 điểm)'
                        : 'Chưa đúng rồi!'}
                    </Text>
                  </View>
                  <Text style={styles.explainText}>{question.explanation}</Text>
                </View>
              )}
            </GameBoard>
          </Animated.View>

          {/* Điều hướng Trước / Sau & Nộp bài */}
          <View style={styles.navBarRow}>
            <Pressable
              disabled={currentIndex === 0}
              onPress={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
            >
              <Ionicons name="arrow-back" size={16} color="#ffffff" />
              <Text style={styles.navBtnText}>Câu trước</Text>
            </Pressable>

            {!isLast ? (
              <Pressable
                onPress={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
                style={[styles.navBtn, styles.navBtnNext]}
              >
                <Text style={styles.navBtnText}>Câu sau</Text>
                <Ionicons name="arrow-forward" size={16} color="#ffffff" />
              </Pressable>
            ) : (
              <Pressable onPress={handleSubmitPress} style={[styles.navBtn, styles.navBtnSubmit]}>
                <Ionicons name="checkmark-done" size={16} color="#ffffff" />
                <Text style={styles.navBtnText}>Nộp bài</Text>
              </Pressable>
            )}
          </View>

          {/* Footer: Mascot Cú mèo + Bong bóng động viên + Nút chính */}
          <View style={styles.footerSection}>
            <Float style={styles.mascotBox} distance={8}>
              <Emoji name="owl" size={96} />
            </Float>

            <PopIn key={bubbleText} style={styles.bubbleBox}>
              <SpeechBubble text={bubbleText} />
            </PopIn>

            <GameButton
              label={isLast ? 'Nộp bài ngay' : 'Tiếp tục'}
              onPress={() => {
                if (isLast) void handleSubmitPress();
                else setCurrentIndex((i) => Math.min(total - 1, i + 1));
              }}
              disabled={submitting}
              loading={submitting}
              pulse={!submitting && (isLast || currentAnswered)}
              style={styles.mainActionButton}
            />
          </View>
        </View>
      </ScrollView>
    </OceanBackground>
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
    gap: 10,
  },
  headerTitleWrap: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 14,
    color: '#ffffff',
  },
  practiceBadge: {
    backgroundColor: '#ffc93c',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    alignSelf: 'flex-start',
  },
  practiceBadgeText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 9,
    color: '#7a4a22',
  },
  infoBar: {
    height: 48,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: gameColors.boardBorder,
    boxShadow: gameShadows.infoBar,
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  timerText: {
    fontFamily: gameFonts.display,
    fontSize: 17,
    color: '#ffffff',
    fontVariant: ['tabular-nums'],
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 14,
    color: gameColors.ink,
  },
  infoMuted: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 14,
    color: gameColors.inkMuted,
  },
  board: {
    padding: spacing.md,
    gap: 12,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionBadgeText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 15,
    color: '#ffffff',
  },
  typePill: {
    backgroundColor: '#dbeafe',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typePillText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 10,
    color: '#1d4ed8',
  },
  questionContent: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 16,
    lineHeight: 22,
    color: '#1e293b',
  },
  listeningCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#bfdbfe',
    padding: 12,
    alignItems: 'center',
    gap: 8,
  },
  audioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2563eb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    boxShadow: '0px 3px 0px 0px #1e40af',
  },
  audioBtnPlaying: {
    backgroundColor: '#ea580c',
    boxShadow: '0px 3px 0px 0px #c2410c',
  },
  audioBtnText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 13,
    color: '#ffffff',
  },
  audioMeta: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 11,
    color: '#64748b',
  },
  imageCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  imageIllustrationBox: {
    width: 100,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageHint: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 11,
    color: '#64748b',
  },
  answersList: {
    gap: 10,
    marginTop: 4,
  },
  answerItem: {
    width: '100%',
  },
  explanationBox: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 10,
    gap: 4,
    marginTop: 4,
  },
  explainCorrect: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  explainWrong: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  explainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  explainTitle: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 13,
  },
  explainText: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 12,
    color: '#334155',
    lineHeight: 16,
  },
  navBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    boxShadow: '0px 3px 0px 0px #1d4ed8',
  },
  navBtnDisabled: {
    backgroundColor: '#94a3b8',
    boxShadow: 'none',
    opacity: 0.6,
  },
  navBtnNext: {
    backgroundColor: '#f97316',
    boxShadow: '0px 3px 0px 0px #c2410c',
  },
  navBtnSubmit: {
    backgroundColor: '#16a34a',
    boxShadow: '0px 3px 0px 0px #15803d',
  },
  navBtnText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 13,
    color: '#ffffff',
  },
  footerSection: {
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  mascotBox: {
    width: 100,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleBox: {
    width: '100%',
    alignItems: 'center',
  },
  mainActionButton: {
    width: '100%',
    marginTop: 4,
  },
});
