import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useLayoutEffect, useState } from 'react';
import {
  Alert,
  ImageBackground,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GameButton } from '../../components/game';
import AssignmentCard from '../../components/Home/AssignmentCard';
import CurrentSeason from '../../components/Home/CurrentSeason';
import LearningProgress from '../../components/Home/LearningProgress';
import PracticeCard from '../../components/Home/PracticeCard';
import StudentHeader from '../../components/Home/StudentHeader';
import { useAuth } from '../../hooks/useAuth';
import type { UserStackParamList, UserTabParamList } from '../../navigation/types';
import {
  getRuntimeAttempts,
  learningProgress,
  mockExams,
  mockRounds,
  seasons,
  studentInfo,
  subscribeToStore,
  teacherAssignments,
  type ExamAttempt,
  type SeasonRound,
  type TeacherAssignment,
} from '../../services/mock/data';
import { spacing } from '../../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<UserTabParamList, 'Home'>,
  NativeStackScreenProps<UserStackParamList>
>;

export default function HomeScreen({ navigation }: Props) {
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [attempts, setAttempts] = useState<ExamAttempt[]>(getRuntimeAttempts());

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

  // Xử lý khi bấm vào một vòng thi
  const handleSelectRound = (round: SeasonRound) => {
    if (round.status === 'LOCKED') {
      Alert.alert('Vòng thi chưa mở', 'Vòng này đang tạm khóa. Bạn hãy hoàn thành vòng trước nhé!');
      return;
    }
    navigation.navigate('RoundList');
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
    const attempt = attempts.find((a) => a.examId === item.examId);
    if (attempt) {
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
    } else {
      Alert.alert('Kết quả', `Bạn đã đạt ${item.score}/100 điểm cho bài ${item.title}.`);
    }
  };

  // Ôn theo vòng
  const handlePracticeRound = () => {
    navigation.navigate('RoundList');
  };

  // Luyện theo chủ đề
  const handlePracticeTopic = () => {
    Alert.alert(
      'Luyện theo chủ đề',
      'Chọn chủ đề bạn muốn rèn luyện ngay:',
      [
        {
          text: 'Từ vựng & Hình ảnh',
          onPress: () => {
            (navigation.navigate as any)('Exam', {
              roundId: 2,
              roundTitle: 'Luyện chủ đề: Từ vựng & Hình ảnh',
              examId: 201,
              mode: 'practice',
            });
          },
        },
        {
          text: 'Ngữ pháp & Hội thoại',
          onPress: () => {
            (navigation.navigate as any)('Exam', {
              roundId: 2,
              roundTitle: 'Luyện chủ đề: Ngữ pháp & Hội thoại',
              examId: 202,
              mode: 'practice',
            });
          },
        },
        { text: 'Đóng', style: 'cancel' },
      ]
    );
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
          {
            paddingTop: insets.top > 0 ? insets.top + 8 : 16,
            paddingBottom: insets.bottom > 0 ? insets.bottom + 24 : 32,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1 & 2: Header + Chào học sinh + Xu + Streak */}
        <StudentHeader student={studentInfo} onLogout={logout} />

        {/* 3: Nút lớn Bắt đầu ôn tập */}
        <GameButton
          label="Bắt đầu ôn tập"
          pulse
          onPress={() => navigation.navigate('RoundList')}
          style={styles.bigButton}
        />

        {/* 4: Đợt thi hiện tại (Active) */}
        <CurrentSeason
          season={activeSeason}
          rounds={activeRounds}
          attempts={attempts}
          onSelectRound={handleSelectRound}
          onViewAllRounds={() => navigation.navigate('RoundList')}
        />

        {/* 5: Đề kiểm tra giáo viên giao */}
        <AssignmentCard
          assignments={teacherAssignments}
          onStartAssignment={handleStartAssignment}
          onViewResult={handleViewAssignmentResult}
        />

        {/* 6: Ôn tập nhanh */}
        <PracticeCard
          onPracticeRound={handlePracticeRound}
          onPracticeTopic={handlePracticeTopic}
        />

        {/* 7: Tiến độ học tập */}
        <LearningProgress
          completed={learningProgress.completed}
          total={learningProgress.total}
          quote={learningProgress.quote}
        />
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5CB4F8',
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: 16,
  },
  bigButton: {
    width: '100%',
  },
});
