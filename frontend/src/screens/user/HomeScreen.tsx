import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useLayoutEffect, useState } from 'react';
import {
  Alert,
  ImageBackground,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { YStack } from 'tamagui';
import Emoji from '../../components/Emoji';
import type { EmojiName } from '../../components/emojiAssets';
import { GameButton, WoodLabel } from '../../components/game';
import { Animated, listEntering } from '../../components/motion';
import AssignmentCard from '../../components/Home/AssignmentCard';
import CurrentSeason from '../../components/Home/CurrentSeason';
import LearningProgress from '../../components/Home/LearningProgress';
import PracticeCard from '../../components/Home/PracticeCard';
import StudentHeader from '../../components/Home/StudentHeader';
import { useAuth } from '../../hooks/useAuth';
import { useResponsive } from '../../hooks/useResponsive';
import type { UserStackParamList, UserTabParamList } from '../../navigation/types';
import {
  getRuntimeAttempts,
  learningProgress,
  mockRounds,
  practiceCategories,
  seasons,
  studentInfo,
  subscribeToStore,
  teacherAssignments,
  type ExamAttempt,
  type PracticeCategory,
  type SeasonRound,
  type TeacherAssignment,
} from '../../services/mock/data';
import { gameFonts, spacing } from '../../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<UserTabParamList, 'Home'>,
  NativeStackScreenProps<UserStackParamList>
>;

export default function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { isLandscape, isTablet } = useResponsive();
  const [attempts, setAttempts] = useState<ExamAttempt[]>(getRuntimeAttempts());
  const [topicModalVisible, setTopicModalVisible] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Cập nhật lại khi màn hình được focus hoặc có thay đổi trong store
  useFocusEffect(
    useCallback(() => {
      setAttempts([...getRuntimeAttempts()]);
      const unsubscribe = subscribeToStore(() => {
        setAttempts([...getRuntimeAttempts()]);
      });
      return unsubscribe;
    }, [])
  );

  // Chỉ lấy đợt thi hiện tại (ACTIVE)
  const activeSeason = seasons.find((s) => s.status === 'ACTIVE') ?? seasons[0];
  const activeRounds = mockRounds.filter((r) => r.seasonId === activeSeason.id);

  // Đồng bộ trạng thái đề giáo viên giao với dữ liệu làm bài thực tế
  const syncedAssignments: TeacherAssignment[] = teacherAssignments.map((item) => {
    const foundAttempt = attempts.find(
      (a) => a.roundId === item.roundId && a.examId === item.examId
    );
    if (foundAttempt) {
      return {
        ...item,
        isCompleted: true,
        score: foundAttempt.score,
      };
    }
    return item;
  });

  // Tính tiến độ học tập động theo số bài đã làm trong đợt hiện tại
  const activeCompletedExams = attempts.filter((a) => a.seasonId === activeSeason.id).length;
  const completedLessonsCount = Math.max(learningProgress.completed, activeCompletedExams);

  // Xử lý khi bấm vào một vòng thi
  const handleSelectRound = (round: SeasonRound) => {
    if (round.status === 'LOCKED') {
      const title = 'Vòng này chưa mở';
      const msg = 'Vòng này đang tạm khóa. Bạn hãy hoàn thành các bài thi đang mở nhé!';
      if (Platform.OS === 'web') {
        globalThis.alert?.(`${title}\n\n${msg}`);
      } else {
        Alert.alert(title, msg);
      }
      return;
    }
    (navigation.navigate as any)('RoundList', { focusRoundId: round.id });
  };

  // Bắt đầu làm bài kiểm tra giáo viên giao
  const handleStartAssignment = (item: TeacherAssignment) => {
    const round = mockRounds.find((r) => r.id === item.roundId);
    (navigation.navigate as any)('Exam', {
      roundId: item.roundId,
      roundTitle: round?.title || 'Vòng 02 — Khám phá',
      examId: item.examId,
      mode: 'exam',
    });
  };

  // Xem kết quả đề giáo viên giao đã làm
  const handleViewAssignmentResult = (item: TeacherAssignment) => {
    const attempt = attempts.find(
      (a) => a.roundId === item.roundId && a.examId === item.examId
    );
    if (attempt) {
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
        fromHistory: true,
      });
    } else {
      const round = mockRounds.find((r) => r.id === item.roundId);
      const score = item.score ?? 90;
      (navigation.navigate as any)('Result', {
        result: {
          attemptId: 901,
          roundId: item.roundId,
          roundTitle: round?.title || item.title,
          score,
          correctCount: Math.round(score / 10),
          totalQuestions: item.questionCount,
          submittedAt: new Date().toISOString(),
        },
        durationSeconds: 420,
        fromHistory: true,
      });
    }
  };

  // Ôn theo vòng
  const handlePracticeRound = () => {
    (navigation.navigate as any)('RoundList', { focusRoundId: 1 });
  };

  // Luyện theo chủ đề (mở Modal chọn chủ đề tương thích cả Web & Mobile)
  const handlePracticeTopic = () => {
    setTopicModalVisible(true);
  };

  const handleSelectTopicCategory = (cat: PracticeCategory) => {
    setTopicModalVisible(false);
    const examMap: Record<string, number> = {
      vocab: 201,
      grammar: 202,
      listening: 203,
      image: 201,
    };
    (navigation.navigate as any)('Exam', {
      roundId: 2,
      roundTitle: `Luyện chủ đề: ${cat.title}`,
      examId: examMap[cat.id] || 201,
      mode: 'practice',
    });
  };

  return (
    <ImageBackground
      source={require('../../../assets/background/Home.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          (isLandscape || isTablet) && styles.scrollContentWide,
          {
            paddingTop: insets.top > 0 ? insets.top + 8 : 16,
            paddingBottom: insets.bottom > 0 ? insets.bottom + 24 : 32,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1 & 2: Header + Chào học sinh + Xu + Streak */}
        <Animated.View entering={listEntering(0)}>
          <StudentHeader
            student={{
              ...studentInfo,
              name: user?.fullName || studentInfo.name,
            }}
            onPressProfile={() => navigation.navigate('Profile')}
          />
        </Animated.View>

        {/* 3: Nút lớn Bắt đầu ôn tập */}
        <Animated.View entering={listEntering(1)}>
          <GameButton
            label="Bắt đầu ôn tập"
            pulse
            onPress={() => navigation.navigate('RoundList')}
            style={styles.bigButton}
          />
        </Animated.View>

        {/* 4: Đợt thi hiện tại (Active) */}
        <Animated.View entering={listEntering(2)}>
          <CurrentSeason
            season={activeSeason}
            rounds={activeRounds}
            attempts={attempts}
            onSelectRound={handleSelectRound}
            onViewAllRounds={() => navigation.navigate('RoundList')}
          />
        </Animated.View>

        {/* 5: Đề kiểm tra giáo viên giao */}
        <Animated.View entering={listEntering(3)}>
          <AssignmentCard
            assignments={syncedAssignments}
            onStartAssignment={handleStartAssignment}
            onViewResult={handleViewAssignmentResult}
          />
        </Animated.View>

        {/* 6: Ôn tập nhanh */}
        <Animated.View entering={listEntering(4)}>
          <PracticeCard
            onPracticeRound={handlePracticeRound}
            onPracticeTopic={handlePracticeTopic}
          />
        </Animated.View>

        {/* 7: Tiến độ học tập */}
        <Animated.View entering={listEntering(5)}>
          <LearningProgress
            completed={completedLessonsCount}
            total={learningProgress.total}
            quote={learningProgress.quote}
          />
        </Animated.View>
      </ScrollView>

      {/* Modal chọn chủ đề luyện tập */}
      <Modal
        visible={topicModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTopicModalVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setTopicModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <WoodLabel text="Luyện theo chủ đề" fontSize={16} />
            <Text style={styles.modalSub}>
              Chọn chủ đề bạn muốn ôn luyện (có giải thích chi tiết từng câu):
            </Text>

            <YStack width="100%" gap={8}>
              {practiceCategories.map((cat) => (
                <Pressable
                  key={cat.id}
                  accessibilityRole="button"
                  onPress={() => handleSelectTopicCategory(cat)}
                  style={({ pressed }) => [
                    styles.topicItem,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <View style={[styles.topicIconWrap, { backgroundColor: cat.color + '18' }]}>
                    <Emoji name={cat.icon as EmojiName} size={26} />
                  </View>
                  <YStack flex={1} gap={2}>
                    <Text style={styles.topicTitle}>{cat.title}</Text>
                    <Text style={styles.topicDesc}>{cat.description}</Text>
                  </YStack>
                  <Ionicons name="play-circle" size={24} color={cat.color} />
                </Pressable>
              ))}
            </YStack>

            <Pressable
              accessibilityRole="button"
              onPress={() => setTopicModalVisible(false)}
              style={styles.modalCloseBtn}
            >
              <Text style={styles.modalCloseText}>Đóng</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5CB4F8',
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: 16,
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
  },
  scrollContentWide: {
    maxWidth: 880,
  },
  bigButton: {
    width: '100%',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#fffdf8',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#fed7aa',
    padding: 18,
    alignItems: 'center',
    gap: 12,
  },
  modalSub: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
  },
  topicList: {
    width: '100%',
    gap: 8,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    padding: 10,
  },
  topicIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicInfo: {
    flex: 1,
    gap: 2,
  },
  topicTitle: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 14,
    color: '#1e293b',
  },
  topicDesc: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 11,
    color: '#64748b',
  },
  modalCloseBtn: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    marginTop: 2,
  },
  modalCloseText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 13,
    color: '#334155',
  },
});
