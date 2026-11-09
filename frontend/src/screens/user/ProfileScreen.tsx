import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useLayoutEffect } from 'react';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Emoji from '../../components/Emoji';
import EmojiBadge from '../../components/EmojiBadge';
import ErrorView from '../../components/ErrorView';
import { CircleButton, GameButton, WoodLabel } from '../../components/game';
import LoadingView from '../../components/LoadingView';
import { Animated, Float, PopIn, listEntering } from '../../components/motion';
import { useAuth } from '../../hooks/useAuth';
import { useResponsive } from '../../hooks/useResponsive';
import type { UserStackParamList, UserTabParamList } from '../../navigation/types';
import { subscribeToStore } from '../../services/mock/data';
import { queryErrorMessage, useGetMyResultsQuery } from '../../store/api';
import { colors, gameColors, gameFonts, spacing } from '../../theme';
import { confirm } from '../../utils/confirm';

type Props = CompositeScreenProps<
  BottomTabScreenProps<UserTabParamList, 'Profile'>,
  NativeStackScreenProps<UserStackParamList>
>;

function formatRoleLabel(role?: string): string {
  if (role === 'ADMIN') return 'Quản trị';
  if (role === 'TEACHER') return 'Giáo viên';
  return 'Học sinh';
}

export default function ProfileScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const { isLandscape, isTablet } = useResponsive();
  const { data: results, isLoading, error, refetch } = useGetMyResultsQuery();

  // Ẩn thanh header mặc định của Tab để hiển thị trọn vẹn nền trời của Home.png giống Trang chủ
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Tự động đồng bộ lại kết quả khi người dùng vừa nộp bài mới hoặc chuyển qua tab Cá nhân
  useFocusEffect(
    useCallback(() => {
      void refetch();
      const unsubscribe = subscribeToStore(() => {
        void refetch();
      });
      return unsubscribe;
    }, [refetch]),
  );

  const handleLogout = async () => {
    const ok = await confirm(
      'Đăng xuất tài khoản?',
      'Bạn có chắc chắn muốn đăng xuất khỏi MeMeStudy không?',
      {
        confirmText: 'Đăng xuất',
        cancelText: 'Ở lại',
        destructive: true,
      },
    );
    if (ok) {
      await logout();
    }
  };

  if (isLoading && !results) {
    return <LoadingView message="Đang tải hồ sơ cá nhân..." />;
  }

  const errMsg = queryErrorMessage(error);
  if (errMsg && !results) {
    return <ErrorView message={errMsg} onRetry={refetch} />;
  }

  const list = results ?? [];
  const attemptCount = list.length;
  const averageScore =
    attemptCount > 0
      ? (Math.round((list.reduce((sum, item) => sum + item.score, 0) / attemptCount) * 10) / 10).toFixed(1)
      : '—';

  const roleLabel = formatRoleLabel(user?.role);

  // Khối 1: Thẻ hồ sơ học sinh (Phong cách hoạt hình giống Trang chủ)
  const identitySection = (
    <Animated.View entering={listEntering(0)}>
      <Card style={styles.identityCard}>
        {/* Avatar khung tròn lớn với Cú MeMe đội mũ tốt nghiệp */}
        <PopIn style={styles.avatarPopWrap}>
          <Float distance={6} duration={2400}>
            <View style={styles.avatarCircle}>
              <Emoji name="owl" size={78} />
              <View style={styles.gradCapBadge}>
                <Emoji name="graduationCap" size={42} />
              </View>
            </View>
          </Float>
        </PopIn>

        <YStack alignItems="center" gap={4}>
          <XStack alignItems="center" gap={6}>
            <Emoji name="sparkles" size={20} />
            <Text style={styles.fullNameText}>{user?.fullName ?? 'Người dùng'}</Text>
            <Emoji name="sparkles" size={20} />
          </XStack>

          <Text style={styles.usernameText}>@{user?.username ?? 'user'}</Text>

          <View style={styles.rolePill}>
            <Ionicons name="school" size={14} color="#1d4ed8" />
            <Text style={styles.rolePillText}>Vai trò: {roleLabel}</Text>
          </View>
        </YStack>

        <View style={styles.divider} />

        {/* Chi tiết thông tin tài khoản */}
        <YStack gap={10} width="100%">
          <View style={styles.infoRow}>
            <View style={styles.infoLabelRow}>
              <Ionicons name="person-circle-outline" size={18} color="#2563eb" />
              <Text style={styles.infoLabel}>Họ và tên</Text>
            </View>
            <Text style={styles.infoValue}>{user?.fullName ?? '—'}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabelRow}>
              <Ionicons name="at-circle-outline" size={18} color="#f97316" />
              <Text style={styles.infoLabel}>Tên đăng nhập</Text>
            </View>
            <Text style={styles.infoValue}>{user?.username ?? '—'}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabelRow}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#16a34a" />
              <Text style={styles.infoLabel}>Vai trò</Text>
            </View>
            <Text style={[styles.infoValue, styles.infoValueHighlight]}>{roleLabel}</Text>
          </View>
        </YStack>
      </Card>
    </Animated.View>
  );

  // Khối 2: Thành tích học tập + Trạng thái kết quả + Nút Đăng xuất
  const statsAndActionsSection = (
    <YStack gap={14}>
      {/* Bảng thành tích học tập */}
      <Animated.View entering={listEntering(1)}>
        <YStack gap={8}>
          <WoodLabel text="Thành tích học tập" fontSize={15} style={styles.woodLabelLeft} />

          <XStack gap={12}>
            <Card style={[styles.statCard, styles.statCardBlue]}>
              <EmojiBadge name="memo" tone="sky" size={50} />
              <Text style={[styles.statNumber, { color: '#1d4ed8' }]}>{attemptCount}</Text>
              <Text style={styles.statCaption}>Số lượt thi</Text>
            </Card>

            <Card style={[styles.statCard, styles.statCardOrange]}>
              <EmojiBadge name="trophy" tone="cream" size={50} />
              <Text style={[styles.statNumber, { color: '#ea580c' }]}>{averageScore}</Text>
              <Text style={styles.statCaption}>Điểm trung bình</Text>
            </Card>
          </XStack>
        </YStack>
      </Animated.View>

      {/* Trạng thái chưa có kết quả hoặc tóm tắt lịch sử */}
      {attemptCount === 0 ? (
        <Animated.View entering={listEntering(2)}>
          <Card style={styles.emptyCard}>
            <Float distance={5} duration={2200}>
              <Emoji name="owl" size={68} />
            </Float>
            <Text style={styles.emptyTitle}>Bạn chưa có kết quả bài thi nào</Text>
            <Text style={styles.emptySub}>
              Hãy bắt đầu làm bài ở mục Vòng thi để Cú MeMe thống kê số lượt thi và điểm trung bình cho bạn nhé!
            </Text>
            <GameButton
              label="Bắt đầu ôn tập ngay"
              pulse
              onPress={() => navigation.navigate('RoundList')}
              style={styles.fullWidthBtn}
            />
          </Card>
        </Animated.View>
      ) : (
        <Animated.View entering={listEntering(2)}>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryTopRow}>
              <EmojiBadge name="partyPopper" tone="mint" size={46} />
              <View style={styles.summaryTextCol}>
                <Text style={styles.summaryTitle}>
                  Đã hoàn thành {attemptCount} lượt thi!
                </Text>
                <Text style={styles.summarySub}>
                  Điểm trung bình hiện tại: <Text style={styles.summaryHighlight}>{averageScore} điểm</Text>. Xem lại chi tiết từng bài tại mục Lịch sử.
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('History')}
              style={({ pressed }) => [
                styles.historyBtn,
                pressed && { opacity: 0.9 },
              ]}
            >
              <Ionicons name="trophy-outline" size={16} color="#1d4ed8" />
              <Text style={styles.historyBtnText}>Xem toàn bộ lịch sử bài thi →</Text>
            </Pressable>
          </Card>
        </Animated.View>
      )}

      {/* Nút Đăng xuất nổi bật */}
      <Animated.View entering={listEntering(3)}>
        <Button
          title="Đăng xuất tài khoản"
          variant="danger"
          onPress={handleLogout}
          style={styles.logoutBtn}
        />
      </Animated.View>
    </YStack>
  );

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
            paddingBottom: insets.bottom > 0 ? insets.bottom + 24 : 36,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Thanh tiêu đề trên cùng đồng bộ với Trang chủ / Vòng thi / Lịch sử */}
        <XStack justifyContent="space-between" alignItems="center">
          <YStack gap={4}>
            <WoodLabel text="Hồ sơ cá nhân" fontSize={18} />
            <View style={styles.sloganPill}>
              <Text style={styles.sloganText}>Học vui – Ôn tốt – Cùng MeMe!</Text>
            </View>
          </YStack>

          <CircleButton
            icon="home"
            accessibilityLabel="Về trang chủ"
            onPress={() => navigation.navigate('Home')}
            tone="blue"
          />
        </XStack>

        {isLandscape ? (
          <View style={styles.landscapeColumns}>
            <View style={styles.landscapeLeftCol}>{identitySection}</View>
            <View style={styles.landscapeRightCol}>{statsAndActionsSection}</View>
          </View>
        ) : (
          <>
            {identitySection}
            {statsAndActionsSection}
          </>
        )}
      </ScrollView>
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
    gap: 14,
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
  },
  scrollContentWide: {
    maxWidth: 920,
  },
  sloganPill: {
    backgroundColor: gameColors.orange,
    borderWidth: 2,
    borderColor: '#ffcf96',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  sloganText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 11,
    color: '#ffffff',
  },
  landscapeColumns: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  landscapeLeftCol: {
    flex: 1,
  },
  landscapeRightCol: {
    flex: 1.15,
  },
  woodLabelLeft: {
    alignSelf: 'flex-start',
  },
  identityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    borderWidth: 2.5,
    borderColor: '#bfdbfe',
    padding: spacing.md,
    alignItems: 'center',
    gap: 12,
    boxShadow: '0px 4px 0px 0px #60a5fa',
  },
  avatarPopWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  avatarCircle: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: '#fff0d6',
    borderWidth: 3.5,
    borderColor: '#fed7aa',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    boxShadow: '0px 4px 0px 0px #fb923c',
  },
  gradCapBadge: {
    position: 'absolute',
    top: -14,
    right: -4,
    transform: [{ rotate: '12deg' }],
  },
  fullNameText: {
    fontFamily: gameFonts.display,
    fontSize: 22,
    color: '#1e293b',
    textAlign: 'center',
  },
  usernameText: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 13,
    color: '#64748b',
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 2,
    borderWidth: 1.5,
    borderColor: '#93c5fd',
  },
  rolePillText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 12,
    color: '#1d4ed8',
  },
  divider: {
    width: '100%',
    height: 1.5,
    backgroundColor: '#e2e8f0',
    marginVertical: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  infoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoLabel: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 12,
    color: '#64748b',
  },
  infoValue: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 13,
    color: '#1e293b',
  },
  infoValueHighlight: {
    color: '#16a34a',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 2.5,
    paddingVertical: 14,
    paddingHorizontal: 10,
    gap: 4,
  },
  statCardBlue: {
    borderColor: '#bfdbfe',
    boxShadow: '0px 4px 0px 0px #60a5fa',
  },
  statCardOrange: {
    borderColor: '#fed7aa',
    boxShadow: '0px 4px 0px 0px #fb923c',
  },
  statNumber: {
    fontFamily: gameFonts.display,
    fontSize: 28,
    lineHeight: 34,
    marginTop: 2,
  },
  statCaption: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    borderWidth: 2.5,
    borderColor: '#bfdbfe',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 8,
    boxShadow: '0px 4px 0px 0px #60a5fa',
  },
  emptyTitle: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 15,
    color: '#1e293b',
    textAlign: 'center',
  },
  emptySub: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
  fullWidthBtn: {
    width: '100%',
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: '#fffdfa',
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: '#bbf7d0',
    padding: spacing.md,
    gap: 12,
    boxShadow: '0px 4px 0px 0px #22c55e',
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryTextCol: {
    flex: 1,
    gap: 3,
  },
  summaryTitle: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 14,
    color: '#15803d',
  },
  summarySub: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  summaryHighlight: {
    fontFamily: gameFonts.bodyExtraBold,
    color: '#16a34a',
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#93c5fd',
    paddingVertical: 10,
  },
  historyBtnText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 12,
    color: '#1d4ed8',
  },
  logoutBtn: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#b91c1c',
    backgroundColor: colors.danger,
    boxShadow: '0px 4px 0px 0px #991b1b',
  },
});
