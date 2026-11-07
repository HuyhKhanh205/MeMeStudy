import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useLayoutEffect } from 'react';
import {
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CircleButton, GameButton, WoodLabel } from '../../components/game';
import Emoji from '../../components/Emoji';
import { Float } from '../../components/motion';
import { useAuth } from '../../hooks/useAuth';
import type { UserStackParamList, UserTabParamList } from '../../navigation/types';
import { gameColors, gameFonts, gameGradients, gameShadows, spacing } from '../../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<UserTabParamList, 'Home'>,
  NativeStackScreenProps<UserStackParamList>
>;

export default function HomeScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Lấy 2 chữ cái đầu của tên làm avatar viết tắt (ví dụ: Mai Anh -> MA)
  const initials = user?.fullName
    ? user.fullName
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .slice(-2)
        .join('')
        .toUpperCase()
    : 'MA';

  const handleOpenSettings = () => {
    Alert.alert(
      'Tài khoản MeMeStudy',
      `Học sinh: ${user?.fullName || 'Chưa cập nhật'}\nTài khoản: ${user?.username || ''}`,
      [
        { text: 'Đóng', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <ImageBackground
      source={require('../../../assets/background/Home.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top > 0 ? insets.top + 8 : 20,
            paddingBottom: insets.bottom > 0 ? insets.bottom + 24 : 32,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header: Logo, Slogan, Avatar, Settings */}
        <View style={styles.headerRow}>
          <View style={styles.brandCol}>
            <Text style={styles.brandTitle}>MeMeStudy</Text>
            <View style={styles.sloganPill}>
              <Text style={styles.sloganText}>Học vui – Ôn tốt – Cùng MeMe!</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <CircleButton
              icon="settings-sharp"
              accessibilityLabel="Cài đặt và tài khoản"
              onPress={handleOpenSettings}
              tone="blue"
            />
          </View>
        </View>

        {/* 2. Badge sao & streak chuỗi ngày học */}
        <View style={styles.statPill}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={16} color="#ffc93c" />
            <Text style={styles.statText}>120 sao</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="flame" size={16} color="#ff7a18" />
            <Text style={styles.statText}>5 ngày liên tiếp</Text>
          </View>
        </View>

        {/* 3. Mascot Cú MeMe + Bong bóng lời thoại */}
        <View style={styles.mascotSection}>
          <Float distance={6} duration={2400} style={styles.mascotBox}>
            <Emoji name="owl" size={88} />
            <View style={styles.gradCap}>
              <Emoji name="graduationCap" size={44} />
            </View>
          </Float>

        </View>

        {/* 4. Nút Game 3D to: Bắt đầu ôn tập */}
        <GameButton
          label="Bắt đầu ôn tập"
          pulse
          onPress={() => navigation.navigate('RoundList')}
          style={styles.mainGameButton}
        />

        {/* 5. Section: Hành trình ôn tập */}
        <View style={styles.sectionWrap}>
          <WoodLabel text="Hành trình ôn tập" fontSize={16} style={styles.sectionWoodLabel} />

          <View style={styles.journeyCardsRow}>
            {/* Thẻ 1: Đề kiểm tra (màu xanh bạc hà) */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Đề kiểm tra"
              onPress={() => navigation.navigate('RoundList')}
              style={[styles.journeyCard, styles.journeyMintCard]}
            >
              <View style={styles.journeyCardHeader}>
                <View style={[styles.stepCircle, styles.stepGreenCircle]}>
                  <Text style={styles.stepNumText}>1</Text>
                </View>
                <Text style={styles.journeyCardTitle}>Đề kiểm tra</Text>
              </View>
              <Text style={styles.journeyCardSub}>Giáo viên giao</Text>
              <View style={styles.journeyCardFooter}>
                <View style={styles.badgeLeft}>
                  <Emoji name="books" size={20} />
                  <Text style={[styles.badgeLeftText, { color: '#166534' }]}>3/10 đề</Text>
                </View>
                <View style={[styles.circleArrow, { backgroundColor: '#22c55e' }]}>
                  <Ionicons name="chevron-forward" size={16} color="#ffffff" />
                </View>
              </View>
            </Pressable>

            {/* Thẻ 2: Tài liệu ôn (màu tím lilac) */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tài liệu ôn"
              onPress={() => navigation.navigate('History')}
              style={[styles.journeyCard, styles.journeyLilacCard]}
            >
              <View style={styles.journeyCardHeader}>
                <View style={[styles.stepCircle, styles.stepPurpleCircle]}>
                  <Text style={styles.stepNumText}>2</Text>
                </View>
                <Text style={styles.journeyCardTitle}>Tài liệu ôn</Text>
              </View>
              <Text style={styles.journeyCardSub}>PDF • Word • Ảnh</Text>
              <View style={styles.journeyCardFooter}>
                <View style={styles.badgeLeft}>
                  <Emoji name="clipboard" size={20} />
                  <Text style={[styles.badgeLeftText, { color: '#6b21a8' }]}>5 mới</Text>
                </View>
                <View style={[styles.circleArrow, { backgroundColor: '#9333ea' }]}>
                  <Ionicons name="chevron-forward" size={16} color="#ffffff" />
                </View>
              </View>
            </Pressable>
          </View>
        </View>

        {/* 6. Section: Mới từ thầy cô & bố mẹ */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeaderBetween}>
            <WoodLabel text="Mới từ thầy cô & bố mẹ" fontSize={15} />
            <Pressable
              onPress={() => navigation.navigate('RoundList')}
              hitSlop={8}
            >
              <Text style={styles.seeAllText}>Xem tất cả ›</Text>
            </Pressable>
          </View>

          {/* Thẻ bài tập mẫu */}
          <View style={styles.assignmentCard}>
            <View style={styles.docIconBox}>
              <Ionicons name="document-text" size={20} color="#0284c7" />
              <Text style={styles.pdfLabel}>PDF</Text>
            </View>

            <View style={styles.assignmentInfo}>
              <Text style={styles.assignmentTitle} numberOfLines={1}>
                Đề ôn Unit 5 – My hobbies
              </Text>
              <Text style={styles.assignmentMeta}>
                Cô Lan • 20 câu • Hạn 30/10
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ôn ngay"
              onPress={() => navigation.navigate('RoundList')}
              style={styles.reviewBtnWrap}
            >
              <LinearGradient
                colors={gameGradients.greenAnswer}
                style={styles.reviewBtnGradient}
              >
                <Text style={styles.reviewBtnText}>Ôn ngay</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>

        {/* 7. Bottom Action Tabs: Thành tích & Quà hôm nay */}
        <View style={styles.bottomTabsRow}>
          {/* Nút Thành tích */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Thành tích"
            onPress={() => navigation.navigate('History')}
            style={styles.bottomTabCard}
          >
            <LinearGradient colors={gameGradients.woodLabel} style={styles.bottomTabGradient}>
              <Emoji name="trophy" size={28} />
              <View style={styles.bottomTabInfo}>
                <Text style={styles.bottomTabTitle}>Thành tích</Text>
                <View style={styles.scorePill}>
                  <Text style={styles.scorePillText}>120/300</Text>
                </View>
              </View>
            </LinearGradient>
          </Pressable>

          {/* Nút Quà hôm nay */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quà hôm nay"
            onPress={() => navigation.navigate('History')}
            style={styles.bottomTabCard}
          >
            <LinearGradient colors={gameGradients.woodLabel} style={styles.bottomTabGradient}>
              <Emoji name="partyPopper" size={28} />
              <View style={styles.bottomTabInfo}>
                <Text style={styles.bottomTabTitle}>Quà hôm nay</Text>
                <View style={styles.starsRow}>
                  <Ionicons name="star" size={13} color="#ffc93c" />
                  <Ionicons name="star" size={13} color="#ffc93c" />
                  <Ionicons name="star" size={13} color="#ffc93c" />
                  <Ionicons name="star-outline" size={13} color="#fcd34d" />
                  <Ionicons name="star-outline" size={13} color="#fcd34d" />
                </View>
              </View>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5CB4F8',
    width:"100%",
    height:"100%",
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: 16,
  },

  /* 1. Header */
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandCol: {
    gap: 4,
  },
  brandTitle: {
    fontFamily: gameFonts.display,
    fontSize: 34,
    lineHeight: 38,
    color: '#ffffff',
    textShadowColor: '#1d4ed8',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 1,
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff0d6',
    borderWidth: 2.5,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 3px 0px 0px #b8743a',
  },
  avatarText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 15,
    color: '#b8743a',
  },

  /* 2. Stat Pill */
  statPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#1d4ed8',
    borderWidth: 2,
    borderColor: '#70a7f7',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    boxShadow: '0px 3px 0px 0px #0b4f95',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 12,
    color: '#ffffff',
  },

  /* 3. Mascot & Speech Bubble */
  mascotSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  mascotBox: {
    width: 100,
    height: 94,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradCap: {
    position: 'absolute',
    top: -16,
    left: 20,
    transform: [{ rotate: '-12deg' }],
  },
  bubbleWrapper: {
    flex: 1,
    marginLeft: 8,
  },
  speechBubble: {
    backgroundColor: '#ffffff',
    borderWidth: 2.5,
    borderColor: gameColors.bubbleBorder,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 12,
    boxShadow: gameShadows.speechBubble,
    alignItems: 'center',
  },
  bubbleText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 13,
    lineHeight: 18,
    color: gameColors.navy,
    textAlign: 'center',
  },

  /* 4. Game Button */
  mainGameButton: {
    width: '100%',
  },

  /* 5. Section: Hành trình ôn tập */
  sectionWrap: {
    gap: 8,
  },
  sectionWoodLabel: {
    alignSelf: 'flex-start',
  },
  journeyCardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  journeyCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 2.5,
    padding: 12,
    justifyContent: 'space-between',
    minHeight: 124,
  },
  journeyMintCard: {
    backgroundColor: '#dff6e4',
    borderColor: '#86efac',
    boxShadow: '0px 4px 0px 0px #4ade80',
  },
  journeyLilacCard: {
    backgroundColor: '#efe4ff',
    borderColor: '#c084fc',
    boxShadow: '0px 4px 0px 0px #a855f7',
  },
  journeyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepGreenCircle: {
    backgroundColor: '#22c55e',
  },
  stepPurpleCircle: {
    backgroundColor: '#9333ea',
  },
  stepNumText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 12,
    color: '#ffffff',
  },
  journeyCardTitle: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 15,
    color: '#0f172a',
  },
  journeyCardSub: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  journeyCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  badgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeLeftText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 13,
  },
  circleArrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* 6. Section: Mới từ thầy cô */
  sectionHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seeAllText: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 13,
    color: '#ffffff',
    textShadowColor: '#6e4119',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 2,
  },
  assignmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff6e3',
    borderWidth: 2.5,
    borderColor: '#f3c88a',
    borderRadius: 20,
    padding: 12,
    boxShadow: '0px 4px 0px 0px #c98a4b',
    gap: 10,
  },
  docIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#e0f2fe',
    borderWidth: 1.5,
    borderColor: '#7dd3fc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfLabel: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 8,
    color: '#0369a1',
    marginTop: -2,
  },
  assignmentInfo: {
    flex: 1,
    gap: 3,
  },
  assignmentTitle: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 14,
    color: '#4a2a10',
  },
  assignmentMeta: {
    fontFamily: gameFonts.bodyBold,
    fontSize: 11,
    color: '#8a6a4a',
  },
  reviewBtnWrap: {
    borderRadius: 16,
    boxShadow: '0px 3px 0px 0px #1e8a52',
  },
  reviewBtnGradient: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#bbf7d0',
  },
  reviewBtnText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 13,
    color: '#ffffff',
  },

  /* 7. Bottom Tabs */
  bottomTabsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  bottomTabCard: {
    flex: 1,
    borderRadius: 16,
    boxShadow: gameShadows.woodLabel,
  },
  bottomTabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#6e4119',
    gap: 10,
  },
  bottomTabInfo: {
    flex: 1,
    gap: 3,
  },
  bottomTabTitle: {
    fontFamily: gameFonts.display,
    fontSize: 14,
    color: '#fff6e3',
  },
  scorePill: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  scorePillText: {
    fontFamily: gameFonts.bodyExtraBold,
    fontSize: 10,
    color: '#ffffff',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
});
