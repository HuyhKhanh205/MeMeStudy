import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../utils/constants';
import type { Lesson } from '../types';

interface Props {
  lesson: Lesson;
  offset: number;
  onPress: () => void;
}

/** A round lesson bubble on the learning path, shifted left/right to form a zigzag. */
export default function LessonNode({ lesson, offset, onPress }: Props) {
  return (
    <View style={[styles.wrapper, { transform: [{ translateX: offset }] }]}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.node, pressed && styles.pressed]}>
        <Ionicons name="star" size={32} color={colors.white} />
      </Pressable>
      <Text style={styles.title}>{lesson.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  node: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    borderBottomColor: colors.primaryDark,
    borderBottomWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    borderBottomWidth: 2,
  },
  title: {
    marginTop: spacing.xs,
    color: colors.text,
    fontWeight: '600',
  },
});
