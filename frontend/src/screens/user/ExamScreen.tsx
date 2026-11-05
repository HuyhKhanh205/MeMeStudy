import Ionicons from '@expo/vector-icons/Ionicons';
import { usePreventRemove } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { Float, PopIn, Pulse } from '../../components/motion';
import { useCountdown } from '../../hooks/useCountdown';
import type { UserStackParamList } from '../../navigation/types';
import { queryErrorMessage, useStartAttemptMutation, useSubmitAttemptMutation } from '../../store/api';
import { gameColors, gameFonts, gameGradients, gameShadows } from '../../theme';
import type { Attempt, Choice } from '../../types';
import { confirm } from '../../utils/confirm';

type Props = NativeStackScreenProps<UserStackParamList, 'Exam'>;

const LETTERS = 'ABCDEFGH';
const TRUE_LABEL = /^(true|đúng)$/i;
const FALSE_LABEL = /^(false|sai)$/i;

/** Câu 2 đáp án Đúng/Sai dùng biến thể True/False (xanh/đỏ) của Game/AnswerButton. */
function kindFor(choices: Choice[], index: number): AnswerKind {
  const isTrueFalse =
    choices.length === 2 && TRUE_LABEL.test(choices[0].content.trim()) && FALSE_LABEL.test(choices[1].content.trim());
  if (!isTrueFalse) return 'choice';
  return index === 0 ? 'true' : 'false';
}

/** Đáp án ngắn → lưới 2 cột như Figma; đáp án dài → mỗi đáp án một dòng. */
function chunkChoices(choices: Choice[]): Choice[][] {
  const twoColumns = choices.length % 2 === 0 && choices.every((c) => c.content.length <= 10);
  if (!twoColumns) return choices.map((c) => [c]);
  const rows: Choice[][] = [];
  for (let i = 0; i < choices.length; i += 2) rows.push(choices.slice(i, i + 2));
  return rows;
}

