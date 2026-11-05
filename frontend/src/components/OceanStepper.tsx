import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

interface OceanStepperProps {
  currentQuestion: number;
  totalQuestions: number;
  timeRemaining?: string;
  currentScore?: number;
  style?: StyleProp<ViewStyle>;
}

export const OceanStepper: React.FC<OceanStepperProps> = ({
  currentQuestion = 3,
  totalQuestions = 10,
  timeRemaining = '00:32',
  currentScore = 20,
  style,
}) => {
  // Hiển thị tối đa 5 bước trên thanh và đích là ngôi sao
  const steps = [1, 2, 3, 4, 5];

  return (
    <View style={[styles.container, style]}>
      {/* Chuỗi các bóng tròn tiến độ */}
      <View style={styles.bubbleRow}>
        {steps.map((step, idx) => {
          const isDone = step < currentQuestion;
          const isCurrent = step === currentQuestion;

          return (
            <React.Fragment key={step}>
              {/* Bóng tròn */}
              <View
                style={[
                  styles.circleStep,
                  isDone && styles.doneCircle,
                  isCurrent && styles.currentCircle,
                  !isDone && !isCurrent && styles.pendingCircle,
                ]}
              >
                {isDone ? (
                  <Ionicons name="checkmark-sharp" size={14} color="#FFFFFF" />
                ) : (
                  <Text
                    style={[
                      styles.stepNumberText,
                      isCurrent ? styles.currentText : styles.pendingText,
                    ]}
                  >
                    {step}
                  </Text>
                )}
              </View>

              {/* Đường nối */}
              {idx < steps.length - 1 && (
                <View
                  style={[
                    styles.connectorLine,
                    step < currentQuestion ? styles.doneLine : styles.pendingLine,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}

        {/* Đường nối đến đích */}
        <View style={styles.connectorLine} />

        {/* Ngôi sao phần thưởng đích đến */}
        <View style={styles.starCircle}>
          <Ionicons name="star" size={16} color="#FFD700" />
        </View>
      </View>

      {/* Viên thuốc cam chứa Thời gian, Điểm, Câu x/y */}
      <View style={styles.statCapsule}>
        {/* Thời gian */}
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={16} color="#FFFFFF" />
          <Text style={styles.statText}>{timeRemaining}</Text>
        </View>

        {/* Điểm số */}
        <View style={styles.statItem}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.statText}>Điểm: {currentScore}</Text>
        </View>

        {/* Vị trí câu hỏi */}
        <View style={styles.statItemRight}>
          <Text style={styles.questionProgressText}>
            Câu {currentQuestion}/{totalQuestions}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    marginVertical: 6,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  circleStep: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  doneCircle: {
    backgroundColor: '#2ECC71',
    borderColor: '#58D68D',
  },
  currentCircle: {
    backgroundColor: '#F39C12',
    borderColor: '#FAD7A0',
    transform: [{ scale: 1.15 }],
  },
  pendingCircle: {
    backgroundColor: '#5DADE2',
    borderColor: '#A9CCE3',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '800',
  },
  currentText: {
    color: '#FFFFFF',
  },
  pendingText: {
    color: '#EBF5FB',
  },
  connectorLine: {
    height: 3,
    width: 14,
    backgroundColor: '#5DADE2',
  },
  doneLine: {
    backgroundColor: '#2ECC71',
  },
  pendingLine: {
    backgroundColor: '#5DADE2',
  },
  starCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FFD700',
  },
  statCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.orangeMain,
    borderRadius: 22,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#FFA726',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  statItemRight: {
    marginLeft: 'auto',
  },
  statText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    marginLeft: 5,
  },
  questionProgressText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});

