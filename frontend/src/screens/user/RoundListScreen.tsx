import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Card from '../../components/Card';
import { Animated, listEntering } from '../../components/motion';
import Emoji from '../../components/Emoji';
import EmojiBadge from '../../components/EmojiBadge';
import ErrorView from '../../components/ErrorView';
import LoadingView from '../../components/LoadingView';
import Screen from '../../components/Screen';
import type { UserStackParamList, UserTabParamList } from '../../navigation/types';
import { queryErrorMessage, useGetRoundsQuery } from '../../store/api';
import { colors, radius, spacing, typography } from '../../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<UserTabParamList, 'RoundList'>,
  NativeStackScreenProps<UserStackParamList>
>;

export default function RoundListScreen({ navigation }: Props) {
  // RTK Query: cache theo key, tự xử lý loading / error / refetch.
  const { data: rounds, error, isLoading, isFetching, refetch } = useGetRoundsQuery();

  if (isLoading) return <LoadingView message="Đang tải vòng thi..." />;
  if (!rounds) return <ErrorView message={queryErrorMessage(error) ?? ''} onRetry={refetch} />;

  return (
    <Screen contentStyle={styles.noPadding}>
      <FlatList
        data={rounds}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Emoji name="owl" size={88} />
            <Text style={styles.muted}>Chưa có vòng thi nào.</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={listEntering(index)}>
            <Card
              disabled={!item.isOpen}
              onPress={() => navigation.navigate('Exam', { roundId: item.id, roundTitle: item.title })}
            >
              <View style={styles.row}>
                <EmojiBadge name={item.isOpen ? 'books' : 'locked'} tone={item.isOpen ? 'mint' : 'lilac'} size={48} />
                <Text style={styles.title}>{item.title}</Text>
                <Text style={[styles.badge, item.isOpen ? styles.badgeOpen : styles.badgeClosed]}>
                  {item.isOpen ? 'Đang mở' : 'Chưa mở'}
                </Text>
              </View>
              {item.description ? <Text style={styles.muted}>{item.description}</Text> : null}
              <Text style={styles.meta}>
                {item.questionCount} câu · {item.durationMinutes} phút
              </Text>
            </Card>
          </Animated.View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  noPadding: {
    padding: 0,
  },
  list: {
    padding: spacing.md,
    gap: spacing.md,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    ...typography.heading,
    color: colors.text,
    flex: 1,
  },
  muted: {
    ...typography.body,
    color: colors.textMuted,
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  badge: {
    ...typography.caption,
    fontWeight: '600',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  badgeOpen: {
    backgroundColor: colors.successLight,
    color: colors.success,
  },
  badgeClosed: {
    backgroundColor: colors.border,
    color: colors.textMuted,
  },
});