/** Màn làm bài — Figma "A3 · Làm bài" (Style A – Game hoá). */
export default function ExamScreen({ navigation, route }: Props) {
  const { roundId, roundTitle } = route.params;
  const insets = useSafeAreaInsets();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [index, setIndex] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // RTK Query mutations: tạo lượt thi & nộp bài (nộp xong tự invalidate cache Lịch sử).
  const [startAttempt] = useStartAttemptMutation();
  const [submitAttempt, { isLoading: submitting }] = useSubmitAttemptMutation();
  const submittedRef = useRef(false);
  const startedRef = useRef(false);

  const start = useCallback(async () => {
    setLoadError(null);
    try {
      setAttempt(await startAttempt(roundId).unwrap());
    } catch (e) {
      setLoadError(queryErrorMessage(e));
    }
  }, [roundId, startAttempt]);

  useEffect(() => {
    // Tránh tạo 2 lượt thi khi effect chạy lại (StrictMode).
    if (startedRef.current) return;
    startedRef.current = true;
    void start();
  }, [start]);

  const submit = useCallback(async () => {
    if (!attempt || submittedRef.current) return;
    submittedRef.current = true;
    setSubmitError(null);
    try {
      const result = await submitAttempt({
        attemptId: attempt.id,
        body: {
          answers: attempt.questions.map((q) => ({ questionId: q.id, choiceId: answers[q.id] ?? null })),
        },
      }).unwrap();
      const durationSeconds = Math.max(
        0,
        Math.round((Date.now() - new Date(attempt.startedAt).getTime()) / 1000),
      );
      navigation.replace('Result', { result, durationSeconds });
    } catch (e) {
      submittedRef.current = false;
      setSubmitError(queryErrorMessage(e));
    }
  }, [attempt, answers, navigation, submitAttempt]);

  const { label: timeLeft, secondsLeft } = useCountdown(attempt?.expiresAt ?? null, () => {
    void submit();
  });

  // Hỏi lại trước khi thoát giữa chừng (nút quay lại, nút back Android, cử chỉ).
  usePreventRemove(attempt != null, ({ data }) => {
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

  const handleSubmitPress = async () => {
    if (!attempt) return;
    const unanswered = attempt.questions.length - Object.keys(answers).length;
    const message =
      unanswered > 0
        ? `Bạn còn ${unanswered} câu chưa trả lời. Vẫn nộp bài?`
        : 'Bạn chắc chắn muốn nộp bài?';
    if (await confirm('Nộp bài', message, { confirmText: 'Nộp bài' })) void submit();
  };

  const header = (
    <CircleButton icon="arrow-back" accessibilityLabel="Quay lại" onPress={navigation.goBack} />
  );

  if (!attempt || attempt.questions.length === 0) {
    const message = loadError ?? (attempt ? 'Vòng thi này chưa có câu hỏi.' : null);
    return (
      <OceanBackground>
        <StatusBar style="light" />
        <View style={[styles.page, { paddingTop: insets.top + 4 }]}>
          <View style={styles.headerRow}>{header}</View>
          <View style={styles.center}>
            {message ? (
              <GameBoard style={styles.messageBoard}>
                <Text style={styles.questionText}>{message}</Text>
                {loadError ? <GameButton label="Thử lại" onPress={start} /> : null}
              </GameBoard>
            ) : (
              <ActivityIndicator size="large" color="#ffffff" />
            )}
          </View>
        </View>
      </OceanBackground>
    );
  }

  const question = attempt.questions[index];
  const total = attempt.questions.length;
  const isLast = index === total - 1;
  const answeredCount = Object.keys(answers).length;
  const currentAnswered = answers[question.id] != null;
  const selectedId = answers[question.id];

  const bubbleText =
    secondsLeft > 0 && secondsLeft <= 60
      ? 'Sắp hết giờ rồi, nhanh tay lên nhé!'
      : isLast
        ? 'Câu cuối rồi, cố lên nào!'
        : currentAnswered
          ? 'Tuyệt! Bấm Trả lời để sang câu tiếp nhé.'
          : 'Đọc kỹ nhé, bạn làm được mà!';

  const goNext = () => {
    if (isLast) void handleSubmitPress();
    else setIndex((i) => i + 1);
  };

  return (
    <OceanBackground>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 4 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.page}>
          {/* Thanh trên: quay lại + các bước */}
          <View style={styles.headerRow}>
            {header}
            <StepProgress
              total={total}
              current={index}
              isAnswered={(i) => answers[attempt.questions[i].id] != null}
              onSelect={setIndex}
            />
          </View>

          {/* Info bar: đồng hồ · đã làm · câu hiện tại */}
          <LinearGradient colors={gameGradients.infoBar} style={styles.infoBar}>
            {/* Sắp hết giờ (≤ 60s) → đồng hồ đỏ và phập phồng. */}
            <Pulse active={secondsLeft > 0 && secondsLeft <= 60} scale={1.1}>
              <LinearGradient
                colors={secondsLeft <= 60 ? gameGradients.redAnswer : gameGradients.timerPill}
                style={styles.timer}
              >
                <Ionicons name="time-outline" size={18} color="#ffffff" />
                <Text style={styles.timerText}>{timeLeft}</Text>
              </LinearGradient>
            </Pulse>
            <View style={styles.infoItem}>
              <StarIcon size={20} />
              <Text style={styles.infoText}>Đã làm: {answeredCount}</Text>
            </View>
            <Text style={styles.infoMuted}>
              Câu {index + 1}/{total}
            </Text>
          </LinearGradient>

          <View style={styles.roundChip}>
            <Text style={styles.roundChipText} numberOfLines={1}>
              Đề: {roundTitle}
            </Text>
          </View>

          {/* Question board — đổi câu thì bảng trượt vào từ bên phải (key theo câu). */}
          <Animated.View key={index} entering={FadeInRight.duration(280)}>
            <GameBoard style={styles.board}>
              <View style={styles.questionRow}>
                <LinearGradient colors={gameGradients.blueCircle} style={styles.questionBadge}>
                  <Text style={styles.questionBadgeText}>{index + 1}</Text>
                </LinearGradient>
                <Text style={styles.questionText}>{question.content}</Text>
              </View>

              <View style={styles.answers} accessibilityRole="radiogroup">
                {chunkChoices(question.choices).map((row) => (
                  <View key={row[0].id} style={styles.answerRow}>
                    {row.map((choice) => {
                      const i = question.choices.indexOf(choice);
                      return (
                        <AnswerButton
                          key={choice.id}
                          kind={kindFor(question.choices, i)}
                          label={choice.content}
                          letter={LETTERS[i]}
                          selected={selectedId === choice.id}
                          dimmed={selectedId != null && selectedId !== choice.id}
                          disabled={submitting}
                          onPress={() => setAnswers((prev) => ({ ...prev, [question.id]: choice.id }))}
                          style={styles.answer}
                        />
                      );
                    })}
                  </View>
                ))}
              </View>
            </GameBoard>
          </Animated.View>

          {submitError ? <Text style={styles.error}>{submitError}</Text> : null}

          <View style={styles.spacer} />

          {/* Mascot + bong bóng + nút trả lời */}
          <View style={styles.footer}>
            <Float style={styles.octopus} distance={10}>
              <Emoji name="octopus" size={140} />
            </Float>
            {/* Đổi lời thoại → bong bóng nảy lại (key theo nội dung). */}
            <PopIn key={bubbleText} style={styles.bubble}>
              <SpeechBubble text={bubbleText} />
            </PopIn>
            <GameButton
              label={isLast ? 'Nộp bài' : 'Trả lời'}
              onPress={goNext}
              disabled={!isLast && !currentAnswered}
              loading={submitting}
              pulse={!submitting && (isLast || currentAnswered)}
              style={styles.answerButton}
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
    paddingBottom: 80,
  },
  page: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
  },
  infoBar: {
    height: 48,
    marginTop: 10,
    marginHorizontal: 16,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 18,
    borderWidth: 3,
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
    fontSize: 18,
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
    fontSize: 15,
    color: gameColors.ink,
  },
  infoMuted: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 15,
    color: gameColors.inkMuted,
    paddingRight: 4,
  },
  roundChip: {
    alignSelf: 'flex-start',
    maxWidth: '90%',
    marginTop: 12,
    marginLeft: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  roundChipText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 12,
    color: '#ffffff',
  },
  board: {
    marginTop: 12,
    marginHorizontal: 16,
    gap: 14,
  },
  messageBoard: {
    gap: 16,
    alignItems: 'center',
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  questionBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: gameShadows.circle,
  },
  questionBadgeText: {
    fontFamily: gameFonts.display,
    fontSize: 24,
    color: '#ffffff',
  },
  questionText: {
    flex: 1,
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 17,
    lineHeight: 22,
    color: gameColors.navy,
  },
  answers: {
    gap: 12,
  },
  answerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  answer: {
    flex: 1,
  },
  error: {
    marginTop: 12,
    marginHorizontal: 16,
    padding: 8,
    borderRadius: 12,
    backgroundColor: gameColors.reviewFill,
    fontFamily: gameFonts.bodyExtraBold,
    color: gameColors.redDark,
    textAlign: 'center',
  },
  spacer: {
    flexGrow: 1,
    minHeight: 12,
  },
  // Figma: bong bóng y=560, bạch tuộc y=612, nút y=686 (cao 78) → khung 204px.
  footer: {
    height: 204,
  },
  octopus: {
    position: 'absolute',
    left: 4,
    top: 52,
  },
  bubble: {
    position: 'absolute',
    left: 150,
    top: 0,
  },
  answerButton: {
    position: 'absolute',
    right: 20,
    top: 126,
  },
});
