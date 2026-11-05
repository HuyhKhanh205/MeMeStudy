import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import PrimaryButton from '../components/PrimaryButton';
import { colors, spacing } from '../utils/constants';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Lesson'>;

export default function LessonScreen({ route, navigation }: Props) {
  const { lesson } = route.params;
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const exercise = lesson.exercises[index];

  if (!exercise) {
    return (
      <View style={styles.container}>
        <Text style={styles.question}>Hoàn thành bài học!</Text>
        <Text style={styles.summary}>
          Đúng {correctCount}/{lesson.exercises.length} câu · +{lesson.xp} XP
        </Text>
        <PrimaryButton title="Tiếp tục" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const isCorrect = selected === exercise.answerIndex;

  const handleCheck = () => {
    if (!checked) {
      setChecked(true);
      if (isCorrect) setCorrectCount((count) => count + 1);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setChecked(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(index / lesson.exercises.length) * 100}%` }]} />
      </View>

      <Text style={styles.question}>{exercise.question}</Text>

      <View style={styles.options}>
        {exercise.options.map((option, optionIndex) => (
          <Pressable
            key={option}
            disabled={checked}
            onPress={() => setSelected(optionIndex)}
            style={[styles.option, selected === optionIndex && styles.optionSelected]}
          >
            <Text style={styles.optionText}>{option}</Text>
          </Pressable>
        ))}
      </View>

      {checked && (
        <Text style={[styles.feedback, { color: isCorrect ? colors.primary : colors.danger }]}>
          {isCorrect ? 'Chính xác!' : `Đáp án đúng: ${exercise.options[exercise.answerIndex]}`}
        </Text>
      )}

      <PrimaryButton
        title={checked ? 'Tiếp tục' : 'Kiểm tra'}
        disabled={selected === null}
        onPress={handleCheck}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.lg,
    backgroundColor: colors.background,
  },
  progressTrack: {
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  question: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  summary: {
    fontSize: 16,
    color: colors.textMuted,
  },
  options: {
    flex: 1,
    gap: spacing.sm,
  },
  option: {
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.md,
  },
  optionSelected: {
    borderColor: colors.secondary,
    backgroundColor: '#DDF4FF',
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  },
  feedback: {
    fontSize: 18,
    fontWeight: '700',
  },
});
