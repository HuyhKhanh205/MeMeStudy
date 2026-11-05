import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme';
import {
  CapsuleHeader,
  PlayfulButton,
} from '../components';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ResultRouteProp = RouteProp<RootStackParamList, 'Result'>;

export const ResultScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ResultRouteProp>();

  const score = route.params?.score ?? 8;
  const total = route.params?.totalQuestions ?? 10;
  const starsEarned = route.params?.starsEarned ?? 80;
  const timeTaken = route.params?.timeTaken ?? '12:40';
  const roundTitle = route.params?.roundTitle ?? 'Đề: Unit 5 – My hobbies • Cô Lan giao';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. Header: Nút X Close + Capsule "Kết quả" */}
      <CapsuleHeader
        title="Kết quả"
        showBack={true}
        isCloseButton={true}
        onPressBack={() => navigation.navigate('Home')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Confetti trang trí */}
        <View style={styles.confettiContainer}>
          <View style={[styles.confettiPiece, { left: 40, top: 10, backgroundColor: '#FF7675' }]} />
          <View style={[styles.confettiPiece, { right: 50, top: 20, backgroundColor: '#55EFC4' }]} />
          <View style={[styles.confettiPiece, { left: 80, top: 35, backgroundColor: '#FDCB6E' }]} />
          <View style={[styles.confettiPiece, { right: 90, top: 40, backgroundColor: '#74B9FF' }]} />
        </View>

        {/* 2. Mascot Cú Xanh Mừng Chiến Thắng */}
        <View style={styles.mascotCelebrateWrapper}>
          <View style={styles.gradCap}>
            <View style={styles.gradCapDiamond} />
            <View style={styles.gradCapTassel} />
          </View>
          <View style={styles.owlBodyBig}>
            <View style={styles.owlEyeLeft}>
              <View style={styles.owlPupil} />
            </View>
            <View style={styles.owlEyeRight}>
              <View style={styles.owlPupil} />
            </View>
            <View style={styles.owlBeak} />
            <View style={styles.owlBellyBig} />
            {/* Cánh dang rộng hân hoan */}
            <View style={styles.wingLeft} />
            <View style={styles.wingRight} />
          </View>
        </View>

        {/* 3. Thẻ Card Kết Quả Lớn Màu Be Viền Gỗ */}
        <View style={styles.resultCard}>
          <View style={styles.cardShadow} />

          <View style={styles.cardFace}>
            {/* Tiêu đề chúc mừng */}
            <Text style={styles.congratsTitle}>Hoàn thành xuất sắc!</Text>

            {/* 3 Ngôi Sao Đánh Giá */}
            <View style={styles.starsRow}>
              <Ionicons name="star" size={38} color="#FFD700" style={styles.starItem} />
              <Ionicons name="star" size={44} color="#FFD700" style={[styles.starItem, { marginTop: -6 }]} />
              <Ionicons name="star-outline" size={38} color="#BDC3C7" style={styles.starItem} />
            </View>

            {/* Điểm số to bản: 8/10 câu đúng */}
            <View style={styles.scoreRow}>
              <Text style={styles.scoreNumber}>{score}/{total}</Text>
              <Text style={styles.scoreUnit}>câu đúng</Text>
            </View>

            {/* Thống kê viên thuốc: Thời gian, Đúng, Sai */}
            <View style={styles.statsPill}>
              <View style={styles.statSubItem}>
                <Ionicons name="time-outline" size={14} color="#5D6D7E" />
                <Text style={styles.statSubText}>{timeTaken}</Text>
              </View>
              <Text style={styles.statSubDivider}>|</Text>
              <View style={styles.statSubItem}>
                <Ionicons name="checkmark-circle" size={14} color="#2ECC71" />
                <Text style={styles.statSubText}>Đúng {score}</Text>
              </View>
              <Text style={styles.statSubDivider}>|</Text>
              <View style={styles.statSubItem}>
                <Ionicons name="close-circle" size={14} color="#E74C3C" />
                <Text style={styles.statSubText}>Sai {total - score}</Text>
              </View>
            </View>

            {/* Thưởng sao cam */}
            <View style={styles.rewardPill}>
              <Ionicons name="star" size={16} color="#FFFFFF" />
              <Text style={styles.rewardText}>+{starsEarned} sao thưởng</Text>
            </View>

            {/* Subtitle đề ôn */}
            <Text style={styles.roundSubtitleText}>{roundTitle}</Text>
          </View>
        </View>

        {/* 4. Section: Câu cần ôn lại */}
        <View style={styles.reviewSection}>
          <View style={styles.reviewTitleBadge}>
            <Text style={styles.reviewTitleText}>Câu cần ôn lại</Text>
          </View>

          <View style={styles.reviewPillsRow}>
            <View style={styles.mistakePill}>
              <Text style={styles.mistakeText}>Câu 3 - Từ vựng</Text>
            </View>
            <View style={styles.mistakePill}>
              <Text style={styles.mistakeText}>Câu 7 - Nghe</Text>
            </View>
          </View>
        </View>

        {/* 5. Nút to 3D "Ôn lại câu sai" */}
        <View style={styles.actionButtonWrapper}>
          <PlayfulButton
            title="Ôn lại câu sai"
            variant="orange"
            size="large"
            showPlayIcon={true}
            onPress={() => navigation.navigate('Exam', { roundId: 'review', roundTitle: 'Ôn lại câu sai' })}
            style={styles.retryButton}
          />
        </View>

        {/* 6. Link chữ "Về trang chủ" */}
        <Pressable
          onPress={() => navigation.navigate('Home')}
          style={styles.homeLinkWrapper}
        >
          <Text style={styles.homeLinkText}>Về trang chủ</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FEF9E7', // Nền vàng kem ấm áp
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    alignItems: 'center',
  },
  confettiContainer: {
    width: '100%',
    height: 40,
    position: 'relative',
  },
  confettiPiece: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  // Mascot hân hoan
  mascotCelebrateWrapper: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  gradCap: {
    position: 'absolute',
    top: 0,
    zIndex: 3,
    alignItems: 'center',
  },
  gradCapDiamond: {
    width: 38,
    height: 14,
    backgroundColor: '#1E272C',
    borderRadius: 2,
  },
  gradCapTassel: {
    position: 'absolute',
    right: -2,
    top: 5,
    width: 3,
    height: 12,
    backgroundColor: '#F39C12',
    borderRadius: 1.5,
  },
  owlBodyBig: {
    width: 60,
    height: 60,
    backgroundColor: '#3498DB',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#2980B9',
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  owlEyeLeft: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#2C3E50',
  },
  owlEyeRight: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#2C3E50',
  },
  owlPupil: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1A252F',
  },
  owlBeak: {
    position: 'absolute',
    top: 26,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 7,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#E67E22',
  },
  owlBellyBig: {
    position: 'absolute',
    bottom: 4,
    width: 30,
    height: 18,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    opacity: 0.9,
  },
  wingLeft: {
    position: 'absolute',
    left: -12,
    top: 18,
    width: 16,
    height: 22,
    backgroundColor: '#2980B9',
    borderRadius: 8,
    transform: [{ rotate: '-35deg' }],
  },
  wingRight: {
    position: 'absolute',
    right: -12,
    top: 18,
    width: 16,
    height: 22,
    backgroundColor: '#2980B9',
    borderRadius: 8,
    transform: [{ rotate: '35deg' }],
  },

  // Thẻ kết quả
  resultCard: {
    width: '100%',
    position: 'relative',
    marginTop: 8,
  },
  cardShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    backgroundColor: '#E6C9A2',
    borderRadius: 24,
    top: 4,
  },
  cardFace: {
    backgroundColor: '#FFFDF9',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#F3DFC1',
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  congratsTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#D35400',
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  starItem: {
    marginHorizontal: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 6,
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.textDark,
  },
  scoreUnit: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
    marginLeft: 6,
  },
  statsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EEF8',
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E8DAEF',
  },
  statSubItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statSubText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34495E',
    marginLeft: 4,
  },
  statSubDivider: {
    color: '#BDC3C7',
    marginHorizontal: 10,
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.orangeMain,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 18,
    marginTop: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FFA726',
  },
  rewardText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    marginLeft: 6,
  },
  roundSubtitleText: {
    fontSize: 11,
    color: '#95A5A6',
    fontWeight: '600',
    marginTop: 4,
  },

  // Review section
  reviewSection: {
    width: '100%',
    marginTop: 18,
    alignItems: 'center',
  },
  reviewTitleBadge: {
    backgroundColor: '#8D5B28',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F9E79F',
    marginBottom: 8,
  },
  reviewTitleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  reviewPillsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  mistakePill: {
    backgroundColor: '#FDEDEC',
    borderWidth: 1,
    borderColor: '#FADBD8',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginHorizontal: 5,
  },
  mistakeText: {
    color: '#C0392B',
    fontSize: 12,
    fontWeight: '700',
  },

  actionButtonWrapper: {
    width: '100%',
    marginTop: 18,
    alignItems: 'center',
  },
  retryButton: {
    width: '85%',
  },
  homeLinkWrapper: {
    marginTop: 14,
    paddingVertical: 6,
  },
  homeLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7F8C8D',
    textDecorationLine: 'underline',
  },
});

