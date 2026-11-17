import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import { Text, XStack } from 'tamagui';
import Button from '../../components/Button';
import Card from '../../components/Card';
import EmojiBadge from '../../components/EmojiBadge';
import { Animated, listEntering } from '../../components/motion';
import Screen from '../../components/Screen';
import { useAuth } from '../../hooks/useAuth';
import type { AdminStackParamList } from '../../navigation/types';
import { queryErrorMessage, useGetQuestionsQuery, useGetRoundsQuery } from '../../store/api';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AdminStackParamList, 'Dashboard'>;

export default function DashboardScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  // Dùng chung cache với QuestionList/ExamList: vào màn con không phải tải lại.
  const questionsQuery = useGetQuestionsQuery();
  const roundsQuery = useGetRoundsQuery();

  const stats =
    questionsQuery.data && roundsQuery.data
      ? {
          questions: questionsQuery.data.length,
          rounds: roundsQuery.data.length,
          openRounds: roundsQuery.data.filter((r) => r.isOpen).length,
        }
      : null;
  const error = queryErrorMessage(questionsQuery.error) ?? queryErrorMessage(roundsQuery.error);

  return (
    <Screen scroll contentStyle={styles.content}>
      <Text
        fontSize={typography.heading.fontSize}
        fontWeight={typography.heading.fontWeight}
        lineHeight={typography.heading.lineHeight}
        color={colors.text}
      >
        Xin chào, {user?.fullName}
      </Text>

      <Animated.View entering={listEntering(0)}>
        <XStack gap={spacing.sm}>
          <Card style={styles.stat}>
            <EmojiBadge name="redQuestionMark" tone="rose" size={48} />
            <Text
              fontSize={typography.title.fontSize}
              fontWeight={typography.title.fontWeight}
              lineHeight={typography.title.lineHeight}
              color={colors.primary}
            >
              {stats?.questions ?? '–'}
            </Text>
            <Text
              fontSize={typography.caption.fontSize}
              fontWeight={typography.caption.fontWeight}
              lineHeight={typography.caption.lineHeight}
              color={colors.textMuted}
            >
              Câu hỏi
            </Text>
          </Card>
          <Card style={styles.stat}>
            <EmojiBadge name="clipboard" tone="sky" size={48} />
            <Text
              fontSize={typography.title.fontSize}
              fontWeight={typography.title.fontWeight}
              lineHeight={typography.title.lineHeight}
              color={colors.primary}
            >
              {stats?.rounds ?? '–'}
            </Text>
            <Text
              fontSize={typography.caption.fontSize}
              fontWeight={typography.caption.fontWeight}
              lineHeight={typography.caption.lineHeight}
              color={colors.textMuted}
            >
              Vòng thi
            </Text>
          </Card>
          <Card style={styles.stat}>
            <EmojiBadge name="hourglass" tone="mint" size={48} />
            <Text
              fontSize={typography.title.fontSize}
              fontWeight={typography.title.fontWeight}
              lineHeight={typography.title.lineHeight}
              color={colors.primary}
            >
              {stats?.openRounds ?? '–'}
            </Text>
            <Text
              fontSize={typography.caption.fontSize}
              fontWeight={typography.caption.fontWeight}
              lineHeight={typography.caption.lineHeight}
              color={colors.textMuted}
            >
              Đang mở
            </Text>
          </Card>
        </XStack>
      </Animated.View>
      {error ? (
        <Text
          fontSize={typography.body.fontSize}
          fontWeight={typography.body.fontWeight}
          lineHeight={typography.body.lineHeight}
          color={colors.danger}
        >
          {error}
        </Text>
      ) : null}

      <Animated.View entering={listEntering(1)}>
        <Button title="Quản lý câu hỏi" onPress={() => navigation.navigate('QuestionList')} />
      </Animated.View>
      <Animated.View entering={listEntering(2)}>
        <Button title="Quản lý đề thi" onPress={() => navigation.navigate('ExamList')} />
      </Animated.View>
      <Animated.View entering={listEntering(3)}>
        <Button title="Đăng xuất" variant="secondary" onPress={logout} />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    maxWidth: 860,
    width: '100%',
    alignSelf: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
});
