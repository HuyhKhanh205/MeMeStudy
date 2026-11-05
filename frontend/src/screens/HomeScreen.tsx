import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LessonNode from '../components/LessonNode';
import StateView from '../components/StateView';
import { useCourses } from '../hooks/useCourses';
import { colors, spacing } from '../utils/constants';
import type { RootStackParamList } from '../navigation/types';

const ZIGZAG = [0, 40, 60, 40, 0, -40, -60, -40];

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: courses, loading, error, reload } = useCourses();

  if (!courses) {
    return <StateView loading={loading} error={error} onRetry={reload} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {courses.map((course) =>
        course.units.map((unit) => (
          <View key={unit.id} style={styles.unit}>
            <View style={styles.unitHeader}>
              <Text style={styles.courseTitle}>{course.title}</Text>
              <Text style={styles.unitTitle}>{unit.title}</Text>
            </View>
            {unit.lessons.map((lesson, index) => (
              <LessonNode
                key={lesson.id}
                lesson={lesson}
                offset={ZIGZAG[index % ZIGZAG.length]}
                onPress={() => navigation.navigate('Lesson', { lesson })}
              />
            ))}
          </View>
        )),
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  unit: {
    marginBottom: spacing.lg,
  },
  unitHeader: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  courseTitle: {
    color: colors.white,
    opacity: 0.8,
    fontWeight: '600',
  },
  unitTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
});
