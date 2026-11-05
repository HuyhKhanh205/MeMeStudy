import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { Animated, listEntering } from '../../components/motion';
import EmojiBadge from '../../components/EmojiBadge';
import Screen from '../../components/Screen';
import { useAuth } from '../../hooks/useAuth';
import type { UserStackParamList, UserTabParamList } from '../../navigation/types';
import { colors, typography } from '../../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<UserTabParamList, 'Home'>,
  NativeStackScreenProps<UserStackParamList>
>;

export default function HomeScreen({ navigation }: Props) {
  const { user, logout } = useAuth();

  return (
    <Screen scroll>
      <Animated.View entering={listEntering(0)}>
        <Card style={styles.row}>
          <EmojiBadge name="owl" tone="peach" size={64} />
          <View style={styles.flex}>
            <Text style={styles.greeting}>Xin chào, {user?.fullName}</Text>
            <Text style={styles.muted}>Tài khoản: {user?.username}</Text>
          </View>
        </Card>
      </Animated.View>

      <Animated.View entering={listEntering(1)}>
        <Card style={styles.row} onPress={() => navigation.navigate('RoundList')}>
          <EmojiBadge name="memo" tone="sky" />
          <View style={styles.flex}>
            <Text style={styles.cardTitle}>Vào thi</Text>
            <Text style={styles.muted}>Xem danh sách vòng thi đang mở và bắt đầu làm bài.</Text>
          </View>
        </Card>
      </Animated.View>

      <Animated.View entering={listEntering(2)}>
        <Card style={styles.row} onPress={() => navigation.navigate('History')}>
          <EmojiBadge name="trophy" tone="cream" />
          <View style={styles.flex}>
            <Text style={styles.cardTitle}>Lịch sử</Text>
            <Text style={styles.muted}>Xem lại điểm các lượt thi đã nộp.</Text>
          </View>
        </Card>
      </Animated.View>

      <Animated.View entering={listEntering(3)}>
        <Button title="Đăng xuất" variant="secondary" onPress={logout} />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  flex: {
    flex: 1,
    gap: 4,
  },
  greeting: {
    ...typography.heading,
    color: colors.text,
  },
  cardTitle: {
    ...typography.heading,
    color: colors.primary,
  },
  muted: {
    ...typography.body,
    color: colors.textMuted,
  },
});
