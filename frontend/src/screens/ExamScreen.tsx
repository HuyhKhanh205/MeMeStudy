import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme';
import {
  PlayfulButton,
  OptionButton,
  OceanStepper,
  AudioWaveVisualizer,
  MascotBubble,
} from '../components';
import { mockExamQuestions } from '../utils/mockData';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ExamRouteProp = RouteProp<RootStackParamList, 'Exam'>;

export const ExamScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ExamRouteProp>();

  const roundTitle = route.params?.roundTitle || 'Đề: Unit 5 – My hobbies • Cô Lan giao';

  const [currentIndex, setCurrentIndex] = useState(2); // Mặc định ở câu 3 như ảnh
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
  const [score, setScore] = useState(20);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const currentQ = mockExamQuestions[currentIndex] || mockExamQuestions[0];
  const totalQuestions = 10;
  const currentAnswer = selectedAnswers[currentQ.id];

  const handleSelect = (answer: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQ.id]: answer,
    });
  };

  const handleSubmitAnswer = () => {
    // Tăng điểm nhẹ nếu chọn đúng
    if (currentAnswer) {
      setScore((prev) => prev + 10);
    }

    if (currentIndex < mockExamQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Hết bài thi -> chuyển sang màn Kết quả (Màn 4)
      navigation.replace('Result', {
        score: 8,
        totalQuestions: 10,
        starsEarned: 80,
        timeTaken: '12:40',
        roundTitle: roundTitle,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. Header: Back & Ocean Stepper */}
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </Pressable>

        <View style={styles.stepperContainer}>
          <OceanStepper
            currentQuestion={currentIndex + 1}
            totalQuestions={totalQuestions}
            timeRemaining="00:32"
            currentScore={score}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Tiêu đề đề ôn */}
        <Text style={styles.examSubtitle}>{roundTitle}</Text>

        {/* 3. Thẻ Card Câu Hỏi Trắng Bo Tròn Lớn */}
        <View style={styles.questionCard}>
          {/* Lớp bóng đáy */}
          <View style={styles.cardShadowLayer} />

          <View style={styles.cardFace}>
            {/* Header câu hỏi: Icon loa lớn + Hướng dẫn */}
            <View style={styles.instructionRow}>
              <View style={styles.speakerBigCircle}>
                <Ionicons name="volume-high" size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.instructionText}>
                {currentQ.instruction}
              </Text>
            </View>

            {/* Sóng âm & câu thoại Audio nếu là dạng true_false hoặc listening */}
            {currentQ.type === 'true_false' && (
              <AudioWaveVisualizer
                sentence={currentQ.sentence}
                isPlaying={isPlayingAudio}
                onTogglePlay={() => setIsPlayingAudio(!isPlayingAudio)}
              />
            )}

            {/* Nội dung câu trắc nghiệm thông thường */}
            {currentQ.type === 'choice' && (
              <Text style={styles.choiceQuestionText}>
                {currentQ.content}
              </Text>
            )}

            {/* Các nút lựa chọn đáp án */}
            <View style={styles.optionsArea}>
              {currentQ.type === 'true_false' ? (
                // 2 nút True / False bóng bẩy như Ảnh 4
                <View style={styles.trueFalseRow}>
                  <OptionButton
                    type="true"
                    text="True"
                    isSelected={currentAnswer === 'True'}
                    onPress={() => handleSelect('True')}
                  />
                  <OptionButton
                    type="false"
                    text="False"
                    isSelected={currentAnswer === 'False'}
                    onPress={() => handleSelect('False')}
                  />
                </View>
              ) : (
                // 4 nút trắc nghiệm A, B, C, D
                currentQ.options?.map((opt) => (
                  <OptionButton
                    key={opt.key}
                    type="choice"
                    label={opt.key}
                    text={opt.text}
                    isSelected={currentAnswer === opt.key}
                    onPress={() => handleSelect(opt.key)}
                  />
                ))
              )}
            </View>
          </View>
        </View>

        {/* 4. Mascot Bạch Tuộc Hồng Dưới Biển */}
        <View style={styles.mascotOceanRow}>
          <MascotBubble
            type="octopus"
            message="Nghe kỹ nhé, bạn làm được mà!"
          />
        </View>

        {/* 5. Nút to 3D "Trả lời" & Rương kho báu */}
        <View style={styles.submitRow}>
          <PlayfulButton
            title="Trả lời"
            variant="orange"
            size="large"
            showPlayIcon={true}
            onPress={handleSubmitAnswer}
            style={styles.answerButton}
          />

          {/* Rương kho báu vàng */}
          <View style={styles.chestWrapper}>
            <Ionicons name="cube" size={32} color="#F39C12" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2980B9', // Nền xanh đại dương sinh động
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1F618D',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    marginTop: 18,
  },
  stepperContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  examSubtitle: {
    color: '#D4E6F1',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 4,
  },
  questionCard: {
    position: 'relative',
    marginTop: 8,
    width: '100%',
  },
  cardShadowLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    backgroundColor: '#1A5276',
    borderRadius: 24,
    top: 4,
  },
  cardFace: {
    backgroundColor: '#FFFDF9',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#EBF5FB',
    padding: 16,
    minHeight: 260,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  speakerBigCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#3498DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#1F618D',
    lineHeight: 20,
  },
  choiceQuestionText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textDark,
    marginVertical: 14,
    textAlign: 'center',
    lineHeight: 24,
  },
  optionsArea: {
    marginTop: 12,
  },
  trueFalseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  mascotOceanRow: {
    marginTop: 14,
  },
  submitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    position: 'relative',
  },
  answerButton: {
    width: '70%',
  },
  chestWrapper: {
    position: 'absolute',
    right: 8,
    bottom: 4,
    backgroundColor: '#FAD7A0',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F39C12',
  },
});

