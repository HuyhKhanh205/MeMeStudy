import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useLayoutEffect, useState } from 'react';
import {
  ImageBackground,
  Modal,
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
import TextField from '../../components/TextField';
import { useAuth } from '../../hooks/useAuth';
import { useResponsive } from '../../hooks/useResponsive';
import type { UserStackParamList, UserTabParamList } from '../../navigation/types';
import { getErrorMessage } from '../../services/http';
import { subscribeToStore } from '../../services/mock/data';
import { queryErrorMessage, useGetMyResultsQuery } from '../../store/api';
import { colors, gameColors, gameFonts, spacing } from '../../theme';
import { confirm, showAlert } from '../../utils/confirm';

type Props = CompositeScreenProps<
  BottomTabScreenProps<UserTabParamList, 'Profile'>,
  NativeStackScreenProps<UserStackParamList>
>;

function formatRoleLabel(role?: string): string {
  if (role === 'ADMIN') return 'Quản trị';
  if (role === 'TEACHER') return 'Giáo viên';
  return 'Học sinh';
}

const GENDER_OPTIONS = ['Nam', 'Nữ', 'Khác'] as const;

export default function ProfileScreen({ navigation }: Props) {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const { isLandscape, isTablet } = useResponsive();
  const { data: results, isLoading, error, refetch } = useGetMyResultsQuery();

  // State cho Modal Chỉnh sửa thông tin cá nhân (Họ tên, giới tính, ngày sinh, lớp học)
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editFullName, setEditFullName] = useState(user?.fullName ?? 'Nguyễn Văn An');
  const [editGender, setEditGender] = useState(user?.gender ?? 'Nam');
  const [editBirthDate, setEditBirthDate] = useState(user?.birthDate ?? '15/05/2015');
  const [editClassName, setEditClassName] = useState(user?.className ?? 'Lớp 5A');
  const [editError, setEditError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // State cho Modal Đổi mật khẩu riêng biệt
  const [pwdModalVisible, setPwdModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [savingPwd, setSavingPwd] = useState(false);

  const handleOpenEditModal = () => {
    setEditFullName(user?.fullName ?? 'Nguyễn Văn An');
    setEditGender(user?.gender ?? 'Nam');
    setEditBirthDate(user?.birthDate ?? '15/05/2015');
    setEditClassName(user?.className ?? 'Lớp 5A');
    setEditError(null);
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editFullName.trim()) {
      setEditError('Họ và tên không được để trống.');
      return;
    }
    if (!editBirthDate.trim()) {
      setEditError('Vui lòng nhập ngày tháng năm sinh (ví dụ: 15/05/2015).');
      return;
    }
    if (!editClassName.trim()) {
      setEditError('Vui lòng nhập lớp học (ví dụ: Lớp 5A).');
      return;
    }

    setSavingProfile(true);
    setEditError(null);
    try {
      await updateProfile({
        fullName: editFullName.trim(),
        gender: editGender,
        birthDate: editBirthDate.trim(),
        className: editClassName.trim(),
      });
      setSavingProfile(false);
      setEditModalVisible(false);
      void showAlert('Thành công', 'Đã cập nhật thông tin cá nhân của bạn!');
    } catch (e) {
      setEditError(getErrorMessage(e));
      setSavingProfile(false);
    }
  };

  const handleOpenPwdModal = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setPwdError(null);
    setPwdModalVisible(true);
  };

  const handleSavePassword = async () => {
    if (!currentPassword) {
      setPwdError('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (newPassword.length < 6) {
      setPwdError('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPwdError('Mật khẩu mới nhập lại không khớp.');
      return;
    }

    setSavingPwd(true);
    setPwdError(null);
    try {
      await changePassword({
        currentPassword,
        newPassword,
      });
      setSavingPwd(false);
      setPwdModalVisible(false);
      void showAlert('Thành công', 'Đã đổi mật khẩu thành công!');
    } catch (e) {
      setPwdError(getErrorMessage(e));
      setSavingPwd(false);
    }
  };

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
  // Gom nhóm kết quả theo từng vòng thi (roundId): điểm vòng = tổng điểm 3 bài trong vòng (thang 300), khớp 100% với HistoryScreen
  const roundScoresMap = new Map<number, number>();
  const seenRoundExams = new Set<string>();
  for (const item of list) {
    const examKey = `${item.roundId}-${(item as any).examId ?? (item as any).examOrder ?? item.attemptId}`;
    if (seenRoundExams.has(examKey)) continue;
    seenRoundExams.add(examKey);
    roundScoresMap.set(item.roundId, (roundScoresMap.get(item.roundId) ?? 0) + item.score);
  }
  const roundScores = Array.from(roundScoresMap.values());
  const attemptCount = roundScores.length;
  const averageScore =
    attemptCount > 0
      ? (
          Math.round(
            (roundScores.reduce((sum, score) => sum + score, 0) / attemptCount) * 10,
          ) / 10
        ).toFixed(1)
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
            <Text style={styles.fullNameText}>{user?.fullName ?? 'Nguyễn Văn An'}</Text>
            <Emoji name="sparkles" size={20} />
          </XStack>

          <View style={styles.rolePill}>
            <Ionicons name="school" size={14} color="#1d4ed8" />
            <Text style={styles.rolePillText}>Vai trò: {roleLabel}</Text>
          </View>
        </YStack>

        <View style={styles.divider} />

        {/* Chi tiết thông tin cá nhân */}
        <YStack gap={10} width="100%">
          <View style={styles.infoRow}>
            <View style={styles.infoLabelRow}>
              <Ionicons name="person-circle-outline" size={18} color="#2563eb" />
              <Text style={styles.infoLabel}>Họ và tên</Text>
            </View>
            <Text style={styles.infoValue}>{user?.fullName ?? 'Nguyễn Văn An'}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabelRow}>
              <Ionicons name="male-female-outline" size={18} color="#8b5cf6" />
              <Text style={styles.infoLabel}>Giới tính</Text>
            </View>
            <Text style={styles.infoValue}>{user?.gender ?? 'Nam'}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabelRow}>
              <Ionicons name="calendar-outline" size={18} color="#f97316" />
              <Text style={styles.infoLabel}>Ngày sinh</Text>
            </View>
            <Text style={styles.infoValue}>{user?.birthDate ?? '15/05/2015'}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabelRow}>
              <Ionicons name="school-outline" size={18} color="#0284c7" />
              <Text style={styles.infoLabel}>Lớp học</Text>
            </View>
            <Text style={styles.infoValue}>{user?.className ?? 'Lớp 5A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabelRow}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#16a34a" />
              <Text style={styles.infoLabel}>Vai trò</Text>
            </View>
            <Text style={[styles.infoValue, styles.infoValueHighlight]}>{roleLabel}</Text>
          </View>
        </YStack>

        {/* 2 nút riêng biệt: Chỉnh sửa thông tin cá nhân & Đổi mật khẩu */}
        <XStack gap={10} width="100%">
          <Pressable
            accessibilityRole="button"
            onPress={handleOpenEditModal}
            style={({ pressed }) => [
              styles.editProfileBtn,
              pressed && { opacity: 0.88 },
            ]}
          >
            <Ionicons name="create-outline" size={16} color="#1d4ed8" />
            <Text style={styles.editProfileBtnText}>Chỉnh sửa thông tin</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={handleOpenPwdModal}
            style={({ pressed }) => [
              styles.changePwdBtn,
              pressed && { opacity: 0.88 },
            ]}
          >
            <Ionicons name="key-outline" size={16} color="#c2410c" />
            <Text style={styles.changePwdBtnText}>Đổi mật khẩu</Text>
          </Pressable>
        </XStack>
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
                  Đã tham gia {attemptCount} vòng thi!
                </Text>
                <Text style={styles.summarySub}>
                  Điểm trung bình vòng: <Text style={styles.summaryHighlight}>{averageScore}/300 điểm</Text>. Xem lại chi tiết từng vòng tại mục Lịch sử.
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

      {/* Modal 1: Chỉnh sửa thông tin cá nhân (Họ tên, giới tính, ngày sinh, lớp học) */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setEditModalVisible(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <WoodLabel text="Chỉnh sửa thông tin cá nhân" fontSize={16} />

            <YStack width="100%" gap={12}>
              <TextField
                label="Họ và tên"
                value={editFullName}
                onChangeText={setEditFullName}
                placeholder="Nhập họ và tên của bạn"
                autoCapitalize="words"
              />

              <YStack gap={6}>
                <Text style={styles.fieldLabel}>Giới tính</Text>
                <View style={styles.genderRow}>
                  {GENDER_OPTIONS.map((g) => {
                    const active = editGender === g;
                    return (
                      <Pressable
                        key={g}
                        accessibilityRole="button"
                        onPress={() => setEditGender(g)}
                        style={[
                          styles.genderPill,
                          active && styles.genderPillActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.genderPillText,
                            active && styles.genderPillTextActive,
                          ]}
                        >
                          {g}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </YStack>

              <TextField
                label="Ngày tháng năm sinh (DD/MM/YYYY)"
                value={editBirthDate}
                onChangeText={setEditBirthDate}
                placeholder="Ví dụ: 15/05/2015"
              />

              <TextField
                label="Lớp học"
                value={editClassName}
                onChangeText={setEditClassName}
                placeholder="Ví dụ: Lớp 5A"
              />

              {editError ? (
                <Text style={styles.editErrorText}>{editError}</Text>
              ) : null}

              <XStack gap={10} marginTop={4}>
                <View style={styles.modalBtnHalf}>
                  <Button
                    title="Hủy"
                    variant="secondary"
                    onPress={() => setEditModalVisible(false)}
                  />
                </View>
                <View style={styles.modalBtnHalf}>
                  <Button
                    title="Lưu thông tin"
                    onPress={handleSaveProfile}
                    loading={savingProfile}
                  />
                </View>
              </XStack>
            </YStack>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal 2: Đổi mật khẩu riêng biệt */}
      <Modal
        visible={pwdModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPwdModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setPwdModalVisible(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <WoodLabel text="Đổi mật khẩu" fontSize={16} />

            <YStack width="100%" gap={12}>
              <TextField
                label="Mật khẩu hiện tại"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Nhập mật khẩu đang dùng"
                secureTextEntry
              />
              <TextField
                label="Mật khẩu mới"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Tối thiểu 6 ký tự"
                secureTextEntry
              />
              <TextField
                label="Nhập lại mật khẩu mới"
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                placeholder="Nhập lại mật khẩu mới"
                secureTextEntry
              />

              {pwdError ? (
                <Text style={styles.editErrorText}>{pwdError}</Text>
              ) : null}

              <XStack gap={10} marginTop={4}>
                <View style={styles.modalBtnHalf}>
                  <Button
                    title="Hủy"
                    variant="secondary"
                    onPress={() => setPwdModalVisible(false)}
                  />
                </View>
                <View style={styles.modalBtnHalf}>
                  <Button
                    title="Cập nhật mật khẩu"
                    onPress={handleSavePassword}
                    loading={savingPwd}
                  />
                </View>
              </XStack>
            </YStack>
          </Pressable>
        </Pressable>
      </Modal>
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
  editProfileBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#93c5fd',
    paddingVertical: 10,
    marginTop: 2,
  },
  editProfileBtnText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 12,
    color: '#1d4ed8',
  },
  changePwdBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff7ed',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#fdba74',
    paddingVertical: 10,
    marginTop: 2,
  },
  changePwdBtnText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 12,
    color: '#c2410c',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderPillText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 13,
    color: '#475569',
  },
  genderPillTextActive: {
    color: '#ffffff',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fffdf8',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#bfdbfe',
    padding: 18,
    alignItems: 'center',
    gap: 14,
    boxShadow: '0px 4px 0px 0px #60a5fa',
  },
  modalBtnHalf: {
    flex: 1,
  },
  editErrorText: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 12,
    color: colors.danger,
    textAlign: 'center',
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
